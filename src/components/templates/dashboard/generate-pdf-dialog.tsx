"use client";

import * as React from "react";
import { Download } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function GeneratePdfDialog({ defaultDescription }: { defaultDescription: string }) {
  const [description, setDescription] = React.useState(defaultDescription);

  React.useEffect(() => {
    setDescription(defaultDescription);
  }, [defaultDescription]);

  function handleGenerate() {
    const params = new URLSearchParams();
    const trimmedDescription = description.trim();

    if (trimmedDescription) {
      params.set("description", trimmedDescription);
    }

    const url = `/monthly${params.toString() ? `?${params.toString()}` : ""}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Download className="size-4" />
          Gerar PDF
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Gerar PDF</AlertDialogTitle>
          <AlertDialogDescription>
            Adicione uma descrição para o relatório antes de abrir a versão de impressão do navegador.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="pdf-description">
            Descrição
          </label>
          <Input
            autoFocus
            id="pdf-description"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Relatório mensal do condomínio"
            value={description}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleGenerate}>Gerar PDF</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
