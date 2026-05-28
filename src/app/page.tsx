import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { LAB_ROUTES } from '@/data/navigation';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome to Track.Lab
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl text-lg">
          A deterministic running calculator suite. No AI coaching, no stored data, no gimmick metrics. Just pure sport-science math driven by your direct inputs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {LAB_ROUTES.filter(r => r.href !== '/').map((route) => {
          const Icon = route.icon;
          return (
            <Link key={route.href} href={route.href} className="group outline-none">
              <Card className="h-full transition-colors group-hover:border-zinc-300 dark:group-hover:border-zinc-700">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-zinc-900 dark:text-zinc-50" />
                  </div>
                  <CardTitle className="text-base">{route.name}</CardTitle>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
