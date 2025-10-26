import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (router.isReady && id) {
      // Simulate loading project data
      setTimeout(() => {
        setProject({
          id: id,
          title: 'Sample Project',
          status: 'In Progress',
          description: 'This is a sample project description'
        });
        setLoading(false);
      }, 500);
    }
  }, [router.isReady, id]);

  if (!router.isReady || loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
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
          {project?.title || 'Project Details'}
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
            <h4 className="text-sm font-medium text-gray-700 mb-1">Title</h4>
            <p className="text-sm text-gray-600">{project?.title || 'Loading...'}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Status</h4>
            <p className="text-sm text-gray-600">{project?.status || 'Loading...'}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
            <p className="text-sm text-gray-600">{project?.description || 'Loading...'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
