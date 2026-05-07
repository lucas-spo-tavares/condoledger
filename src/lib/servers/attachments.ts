import "server-only";

import {
  buildAttachmentStorageKey,
  isRemoteAttachmentUrl,
  uploadAttachmentToS3
} from "@/lib/storage/s3";
import type { FileAttachment } from "@/types/domain";

type AttachmentScope = "receipts" | "expenses";

export async function normalizeAttachmentsForPersistence(params: {
  attachments: FileAttachment[];
  entityId: string;
  formData?: FormData;
  scope: AttachmentScope;
}) {
  return Promise.all(
    params.attachments.map(async (attachment) => {
      if (attachment.storageKey) {
        return attachment;
      }

      if (attachment.previewUrl.startsWith("blob:")) {
        const file = params.formData?.get(`file:${attachment.id}`);

        if (!(file instanceof File)) {
          throw new Error(`Arquivo ausente para o anexo ${attachment.id}`);
        }

        const storageKey = buildAttachmentStorageKey({
          scope: params.scope,
          entityId: params.entityId,
          attachmentId: attachment.id
        });

        await uploadAttachmentToS3({
          contentType: file.type || attachment.type,
          fileName: file.name || attachment.name,
          storageKey,
          file
        });

        return {
          ...attachment,
          storageKey
        };
      }

      if (isRemoteAttachmentUrl(attachment.previewUrl)) {
        return {
          ...attachment,
          storageKey: attachment.previewUrl
        };
      }

      return {
        ...attachment,
        storageKey: attachment.previewUrl
      };
    })
  );
}
