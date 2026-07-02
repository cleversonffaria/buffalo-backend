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
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRole } from "src/common/enums/user-role.enum";
import { StorageService } from "src/modules/storage/storage.service";
import { createMulterStorage } from "src/modules/storage/storage.utils";

@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post("images")
  @Roles(UserRole.TEACHER)
  @UseInterceptors(FileInterceptor("file", { storage: createMulterStorage() }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.storageService.uploadFile("image", file);
  }

  @Post("videos")
  @Roles(UserRole.TEACHER)
  @UseInterceptors(FileInterceptor("file", { storage: createMulterStorage() }))
  uploadVideo(@UploadedFile() file: Express.Multer.File) {
    return this.storageService.uploadFile("video", file);
  }

  @Post("avatars")
  @Roles(UserRole.TEACHER)
  @UseInterceptors(FileInterceptor("file", { storage: createMulterStorage() }))
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.storageService.uploadFile("avatar", file);
  }

  @Delete()
  @Roles(UserRole.TEACHER)
  deleteFile(@Query("url") url: string) {
    return this.storageService.deleteByUrl(url);
  }

  @Get("files/*")
  getFile(
    @Req() request: Request,
    @Res() response: Response,
    @Headers("range") range?: string
  ) {
    return this.storageService.streamFile(request.params[0], response, range);
  }
}
