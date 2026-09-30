import type { Metadata } from 'next';
import { Kantumruy_Pro } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const kantumruy = Kantumruy_Pro({
  subsets: ['khmer', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-kantumruy',
});

export const metadata: Metadata = {
  title: 'SakuraAPI - Game Top-up Reseller Platform',
  description: 'Enterprise reseller API platform for automatic game top-up stock distribution.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km" className={kantumruy.variable}>
      <body className={`${kantumruy.className} bg-[#0b0914] text-[#f1f0f7] min-h-screen antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
