import { useState, useEffect, useMemo, useCallback } from 'react'; // Added useMemo and useCallback
import { requestsAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';
import RequestForm from '../RequestForm';
import RequestList from '../RequestList';
import Link from 'next/link';
import useRealTimeUpdates from '../../hooks/useRealTimeUpdates';

// SVG Icons for Stats
const FolderIcon = () => (
  <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SparklesIcon = () => (
    <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m11-11v4m-2-2h4m2 11h-4m2 2v-4M12 2v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M4.22 19.78l1.42-1.42m12.72-12.72l1.42-1.42" />
    </svg>
);


// Stat Card Component
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="text-3xl font-semibold text-gray-900">
              {value}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);


export default function ClientDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Real-time data update callback
  const handleDataUpdate = useCallback((newRequests) => {
    setRequests(newRequests);
    setLastUpdated(new Date());
  }, []);

  // Use real-time updates hook
  const { refresh } = useRealTimeUpdates(handleDataUpdate, 30000);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await requestsAPI.getAll();
      setRequests(response.data.requests || []); // Ensure requests is an array
      setLastUpdated(new Date());
    } catch (error) {
      if (!silent) toast.error('Failed to fetch requests');
      setRequests([]); // Set to empty array on error
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleRequestCreated = () => {
    setShowForm(false);
    fetchRequests(); // Refetch requests
    toast.success('Request created successfully!');
  };

  // Calculate stats using useMemo
  const stats = useMemo(() => {
    if (!Array.isArray(requests)) {
      return { total: 0, inProgress: 0, completed: 0, new: 0 };
    }
    const total = requests.length;
    const inProgress = requests.filter(r => 
      ['Assigned', 'Design In Progress', 'Installation In Progress'].includes(r.status)
    ).length;
    const completed = requests.filter(r => r.status === 'Completed').length;
    const newRequests = requests.filter(r => r.status === 'New').length;
    
    return { total, inProgress, completed, new: newRequests };
  }, [requests]);

  // Get recent activity (last 5 requests)
  const recentActivity = useMemo(() => {
    return requests
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5);
  }, [requests]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header with last updated */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={refresh}
            className="btn-secondary flex items-center space-x-2"
            title="Refresh data"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
          <Link href="/projects" className="btn-secondary">
            View All Projects
          </Link>
          <Link href="/settings" className="btn-secondary">
            Settings
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-3">Projects Overview</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Projects" value={stats.total} icon={<FolderIcon />} />
          <StatCard title="New Requests" value={stats.new} icon={<SparklesIcon />} />
          <StatCard title="In Progress" value={stats.inProgress} icon={<ClockIcon />} />
          <StatCard title="Completed" value={stats.completed} icon={<CheckCircleIcon />} />
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-3">Recent Activity</h2>
          <div className="card">
            <div className="space-y-3">
              {recentActivity.map((request, index) => (
                <div key={request._id || index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {request.title || 'Network Request'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {request.status} • {new Date(request.updatedAt || request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      request.status === 'New' ? 'bg-blue-100 text-blue-800' :
                      request.status === 'In Progress' || request.status === 'Design In Progress' || request.status === 'Installation In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link href="/projects" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all projects →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content: New Request + List */}
      <div className="flex justify-between items-center mt-6">
        <h1 className="text-2xl font-bold text-gray-900">My Network Requests</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          Submit New Request
        </button>
      </div>

      {showForm && (
        <div className="card">
          <RequestForm onSuccess={handleRequestCreated} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="card">
        <RequestList requests={requests} />
      </div>
    </div>
  );
}
