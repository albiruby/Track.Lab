import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        404 - Page Not Found
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
        The calculator lab you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link 
          href="/" 
          className="px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 rounded-md font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Return Home
        </Link>
        <Link 
          href="/formulas" 
          className="px-4 py-2 bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 rounded-md font-medium text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          View All Formulas
        </Link>
      </div>
    </div>
  );
}
