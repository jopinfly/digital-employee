import { put, del, list } from "@vercel/blob";

export async function uploadFile(
  file: File,
  userId: string
): Promise<{ url: string; name: string; size: number; mimeType: string }> {
  const filename = `${userId}/${Date.now()}-${file.name}`;
  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
  });
  return {
    url: blob.url,
    name: file.name,
    size: file.size,
    mimeType: file.type,
  };
}

export async function deleteFile(url: string): Promise<void> {
  await del(url);
}

export async function listUserFiles(userId: string) {
  const { blobs } = await list({ prefix: `${userId}/` });
  return blobs;
}
