import { useState } from 'react';
import { useRouter } from 'next/router';

const statusColors = {
  'New': 'bg-yellow-100 text-yellow-800',
  'Assigned': 'bg-blue-100 text-blue-800',
  'Design In Progress': 'bg-purple-100 text-purple-800',
  'Design Complete': 'bg-green-100 text-green-800',
  'Installation In Progress': 'bg-indigo-100 text-indigo-800',
  'Completed': 'bg-gray-100 text-gray-800',
};

const priorityColors = {
  'Low': 'bg-gray-100 text-gray-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-orange-100 text-orange-800',
  'Urgent': 'bg-red-100 text-red-800',
};

export default function RequestList({ requests }) {
  const router = useRouter();

  const handleViewRequest = (requestId) => {
    router.push(`/project-detail?id=${requestId}`);
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No requests found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="table-header">Campus Name</th>
            <th className="table-header">Status</th>
            <th className="table-header">Priority</th>
            <th className="table-header">Departments</th>
            <th className="table-header">Created</th>
            <th className="table-header">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request._id} className="hover:bg-gray-50">
              <td className="table-cell font-medium">
                {request.requirements.campusName}
              </td>
              <td className="table-cell">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                  {request.status}
                </span>
              </td>
              <td className="table-cell">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[request.priority]}`}>
                  {request.priority}
                </span>
              </td>
              <td className="table-cell">
                {request.requirements.departments.length} department{request.requirements.departments.length !== 1 ? 's' : ''}
              </td>
              <td className="table-cell text-gray-500">
                {new Date(request.createdAt).toLocaleDateString()}
              </td>
              <td className="table-cell">
                <button
                  onClick={() => handleViewRequest(request._id)}
                  className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
