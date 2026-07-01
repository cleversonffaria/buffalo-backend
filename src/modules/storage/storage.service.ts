import { Injectable, NotFoundException } from "@nestjs/common";
import { existsSync, unlinkSync } from "fs";
import { join } from "path";
import configuration from "src/config/configuration";
import {
  buildPublicFileUrl,
  getRelativeStoragePathFromUrl,
} from "src/modules/storage/storage.utils";
import { StorageFolderType } from "src/modules/storage/storage.constants";

@Injectable()
export class StorageService {
  buildUploadResponse(folderType: StorageFolderType, fileName: string) {
    return {
      success: true,
      url: buildPublicFileUrl(folderType, fileName),
    };
  }

  deleteByUrl(url: string) {
    const relativePath = getRelativeStoragePathFromUrl(url);

    if (!relativePath) {
      return { success: true };
    }

    const absolutePath = join(process.cwd(), configuration().uploadsDir, relativePath);

    if (!existsSync(absolutePath)) {
      throw new NotFoundException("Arquivo não encontrado");
    }

    unlinkSync(absolutePath);
    return { success: true };
  }
}
