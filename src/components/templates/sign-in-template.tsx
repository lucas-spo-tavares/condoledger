import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function SignInTemplate() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Use o email cadastrado no condominio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              E-mail
            </label>
            <Input id="email" inputMode="email" placeholder="resident@example.com" type="email" />
          </div>
          <Button className="w-full">
            Enviar codigo
            <ArrowRight className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
