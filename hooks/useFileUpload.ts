import { useMutation } from "@tanstack/react-query";
import { fileService, UploadType, UploadFileResponse } from "@/services/file.service";

export function useFileUpload() {
  return useMutation<UploadFileResponse, Error, { file: File; uploadType: UploadType; entityId: string }>({
    mutationFn: ({ file, uploadType, entityId }) =>
      fileService.uploadFile(file, uploadType, entityId),
  });
}

export function useFileDelete() {
  return useMutation<void, Error, string>({
    mutationFn: (publicId) => fileService.deleteFile(publicId),
  });
}
