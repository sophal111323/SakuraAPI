import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

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
    <html lang="en">
      <body className="bg-[#0b0914] text-[#f1f0f7] min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
