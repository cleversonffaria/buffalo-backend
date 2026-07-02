import { memoryStorage } from "multer";
import { extname } from "path";
import configuration from "src/config/configuration";
import {
  STORAGE_FOLDERS,
  StorageFolderType,
} from "src/modules/storage/storage.constants";

export const createStorageFileName = (originalName: string) => {
  const extension = extname(originalName);
  return `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`;
};

export const createMulterStorage = () => {
  return memoryStorage();
};

export const buildStorageObjectKey = (
  folderType: StorageFolderType,
  fileName: string
) => {
  return `${STORAGE_FOLDERS[folderType]}/${fileName}`;
};

export const buildStorageFileUrl = (objectKey: string) => {
  const appUrl = configuration().appUrl.replace(/\/$/, "");
  return `${appUrl}/api/storage/files/${objectKey}`;
};

export const getRelativeStoragePathFromUrl = (url: string) => {
  const appUrl = configuration().appUrl.replace(/\/$/, "");

  if (url.startsWith(`${appUrl}/api/storage/files/`)) {
    return url.replace(`${appUrl}/api/storage/files/`, "");
  }

  if (url.startsWith(`${appUrl}/uploads/`)) {
    return url.replace(`${appUrl}/uploads/`, "");
  }

  try {
    const parsedUrl = new URL(url);
    const pathName = parsedUrl.pathname.replace(/^\/+/, "");

    if (
      pathName.startsWith("avatars/") ||
      pathName.startsWith("exercises/images/") ||
      pathName.startsWith("exercises/videos/")
    ) {
      return pathName;
    }
  } catch {
    return null;
  }

  return null;
};
