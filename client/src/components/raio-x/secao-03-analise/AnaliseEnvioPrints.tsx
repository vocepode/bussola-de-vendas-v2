"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SecaoAnalise } from "@/lib/raio-x/schema";

interface AnaliseEnvioPrintsProps {
  secaoAnalise: SecaoAnalise | undefined;
  onChange: (secaoAnalise: SecaoAnalise) => void;
  disabled?: boolean;
}

/**
 * Envio de prints desabilitado na v1.0 (upload exige BLOB_READ_WRITE_TOKEN).
 * Previsto para v2.0.
 */
export function AnaliseEnvioPrints(_props: AnaliseEnvioPrintsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Envio de prints</CardTitle>
        <p className="text-sm text-muted-foreground">
          Envio de prints para análise do Raio-X estará disponível na versão 2.0. Por enquanto, siga com os dados do Instagram e o dashboard.
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4">
          Upload de prints estará disponível na versão 2.0. Na v1.0 siga com os dados do Instagram e o dashboard.
        </p>
      </CardContent>
    </Card>
  );
}
