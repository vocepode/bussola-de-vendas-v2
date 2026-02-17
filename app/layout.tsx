import "../client/src/index.css";
import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Bússola de Vendas",
  description: "Sistema de implementação do método COMPASS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('dark');",
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

