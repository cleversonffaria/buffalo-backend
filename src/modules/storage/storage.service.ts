import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { existsSync, unlinkSync } from "fs";
import { join } from "path";
import { Response } from "express";
import { Readable } from "stream";
import configuration from "src/config/configuration";
import { StorageFolderType } from "src/modules/storage/storage.constants";
import {
  buildStorageFileUrl,
  buildStorageObjectKey,
  createStorageFileName,
  getRelativeStoragePathFromUrl,
} from "src/modules/storage/storage.utils";

@Injectable()
export class StorageService {
  private readonly config = configuration();

  async uploadFile(folderType: StorageFolderType, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Arquivo não enviado");
    }

    const r2Client = this.createR2Client();
    const fileName = createStorageFileName(file.originalname);
    const objectKey = buildStorageObjectKey(folderType, fileName);

    await r2Client.send(
      new PutObjectCommand({
        Bucket: this.config.r2.bucketName,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype || "application/octet-stream",
      })
    );

    return {
      success: true,
      url: buildStorageFileUrl(objectKey),
    };
  }

  async deleteByUrl(url: string) {
    const relativePath = getRelativeStoragePathFromUrl(url);

    if (!relativePath) {
      return { success: true };
    }

    if (this.isStorageObjectPath(relativePath)) {
      const r2Client = this.createR2Client();

      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: this.config.r2.bucketName,
          Key: relativePath,
        })
      );

      return { success: true };
    }

    const absolutePath = join(process.cwd(), this.config.uploadsDir, relativePath);

    if (!existsSync(absolutePath)) {
      throw new NotFoundException("Arquivo não encontrado");
    }

    unlinkSync(absolutePath);
    return { success: true };
  }

  async streamFile(objectKey: string, response: Response, range?: string) {
    const normalizedKey = this.normalizeObjectKey(objectKey);
    const r2Client = this.createR2Client();

    try {
      const object = await r2Client.send(
        new GetObjectCommand({
          Bucket: this.config.r2.bucketName,
          Key: normalizedKey,
          Range: range || undefined,
        })
      );

      if (!object.Body) {
        throw new NotFoundException("Arquivo não encontrado");
      }

      response.setHeader("Accept-Ranges", "bytes");

      if (object.ContentType) {
        response.setHeader("Content-Type", object.ContentType);
      }

      if (object.ETag) {
        response.setHeader("ETag", object.ETag);
      }

      if (object.LastModified) {
        response.setHeader("Last-Modified", object.LastModified.toUTCString());
      }

      if (object.ContentRange) {
        response.status(206);
        response.setHeader("Content-Range", object.ContentRange);
      }

      if (object.ContentLength !== undefined) {
        response.setHeader("Content-Length", object.ContentLength.toString());
      }

      await this.pipeBodyToResponse(object.Body, response);
    } catch (error) {
      if (error instanceof NoSuchKey || error instanceof NotFoundException) {
        throw new NotFoundException("Arquivo não encontrado");
      }

      throw error;
    }
  }

  private createR2Client() {
    const { accountId, accessKeyId, secretAccessKey, bucketName } = this.config.r2;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new InternalServerErrorException("R2 não configurado");
    }

    return new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  private isStorageObjectPath(path: string) {
    return (
      path.startsWith("avatars/") ||
      path.startsWith("exercises/images/") ||
      path.startsWith("exercises/videos/")
    );
  }

  private normalizeObjectKey(objectKey: string) {
    const normalizedKey = objectKey.replace(/^\/+/, "");

    if (!this.isStorageObjectPath(normalizedKey) || normalizedKey.includes("..")) {
      throw new BadRequestException("Caminho de arquivo inválido");
    }

    return normalizedKey;
  }

  private async pipeBodyToResponse(body: unknown, response: Response) {
    if (body instanceof Readable) {
      await new Promise<void>((resolve, reject) => {
        body.on("error", reject);
        response.on("finish", resolve);
        response.on("close", resolve);
        body.pipe(response);
      });
      return;
    }

    if (
      body &&
      typeof body === "object" &&
      "transformToWebStream" in body &&
      typeof body.transformToWebStream === "function"
    ) {
      const webStream = await body.transformToWebStream();
      const readable = Readable.fromWeb(webStream as any);

      await new Promise<void>((resolve, reject) => {
        readable.on("error", reject);
        response.on("finish", resolve);
        response.on("close", resolve);
        readable.pipe(response);
      });
      return;
    }

    if (
      body &&
      typeof body === "object" &&
      "transformToByteArray" in body &&
      typeof body.transformToByteArray === "function"
    ) {
      const buffer = Buffer.from(await body.transformToByteArray());
      response.end(buffer);
      return;
    }

    response.end();
  }
}
