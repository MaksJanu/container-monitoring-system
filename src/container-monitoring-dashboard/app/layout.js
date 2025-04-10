'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Container Monitoring System</title>
        <meta name="description" content="Real-time Docker container monitoring dashboard" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}