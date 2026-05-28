import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jbMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Track.Lab | Running Calculator Suite',
  description: 'Running calculators for pace, zones, race planning, workouts, load, fueling, and more.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jbMono.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-background text-foreground min-h-screen font-sans selection:bg-primary/30 overflow-hidden" suppressHydrationWarning>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col items-stretch overflow-hidden relative">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-4 md:p-8 z-10 custom-scrollbar">
              <div className="max-w-[1400px] mx-auto w-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

