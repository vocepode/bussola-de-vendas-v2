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
            __html: `
(function() {
  var path = typeof window !== 'undefined' ? window.location.pathname : '';
  if (path.indexOf('/marco-zero/preview') !== -1 || path.indexOf('/norte/preview') !== -1 || path.indexOf('/raio-x/preview') !== -1 || path.indexOf('/mapa/preview') !== -1) {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('preview-light-theme');
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#000000';
  } else {
    document.documentElement.classList.add('dark');
  }
})();
            `.trim(),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

