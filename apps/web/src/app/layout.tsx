import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { CommandPaletteProvider } from '@/components/providers/CommandPaletteProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastContainer } from '@/components/ui/ToastContainer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Life Quest',
  description: 'Gamify your life — RPG-style habit tracking',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Life Quest',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#050510',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} antialiased min-h-screen theme-transition`}
        style={{ overscrollBehavior: 'none' }}
      >
        <AuthProvider>
          <ThemeProvider>
            <CommandPaletteProvider>
              {children}
              <ToastContainer />
            </CommandPaletteProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
