import type { Metadata } from 'next';
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
  description: 'Gamify your life with quests, XP, and achievements',
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
