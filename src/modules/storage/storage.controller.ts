import {
  Controller,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRole } from "src/common/enums/user-role.enum";
import { createMulterStorage } from "src/modules/storage/storage.utils";
import { StorageService } from "src/modules/storage/storage.service";
import { Post } from "@nestjs/common";

@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post("images")
  @Roles(UserRole.TEACHER)
  @UseInterceptors(FileInterceptor("file", { storage: createMulterStorage("image") }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.storageService.buildUploadResponse("image", file.filename);
  }

  @Post("videos")
  @Roles(UserRole.TEACHER)
  @UseInterceptors(FileInterceptor("file", { storage: createMulterStorage("video") }))
  uploadVideo(@UploadedFile() file: Express.Multer.File) {
    return this.storageService.buildUploadResponse("video", file.filename);
  }

  @Post("avatars")
  @Roles(UserRole.TEACHER)
  @UseInterceptors(FileInterceptor("file", { storage: createMulterStorage("avatar") }))
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.storageService.buildUploadResponse("avatar", file.filename);
  }

  @Delete()
  @Roles(UserRole.TEACHER)
  deleteFile(@Query("url") url: string) {
    return this.storageService.deleteByUrl(url);
  }
}
