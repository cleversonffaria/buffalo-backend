import { diskStorage } from "multer";
import { extname, join } from "path";
import { existsSync, mkdirSync } from "fs";
import configuration from "src/config/configuration";
import {
  STORAGE_FOLDERS,
  StorageFolderType,
} from "src/modules/storage/storage.constants";

export const buildStoragePath = (folderType: StorageFolderType) => {
  const basePath = join(process.cwd(), configuration().uploadsDir);
  const relativeFolder = STORAGE_FOLDERS[folderType];
  const absoluteFolder = join(basePath, relativeFolder);

  if (!existsSync(absoluteFolder)) {
    mkdirSync(absoluteFolder, { recursive: true });
  }

  return {
    absoluteFolder,
    relativeFolder,
  };
};

export const createMulterStorage = (folderType: StorageFolderType) => {
  const { absoluteFolder } = buildStoragePath(folderType);

  return diskStorage({
    destination: absoluteFolder,
    filename: (_request, file, callback) => {
      const extension = extname(file.originalname);
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`;
      callback(null, fileName);
    },
  });
};

export const buildPublicFileUrl = (
  folderType: StorageFolderType,
  fileName: string
) => {
  const appUrl = configuration().appUrl.replace(/\/$/, "");
  return `${appUrl}/uploads/${STORAGE_FOLDERS[folderType]}/${fileName}`;
};

export const getRelativeStoragePathFromUrl = (url: string) => {
  const appUrl = configuration().appUrl.replace(/\/$/, "");
  return url.startsWith(`${appUrl}/uploads/`)
    ? url.replace(`${appUrl}/uploads/`, "")
    : null;
};
