import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-lg text-gray-600">Meter not found</p>
        <Link
          href="/"
          className="mt-6 inline-block text-blue-600 hover:text-blue-900"
        >
          ← Back to Overview
        </Link>
      </div>
    </div>
  );
}

