import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "../components/CookieBanner";

const heading = Newsreader({
  subsets: ["latin"],
  variable: "--font-heading",
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});
const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.yaratakibi.com"),
  title: {
    default: "Yara Takibi — Uzaktan Yara Bakım Takibi",
    template: "%s",
  },
  description:
    "Yaranızın fotoğrafını gönderin, hemşire değerlendirsin. İlk değerlendirme ücretsiz.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${heading.variable} ${body.variable}`}>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
