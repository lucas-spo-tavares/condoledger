import type { FileAttachment } from "@/types/domain";

export async function buildMultipartPayload(payload: unknown, attachments: FileAttachment[]) {
  const formData = new FormData();
  formData.set("payload", JSON.stringify(payload));

  await Promise.all(
    attachments.map(async (attachment) => {
      if (!attachment.previewUrl.startsWith("blob:")) {
        return;
      }

      const response = await fetch(attachment.previewUrl);
      const fileBlob = await response.blob();
      formData.set(`file:${attachment.id}`, fileBlob, attachment.name);
    })
  );

  return formData;
}
