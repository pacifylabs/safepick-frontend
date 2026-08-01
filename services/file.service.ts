import { csrfHeaders } from "@/lib/session";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export type UploadType =
  | "profile_photos"
  | "child_photos"
  | "school_documents"
  | "delegate_ids"
  | "general";

export interface UploadFileResponse {
  url: string;
  key: string;
}

export const fileService = {
  async uploadFile(
    file: File,
    uploadType: UploadType,
    entityId: string
  ): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadType", uploadType);
    formData.append("entityId", entityId);

    // No Content-Type header: the browser must set the multipart boundary.
    const res = await fetch(`${BASE_URL}/files/upload`, {
      method: "POST",
      credentials: "include",
      headers: csrfHeaders("POST"),
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const msg = data?.message || "Upload failed";
      throw new Error(msg);
    }

    return res.json();
  },

  async deleteFile(publicId: string): Promise<void> {
    const res = await fetch(
      `${BASE_URL}/files/${encodeURIComponent(publicId)}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: csrfHeaders("DELETE"),
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const msg = data?.message || "Delete failed";
      throw new Error(msg);
    }
  },
};
