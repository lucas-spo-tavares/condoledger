"use client";

import * as React from "react";
import { FileText, Image as ImageIcon, Plus, X } from "lucide-react";
import type { Control, FieldPath, FieldValues, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AttachmentCardItem = {
  id: string;
  name: string;
  previewUrl: string;
  type: string;
};

type AttachmentFilesCardProps<TFieldValues extends FieldValues> = {
  accept?: string;
  addLabel?: string;
  control: Control<TFieldValues>;
  description?: string;
  emptyLabel?: string;
  multiple?: boolean;
  name: FieldPath<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  title: string;
};

function isBlobUrl(url: string) {
  return url.startsWith("blob:");
}

function isImage(type: string) {
  return type === "image/jpeg" || type === "image/png";
}

function isPdf(type: string) {
  return type === "application/pdf";
}

function createAttachment(file: File): AttachmentCardItem {
  return {
    id: crypto.randomUUID(),
    name: file.name,
    previewUrl: URL.createObjectURL(file),
    type: file.type
  };
}

export function AttachmentFilesCard<TFieldValues extends FieldValues>({
  accept = "application/pdf,image/jpeg,image/png",
  addLabel = "Adicionar arquivos",
  control,
  description = "Adicione comprovantes, PDFs e fotos em um mesmo lugar.",
  emptyLabel = "Nenhum arquivo anexado ainda.",
  multiple = true,
  name,
  setValue,
  title
}: AttachmentFilesCardProps<TFieldValues>) {
  const value = useWatch({ control, name }) as AttachmentCardItem[] | string | undefined;
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const previewUrlsRef = React.useRef<string[]>([]);
  const [singlePreview, setSinglePreview] = React.useState<AttachmentCardItem | null>(null);

  React.useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        if (isBlobUrl(url)) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const items = React.useMemo(() => {
    if (multiple) {
      return (Array.isArray(value) ? value : []).map((item) => ({
        id: item.id,
        name: item.name,
        previewUrl: item.previewUrl,
        type: item.type
      }));
    }

    if (singlePreview) {
      return [singlePreview];
    }

    if (!value || Array.isArray(value)) {
      return [];
    }

    return [
      {
        id: "single-attachment",
        name: value,
        previewUrl: value,
        type: value.toLowerCase().endsWith(".pdf") ? "application/pdf" : ""
      }
    ];
  }, [multiple, singlePreview, value]);

  function syncPreviewUrls(nextItems: AttachmentCardItem[]) {
    previewUrlsRef.current.forEach((url) => {
      if (isBlobUrl(url)) {
        URL.revokeObjectURL(url);
      }
    });

    previewUrlsRef.current = nextItems.map((item) => item.previewUrl).filter(isBlobUrl);
  }

  function updateValue(nextItems: AttachmentCardItem[]) {
    syncPreviewUrls(nextItems);

    if (multiple) {
      setValue(name, nextItems as never, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });
      return;
    }

    setValue(name, (nextItems[0]?.name ?? "") as never, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  }

  function handleAddFiles() {
    inputRef.current?.click();
  }

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    const acceptedFiles = files.filter((file) => {
      return file.type === "application/pdf" || file.type === "image/jpeg" || file.type === "image/png";
    });

    if (!acceptedFiles.length) {
      event.target.value = "";
      return;
    }

    if (multiple) {
      const nextItems = [
        ...(Array.isArray(value) ? value : []),
        ...acceptedFiles.map((file) => createAttachment(file))
      ];

      updateValue(nextItems);
    } else {
      const file = acceptedFiles[0];
      const nextItems = [createAttachment(file)];
      setSinglePreview(nextItems[0] ?? null);
      updateValue(nextItems);
    }

    event.target.value = "";
  }

  function handleRemoveAttachment(attachmentId: string) {
    if (multiple) {
      const currentItems = Array.isArray(value) ? value : [];
      const target = currentItems.find((item) => item.id === attachmentId);

      if (target?.previewUrl && isBlobUrl(target.previewUrl)) {
        URL.revokeObjectURL(target.previewUrl);
      }

      updateValue(currentItems.filter((item) => item.id !== attachmentId));
      return;
    }

    if (items[0]?.previewUrl && isBlobUrl(items[0].previewUrl)) {
      URL.revokeObjectURL(items[0].previewUrl);
    }

    setSinglePreview(null);
    updateValue([]);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button onClick={handleAddFiles} type="button" variant="outline">
          <Plus className="size-4" />
          {addLabel}
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        <input
          accept={accept}
          className="sr-only"
          multiple={multiple}
          onChange={handleFilesSelected}
          ref={inputRef}
          type="file"
        />
        {items.length ? (
          <div className={multiple ? "grid justify-items-center gap-3 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-3"}>
            {items.map((item) => {
              const previewIsImage = isImage(item.type);
              const previewIsPdf = isPdf(item.type);

              return (
                <div
                  className={
                    multiple
                      ? "group relative flex h-72 w-72 flex-col overflow-hidden rounded-lg border bg-muted/20 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      : "group relative mx-auto flex h-80 w-80 flex-col overflow-hidden rounded-lg border bg-muted/20 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  }
                  key={item.id}
                >
                  <button
                    aria-label={`Remover ${item.name}`}
                    className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border bg-background/95 text-muted-foreground shadow-sm transition hover:text-destructive"
                    onClick={() => handleRemoveAttachment(item.id)}
                    type="button"
                  >
                    <X className="size-4" />
                  </button>
                  <a className="flex flex-1 cursor-pointer flex-col" href={item.previewUrl} rel="noreferrer" target="_blank">
                    <div className="relative flex h-56 items-center justify-center overflow-hidden bg-background">
                      {previewIsImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt={item.name} className="h-full w-full object-contain p-4" src={item.previewUrl} />
                      ) : previewIsPdf ? (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-5 text-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <FileText className="size-8" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold">PDF</p>
                            <p className="text-xs text-muted-foreground">Clique para abrir o arquivo.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-5 text-center text-muted-foreground">
                          <ImageIcon className="size-8" />
                          <p className="text-sm">Formato nao suportado para preview.</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-auto shrink-0 border-t bg-card px-4 py-3">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.type}</p>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
