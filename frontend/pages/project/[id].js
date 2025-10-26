import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <Link href="/projects" className="text-primary-600 hover:text-primary-700 flex items-center mb-4">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Project Details
        </h1>
        <p className="text-gray-600">
          Project ID: {id}
        </p>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Information</h2>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Project ID</h4>
            <p className="text-sm text-gray-600 font-mono">{id}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Status</h4>
            <p className="text-sm text-gray-600">This is a test project detail page</p>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Information</h2>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Router Ready: {router.isReady ? 'Yes' : 'No'}</p>
          <p className="text-sm text-gray-600">Project ID: {id || 'Not available'}</p>
          <p className="text-sm text-gray-600">Query: {JSON.stringify(router.query)}</p>
          <p className="text-sm text-gray-600">Pathname: {router.pathname}</p>
          <p className="text-sm text-gray-600">AsPath: {router.asPath}</p>
        </div>
      </div>
    </div>
  );
}