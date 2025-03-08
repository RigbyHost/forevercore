
import { Unbounded as FontSans } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Toaster } from "react-hot-toast"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "GDPS Админ-панель",
  description: "Административная панель для управления GDPS сервером",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.className
        )}
      >
          {children}
          <Toaster
          toastOptions={
            {
              style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
              },
            }
          }
          />
      </body>
    </html>
  )
}
