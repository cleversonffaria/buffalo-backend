import { memoryStorage } from "multer";
import { extname } from "path";
import { Request } from "express";
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

export const getRequestBaseUrl = (request: Request) => {
  const forwardedProto = request.headers["x-forwarded-proto"];
  const forwardedHost = request.headers["x-forwarded-host"];
  const protocol =
    typeof forwardedProto === "string"
      ? forwardedProto.split(",")[0].trim()
      : request.protocol;
  const host =
    typeof forwardedHost === "string"
      ? forwardedHost.split(",")[0].trim()
      : request.get("host");

  if (!host) {
    return configuration().appUrl.replace(/\/$/, "");
  }

  return `${protocol}://${host}`.replace(/\/$/, "");
};

export const buildStorageFileUrl = (objectKey: string, baseUrl?: string) => {
  const normalizedBaseUrl = (baseUrl || configuration().appUrl).replace(/\/$/, "");
  return `${normalizedBaseUrl}/api/storage/files/${objectKey}`;
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

    if (pathName.startsWith("api/storage/files/")) {
      return pathName.replace("api/storage/files/", "");
    }

    if (pathName.startsWith("uploads/")) {
      return pathName.replace("uploads/", "");
    }

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

export const resolvePublicFileUrl = (url: string | null | undefined, baseUrl: string) => {
  if (!url) {
    return null;
  }

  const relativePath = getRelativeStoragePathFromUrl(url);

  if (!relativePath) {
    return url;
  }

  return buildStorageFileUrl(relativePath, baseUrl);
};
