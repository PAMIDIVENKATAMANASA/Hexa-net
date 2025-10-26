import { useState } from 'react';
import { designsAPI, requestsAPI } from '../lib/api';
import toast from 'react-hot-toast';
import MermaidDiagram from './MermaidDiagram';
import BillOfMaterialsTable from './BillOfMaterialsTable';
import IpPlanTable from './IpPlanTable';

export default function DesignerRequestList({ requests, onRequestUpdated }) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDesignModal, setShowDesignModal] = useState(false);

  const handleGenerateDesign = async (requestId) => {
    setLoading(true);
    try {
      const response = await designsAPI.generate(requestId);
      setDesign(response.data.design);
      setShowDesignModal(true);
      onRequestUpdated();
      toast.success('Design generated successfully!');
    } catch (error) {
      toast.error('Failed to generate design');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDesign = async (designId, notes) => {
    try {
      await designsAPI.approve(designId, notes);
      toast.success('Design approved successfully!');
      setShowDesignModal(false);
      onRequestUpdated();
    } catch (error) {
      toast.error('Failed to approve design');
    }
  };

  const handleViewDesign = async (requestId) => {
    setLoading(true);
    try {
      const response = await designsAPI.getByRequest(requestId);
      setDesign(response.data.design);
      setShowDesignModal(true);
    } catch (error) {
      toast.error('Failed to fetch design');
    } finally {
      setLoading(false);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No assigned requests found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Assigned Requests</h2>
      
      <div className="grid gap-6">
        {requests.map((request) => (
          <div key={request._id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {request.requirements.campusName}
                </h3>
                <p className="text-sm text-gray-600">
                  Client: {request.client?.name}
                </p>
                <p className="text-sm text-gray-600">
                  Departments: {request.requirements.departments.length}
                </p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    request.status === 'New' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'Design In Progress' ? 'bg-purple-100 text-purple-800' :
                    request.status === 'Design Complete' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {request.design ? (
                  <button
                    onClick={() => handleViewDesign(request._id)}
                    className="btn-primary"
                  >
                    View Design
                  </button>
                ) : (
                  <button
                    onClick={() => handleGenerateDesign(request._id)}
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Generating...' : 'Generate Design'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showDesignModal && design && (
        <DesignModal
          design={design}
          onApprove={handleApproveDesign}
          onClose={() => setShowDesignModal(false)}
        />
      )}
    </div>
  );
}

const DesignModal = ({ design, onApprove, onClose }) => {
  const [notes, setNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(design._id, notes);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium text-gray-900">
              Network Design Report
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Bill of Materials */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Bill of Materials</h4>
              <BillOfMaterialsTable billOfMaterials={design.billOfMaterials} />
            </div>

            {/* IP Plan */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">IP Plan & VLANs</h4>
              <IpPlanTable ipPlan={design.ipPlan} />
            </div>

            {/* Topology Diagram */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Network Topology</h4>
              <div className="border border-gray-200 rounded-lg p-4">
                <MermaidDiagram diagramString={design.topologyDiagram} />
              </div>
            </div>

            {/* Design Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Design Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="input-field"
                placeholder="Add any notes about this design..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Close
              </button>
              {!design.isApproved && (
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="btn-primary"
                >
                  {isApproving ? 'Approving...' : 'Approve Design'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
