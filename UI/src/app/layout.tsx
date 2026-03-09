import "@/styles/index.css";
import { AppProviders } from "@/app/providers";

export const metadata = {
  title: "MindMark",
  description: "Markdown personal knowledge base",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
