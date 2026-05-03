"use client";

import * as React from "react";
import { FileText, Image as ImageIcon, Upload, File } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FileUploadProps = {
  accept?: string;
  buttonLabel?: string;
  className?: string;
  disabled?: boolean;
  helperText?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  value?: string;
};

function getFileName(value?: string) {
  if (!value) {
    return "";
  }

  return value.split("/").pop() ?? value;
}

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      accept,
      buttonLabel = "Selecionar arquivo",
      className,
      disabled = false,
      helperText = "PDF, PNG ou JPG.",
      onValueChange,
      placeholder = "Nenhum arquivo selecionado",
      value
    },
    forwardedRef
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

    React.useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement, []);

    React.useEffect(() => {
      return () => {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      };
    }, [previewUrl]);

    const fileName = getFileName(value);
    const isImagePreview = Boolean(selectedFile?.type.startsWith("image/"));
    const isPdfPreview = selectedFile?.type === "application/pdf";

    function handleSelectFile(event: React.ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const nextPreviewUrl = URL.createObjectURL(file);

      setSelectedFile(file);
      setPreviewUrl(nextPreviewUrl);
      onValueChange(file.name);
    }

    function handleRemoveFile(event: React.MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
      event.stopPropagation();

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(null);
      setPreviewUrl(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      onValueChange("");
    }

    function handleOpenFilePicker(event: React.MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
      event.stopPropagation();

      inputRef.current?.click();
    }

    return (
      <div className={cn("grid gap-2", className)}>
        <input
          accept={accept}
          className="sr-only"
          disabled={disabled}
          onChange={handleSelectFile}
          ref={inputRef}
          type="file"
        />
        <div className="flex items-center gap-3 rounded-md border border-dashed border-input bg-muted/30 px-3 py-2">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border bg-background text-muted-foreground shadow-sm">
              {previewUrl && isImagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={fileName || "Arquivo selecionado"} className="h-full w-full object-cover" src={previewUrl} />
              ) : previewUrl && isPdfPreview ? (
                <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-emerald-700">
                  <File className="size-5" />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FileText className="size-4" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{fileName || placeholder}</p>
              <p className="truncate text-xs text-muted-foreground">{fileName ? helperText : "Selecione um arquivo do dispositivo."}</p>
              {selectedFile ? (
                <p className="truncate text-xs text-muted-foreground">
                  {selectedFile.type || "tipo desconhecido"}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 sm:flex-row">
            {selectedFile ? (
              <Button disabled={disabled} onClick={handleRemoveFile} size="sm" type="button" variant="ghost">
                Remover
              </Button>
            ) : null}
            <Button
              disabled={disabled}
              onClick={handleOpenFilePicker}
              size="sm"
              type="button"
              variant="outline"
            >
              <Upload className="size-4" />
              {value ? "Trocar arquivo" : buttonLabel}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);
FileUpload.displayName = "FileUpload";
