import { useState, useEffect } from 'react';
import { requestsAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';
import DesignerRequestList from '../DesignerRequestList';

export default function DesignerDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await requestsAPI.getAll();
      setRequests(response.data.requests);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestUpdated = () => {
    fetchRequests();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Designer Dashboard</h1>
        <div className="text-sm text-gray-600">
          {requests.length} assigned request{requests.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="card">
        <DesignerRequestList 
          requests={requests} 
          onRequestUpdated={handleRequestUpdated}
        />
      </div>
    </div>
  );
}
