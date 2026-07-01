export const STORAGE_FOLDERS = {
  avatar: "avatars",
  image: "exercises/images",
  video: "exercises/videos",
} as const;

export type StorageFolderType = keyof typeof STORAGE_FOLDERS;
