import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Petrobras Prep — Estude com questões reais",
  description: "Plataforma de estudos para o concurso Petrobras. 60+ questões Cesgranrio e CEBRASPE nível técnico com revisão inteligente.",
  keywords: ["Petrobras", "concurso", "Cesgranrio", "questões", "técnico júnior"],
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Petrobras Prep",
    description: "Estude com questões reais da Cesgranrio e CEBRASPE",
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
      </body>
    </html>
  );
}
