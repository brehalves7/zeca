import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Define a variável usada no globals.css
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" className={inter.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}