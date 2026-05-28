import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Space_Mono, JetBrains_Mono } from 'next/font/google';

const jbMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Track.Lab | Elite Performance OS',
  description: 'Deterministic running calculator website for runners. Elite Performance OS.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`dark ${jbMono.variable}`}>
      <body className="bg-black text-zinc-300 min-h-screen font-mono selection:bg-cyan-500/30 overflow-hidden" suppressHydrationWarning>
        <div className="flex h-screen bg-black">
          <Sidebar />
          <div className="flex-1 flex flex-col items-stretch overflow-hidden relative">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-4 md:p-8 z-10">
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

