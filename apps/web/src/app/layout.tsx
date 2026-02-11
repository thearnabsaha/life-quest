import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { CommandPaletteProvider } from '@/components/providers/CommandPaletteProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';

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
        className={`${inter.className} antialiased min-h-screen bg-[#0a0a0a] text-white`}
      >
        <AuthProvider>
          <CommandPaletteProvider>{children}</CommandPaletteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
