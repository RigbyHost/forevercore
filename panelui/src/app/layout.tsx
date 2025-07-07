// src/app/layout.tsx
import { Unbounded as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";

const fontSans = FontSans({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "GDPS Админ-панель",
  description: "Административная панель для управления GDPS сервером",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning className="dark">
      <body
        className={cn(
          "min-h-screen bg-black font-sans antialiased overflow-hidden",
          fontSans.className
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster
            toastOptions={{
              style: {
                borderRadius: "10px",
                background: "rgba(23, 23, 23, 0.8)",
                backdropFilter: "blur(10px)",
                color: "#fff",
                border: "1px solid rgba(63, 63, 70, 0.4)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}