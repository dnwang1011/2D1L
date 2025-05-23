import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Example font
import './globals.css';
import Header from '@/components/layout/Header'; // Import the Header
import Canvas3D from '@/components/canvas/Canvas3D'; // Import the 3D Canvas

// If Lora or other fonts are chosen in tailwind.config.ts, import them too
// import { Lora } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
// const lora = Lora({ subsets: ['latin'], weight: ["400", "700"] }); // Example

export const metadata: Metadata = {
  title: '2Dots1Line V4',
  description: 'Connect your thoughts, illuminate your life.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-backgroundLight text-textDark`}> {/* Ensure textDark for readability */}
        <Canvas3D /> {/* Add the 3D Canvas as a background layer */}
        <div style={{ position: 'relative', zIndex: 1 }}> {/* Content wrapper */}
          <Header />
          <main className="min-h-screen container mx-auto p-4">
            {children}
          </main>
          <footer className="bg-gray-800 text-white p-4 text-center mt-auto">
            © 2025 2Dots1Line
          </footer>
        </div>
      </body>
    </html>
  );
} 