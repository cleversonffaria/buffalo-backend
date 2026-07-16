import {
  Controller,
  Delete,
  Get,
  Headers,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request, Response } from "express";
import { Public } from "src/common/decorators/public.decorator";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRole } from "src/common/enums/user-role.enum";
import { StorageService } from "src/modules/storage/storage.service";
import { createMulterStorage } from "src/modules/storage/storage.utils";

@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  private getObjectKeyFromRequest(request: Request) {
    const wildcardParam =
      request.params?.[0] ||
      request.params?.["0"] ||
      request.path.split("/storage/files/")[1] ||
      request.originalUrl.split("/api/storage/files/")[1];

    return decodeURIComponent((wildcardParam || "").replace(/^\/+/, ""));
  }

  @Post("images")
  @Roles(UserRole.TEACHER)
  @UseInterceptors(FileInterceptor("file", { storage: createMulterStorage() }))
  uploadImage(@Req() request: Request, @UploadedFile() file: Express.Multer.File) {
    return this.storageService.uploadFile("image", request, file);
  }

  @Post("videos")
  @Roles(UserRole.TEACHER)
  @UseInterceptors(FileInterceptor("file", { storage: createMulterStorage() }))
  uploadVideo(@Req() request: Request, @UploadedFile() file: Express.Multer.File) {
    return this.storageService.uploadFile("video", request, file);
  }

  @Post("avatars")
  @Roles(UserRole.TEACHER)
  @UseInterceptors(FileInterceptor("file", { storage: createMulterStorage() }))
  uploadAvatar(@Req() request: Request, @UploadedFile() file: Express.Multer.File) {
    return this.storageService.uploadFile("avatar", request, file);
  }

  @Delete()
  @Roles(UserRole.TEACHER)
  deleteFile(@Query("url") url: string) {
    return this.storageService.deleteByUrl(url);
  }

  @Public()
  @Get("files/*")
  getFile(
    @Req() request: Request,
    @Res() response: Response,
    @Headers("range") range?: string
  ) {
    return this.storageService.streamFile(
      this.getObjectKeyFromRequest(request),
      response,
      range
    );
  }
}
