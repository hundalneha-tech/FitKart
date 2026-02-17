import { useRouter } from 'next/router';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function Custom404() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Icon */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <p className="text-3xl font-bold text-white mb-2">Page Not Found</p>
          <p className="text-gray-400">The page you're looking for doesn't exist or has been moved.</p>
        </div>

        {/* Decorative element */}
        <div className="mb-8 w-32 h-32 mx-auto bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-700/30 flex items-center justify-center">
          <div className="text-6xl">🔍</div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition border border-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>

        {/* Help text */}
        <p className="mt-8 text-sm text-gray-500">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}
