import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Link from 'next/link';

export default function TreadmillLab() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Treadmill Lab
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl text-lg">
          Treadmill pace equivalents and incline conversions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metadata Available</CardTitle>
          <CardDescription>Calculator function not implemented yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            The mathematical formulas and static data source for this lab exist in the codebase, 
            but the frontend calculator UI has not been implemented yet.
          </p>
          <Link 
            href="/formulas" 
            className="px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 rounded-md font-medium text-sm hover:opacity-90 transition-opacity inline-block"
          >
            View Formula Library
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
