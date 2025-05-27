// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { JSX } from 'react';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: {
    default: 'PropertyBot - AI Real Estate Assistant',
    template: '%s | PropertyBot'
  },
  description: 'Advanced AI-powered chatbot specialized in property management, real estate recommendations, market analysis, and help ticket management.',
  keywords: [
    'real estate',
    'property management',
    'AI chatbot',
    'property search',
    'market analysis',
    'maintenance tickets',
    'GPT-4o',
    'property recommendations'
  ],
  authors: [{ name: 'PropertyBot Team' }],
  creator: 'PropertyBot Team',
  publisher: 'PropertyBot',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'PropertyBot - AI Real Estate Assistant',
    description: 'Advanced AI-powered chatbot for property management and real estate services',
    siteName: 'PropertyBot',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PropertyBot - AI Real Estate Assistant',
    description: 'Advanced AI-powered chatbot for property management and real estate services',
    creator: '@propertybot',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when deploying
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps): JSX.Element {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body 
        className={`${inter.className} antialiased`}
        suppressHydrationWarning={true}
      >
        <div id="root">
          {children}
        </div>
        {/* You can add global scripts here if needed */}
      </body>
    </html>
  );
}