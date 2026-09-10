import { Inter } from "next/font/google";

import "./css/style.css";
import "./css/firefox-performance.css";
import "./css/StyleMobile.css";

import { LoadingScreen } from "@/components/animations/LoadingScreen";
import { ReloadToHome } from "@/components/animations/ReloadToHome";
import { assetUrl } from "@/lib/supabase-storage";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const siteIcon = assetUrl("assets/logoKibot.png");

export const metadata = {
  title: "Rifqi | Software Engineer",
  description:
    "Website portofolio pribadi yang menampilkan project, sertifikat, dan kontak.",
  icons: {
    icon: [
      {
        url: siteIcon,
        type: "image/png",
      },
    ],
    shortcut: [
      {
        url: siteIcon,
        type: "image/png",
      },
    ],
    apple: [
      {
        url: siteIcon,
        type: "image/png",
      },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#020617",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body
        className={`${inter.className} portfolio-loading-active`}
        style={{
          "--portfolio-gradient-blue-image":
            'url("/img/screen/gradient-blue.jpg")',
        }}
      >
        <ReloadToHome />
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
