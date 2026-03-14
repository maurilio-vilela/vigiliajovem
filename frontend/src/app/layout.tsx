import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "II Vigília Jovem",
    template: "%s - Vigília Jovem",
  },
  description: "Participe da Vigília Jovem! Inscreva-se para o evento de evangelização que no dia 06 de dezembro às 22h00 na Paróquia Nossa Senhora de Fátima - Vila Luizão.",
  openGraph: {
    title: "Inscrição - Vigília Jovem",
    description: "Participe da Vigília Jovem! Inscreva-se para o evento de evangelização que no dia 06 de dezembro às 22h00 na Paróquia Nossa Senhora de Fátima - Vila Luizão.",
    url: "https://vigiliajovem.vilelatech.com.br",
    siteName: "II Vigília Jovem",
    images: [
      {
        url: "https://vigiliajovem.vilelatech.com.br/images/logo.png",
        width: 200,
        height: 100,
        alt: "Logotipo da Vigília Jovem",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inscrição - Vigília Jovem",
    description: "Participe da Vigília Jovem! Inscreva-se para o evento de evangelização que no dia 06 de dezembro às 22h00 na Paróquia Nossa Senhora de Fátima - Vila Luizão.",
    images: ["https://vigiliajovem.vilelatech.com.br/images/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}