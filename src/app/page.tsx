import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { LAB_ROUTES } from '@/data/navigation';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-zinc-800 pb-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-mono uppercase text-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          SYS.LAB / INITIALIZE
        </h1>
        <p className="text-zinc-500 max-w-2xl text-xs font-mono uppercase tracking-widest leading-relaxed">
          [ A deterministic running calculator suite. No AI coaching, no stored data, no gimmick metrics. Just pure sport-science math driven by your direct inputs. ]
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {LAB_ROUTES.filter(r => r.href !== '/').map((route) => {
          const Icon = route.icon;
          return (
            <Link key={route.href} href={route.href} className="group outline-none block h-full">
              <Card className="h-full transition-all group-hover:border-cyan-500/50 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.15)] bg-zinc-950/80">
                <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-3 border border-zinc-800 bg-zinc-900 rounded-none group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-colors">
                    <Icon className="w-5 h-5 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <CardTitle className="text-sm font-mono tracking-widest text-zinc-300 group-hover:text-cyan-400 uppercase leading-snug">
                    {route.name.replace(' Lab', '')}
                  </CardTitle>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
