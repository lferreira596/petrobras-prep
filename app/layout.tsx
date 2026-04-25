import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

function getMetadataBase() {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  if (!rawUrl) return new URL("http://localhost:3000");

  try {
    return new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "Prepara Concursos — Quem treina, passa",
  description: "Teste 10 questões grátis sem login. Desbloqueie mais de 500 questões estratégicas, revisão inteligente e simulado para o concurso Petrobras nível técnico.",
  keywords: ["Petrobras", "concurso", "Cesgranrio", "questões", "técnico júnior"],
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Prepara Concursos",
    description: "Teste 10 questões grátis sem login e desbloqueie mais de 500 questões estratégicas para concursos.",
    type: "website",
    images: [{ url: "/icon.png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <meta name="theme-color" content="#08080f"/>
      </head>
      <body style={{margin:0,padding:0,background:"#08080f"}}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
