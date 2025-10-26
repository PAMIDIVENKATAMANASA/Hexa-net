import { useState, useEffect, useCallback } from 'react';
import { requestsAPI } from '../lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import useRealTimeUpdates from '../hooks/useRealTimeUpdates';
import Link from 'next/link';

// Status badge component
const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'Design In Progress':
        return 'bg-purple-100 text-purple-800';
      case 'Installation In Progress':
        return 'bg-orange-100 text-orange-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

// Progress bar component
const ProgressBar = ({ status }) => {
  const getProgress = (status) => {
    switch (status) {
      case 'New':
        return 0;
      case 'Assigned':
        return 20;
      case 'Design In Progress':
        return 40;
      case 'Installation In Progress':
        return 80;
      case 'Completed':
        return 100;
      case 'Rejected':
        return 0;
      default:
        return 0;
    }
  };

  const progress = getProgress(status);

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

// Project card component
const ProjectCard = ({ project }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {project.title || 'Network Request'}
          </h3>
          <div className="flex items-center space-x-4 mb-2">
            <StatusBadge status={project.status} />
            <span className="text-sm text-gray-500">
              Created: {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link 
            href={`/project-detail?id=${project._id}`}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View Details
          </Link>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">
            {project.status === 'Completed' ? '100%' : 
             project.status === 'New' ? '0%' :
             project.status === 'Assigned' ? '20%' :
             project.status === 'Design In Progress' ? '40%' :
             project.status === 'Installation In Progress' ? '80%' : '0%'}
          </span>
        </div>
        <ProgressBar status={project.status} />
      </div>

      {isExpanded && (
        <div className="border-t pt-4 space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
            <p className="text-sm text-gray-600">
              {project.description || 'No description provided'}
            </p>
          </div>
          
          {project.location && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Location</h4>
              <p className="text-sm text-gray-600">{project.location}</p>
            </div>
          )}

          {project.assignedTo && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Assigned To</h4>
              <p className="text-sm text-gray-600">{project.assignedTo}</p>
            </div>
          )}

          {project.updatedAt && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Last Updated</h4>
              <p className="text-sm text-gray-600">
                {new Date(project.updatedAt).toLocaleString()}
              </p>
            </div>
          )}

          {project.designNotes && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Design Notes</h4>
              <p className="text-sm text-gray-600">{project.designNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function Projects() {
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);


  // Real-time data update callback
  const handleDataUpdate = useCallback((newProjects) => {
    setProjects(newProjects);
    setLastUpdated(new Date());
  }, []);

  // Use real-time updates hook
  const { refresh } = useRealTimeUpdates(handleDataUpdate, 30000);

  useEffect(() => {
    fetchProjects();
  }, []);


  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await requestsAPI.getAll();
      const projectsArray = response.data.requests || [];
      setProjects(projectsArray);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication required. Please login again.');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. You don\'t have permission to view projects.');
      } else {
        toast.error('Failed to fetch projects: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || project.status === filter;
    const matchesSearch = searchTerm === '' || 
                         (project.title && project.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Debug logging
    console.log('Filtering project:', {
      id: project._id,
      title: project.title,
      status: project.status,
      matchesFilter,
      matchesSearch,
      filter,
      searchTerm
    });
    
    return matchesFilter && matchesSearch;
  });

  console.log('Projects count:', projects.length);
  console.log('Filtered projects count:', filteredProjects.length);
  console.log('Current filter:', filter);
  console.log('Search term:', searchTerm);


  const statusCounts = {
    all: projects.length,
    New: projects.filter(p => p.status === 'New').length,
    Assigned: projects.filter(p => p.status === 'Assigned').length,
    'Design In Progress': projects.filter(p => p.status === 'Design In Progress').length,
    'Installation In Progress': projects.filter(p => p.status === 'Installation In Progress').length,
    Completed: projects.filter(p => p.status === 'Completed').length,
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-2">Track the status and progress of all your network projects</p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
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
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="card text-center">
            <div className="text-2xl font-bold text-primary-600">{count}</div>
            <div className="text-sm text-gray-600 capitalize">{status}</div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(statusCounts).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status} ({statusCounts[status]})
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'No projects match your current filters'
                : 'You haven\'t submitted any projects yet'
              }
            </div>
          </div>
        ) : (
          filteredProjects.map(project => (
            <ProjectCard key={project._id} project={project} />
          ))
        )}
      </div>
    </div>
  );
}
