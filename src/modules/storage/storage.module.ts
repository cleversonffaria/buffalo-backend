import { Module } from "@nestjs/common";
import { StorageController } from "src/modules/storage/storage.controller";
import { StorageService } from "src/modules/storage/storage.service";

@Module({
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
