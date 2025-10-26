import { useState } from 'react';
import { requestsAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import LoadingButton from './LoadingButton'; // <-- 1. IMPORT LOADING BUTTON

export default function RequestForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    requirements: {
      campusName: '',
      departments: [
        {
          name: '',
          rooms: [{ name: '', wiredHosts: 0, wirelessHosts: 0 }]
        }
      ],
      additionalRequirements: ''
    },
    priority: 'Medium'
  });
  // const [isSubmitting, setIsSubmitting] = useState(false); // <-- 2. REMOVED THIS STATE

  const handleCampusNameChange = (e) => {
    setFormData({
      ...formData,
      requirements: {
        ...formData.requirements,
        campusName: e.target.value
      }
    });
  };

  const handleAdditionalRequirementsChange = (e) => {
    setFormData({
      ...formData,
      requirements: {
        ...formData.requirements,
        additionalRequirements: e.target.value
      }
    });
  };

  const handlePriorityChange = (e) => {
    setFormData({
      ...formData,
      priority: e.target.value
    });
  };

  const addDepartment = () => {
    setFormData({
      ...formData,
      requirements: {
        ...formData.requirements,
        departments: [
          ...formData.requirements.departments,
          {
            name: '',
            rooms: [{ name: '', wiredHosts: 0, wirelessHosts: 0 }]
          }
        ]
      }
    });
  };

  const removeDepartment = (deptIndex) => {
    if (formData.requirements.departments.length > 1) {
      setFormData({
        ...formData,
        requirements: {
          ...formData.requirements,
          departments: formData.requirements.departments.filter((_, index) => index !== deptIndex)
        }
      });
    }
  };

  const updateDepartment = (deptIndex, field, value) => {
    const updatedDepartments = [...formData.requirements.departments];
    updatedDepartments[deptIndex] = {
      ...updatedDepartments[deptIndex],
      [field]: value
    };
    setFormData({
      ...formData,
      requirements: {
        ...formData.requirements,
        departments: updatedDepartments
      }
    });
  };

  const addRoom = (deptIndex) => {
    const updatedDepartments = [...formData.requirements.departments];
    updatedDepartments[deptIndex].rooms.push({
      name: '',
      wiredHosts: 0,
      wirelessHosts: 0
    });
    setFormData({
      ...formData,
      requirements: {
        ...formData.requirements,
        departments: updatedDepartments
      }
    });
  };

  const removeRoom = (deptIndex, roomIndex) => {
    const updatedDepartments = [...formData.requirements.departments];
    if (updatedDepartments[deptIndex].rooms.length > 1) {
      updatedDepartments[deptIndex].rooms = updatedDepartments[deptIndex].rooms.filter(
        (_, index) => index !== roomIndex
      );
      setFormData({
        ...formData,
        requirements: {
          ...formData.requirements,
          departments: updatedDepartments
        }
      });
    }
  };

  const updateRoom = (deptIndex, roomIndex, field, value) => {
    const updatedDepartments = [...formData.requirements.departments];
    updatedDepartments[deptIndex].rooms[roomIndex] = {
      ...updatedDepartments[deptIndex].rooms[roomIndex],
      [field]: value
    };
    setFormData({
      ...formData,
      requirements: {
        ...formData.requirements,
        departments: updatedDepartments
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.requirements.campusName.trim()) {
      toast.error('Campus name is required');
      return;
    }

    const hasValidDepartments = formData.requirements.departments.every(dept => 
      dept.name.trim() && dept.rooms.some(room => room.name.trim())
    );

    if (!hasValidDepartments) {
      toast.error('All departments must have a name and at least one room');
      return;
    }

    // setIsSubmitting(true); // <-- 3. REMOVED THIS

    try {
      await requestsAPI.create(formData);
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create request');
    } 
    // finally {
    //   setIsSubmitting(false); // <-- 4. REMOVED THIS
    // }
  };

  return (
    // 5. REMOVED onSubmit from <form>
    <form className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Network Request Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Campus Name *
            </label>
            <input
              type="text"
              value={formData.requirements.campusName}
              onChange={handleCampusNameChange}
              className="input-field"
              placeholder="Enter campus name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={handlePriorityChange}
              className="input-field"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Departments & Rooms</h3>
          <button
            type="button"
            onClick={addDepartment}
            className="btn-secondary flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Department
          </button>
        </div>

        {formData.requirements.departments.map((department, deptIndex) => (
          <div key={deptIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <input
                type="text"
                value={department.name}
                onChange={(e) => updateDepartment(deptIndex, 'name', e.target.value)}
                className="input-field flex-1 mr-3"
                placeholder="Department name (e.g., Computer Science, Administration)"
                required
              />
              {formData.requirements.departments.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDepartment(deptIndex)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {department.rooms.map((room, roomIndex) => (
                <div key={roomIndex} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={room.name}
                    onChange={(e) => updateRoom(deptIndex, roomIndex, 'name', e.target.value)}
                    className="input-field flex-1"
                    placeholder="Room name (e.g., Lab 101, Office 205)"
                    required
                  />
                  <input
                    type="number"
                    value={room.wiredHosts}
                    onChange={(e) => updateRoom(deptIndex, roomIndex, 'wiredHosts', parseInt(e.target.value) || 0)}
                    className="input-field w-24"
                    placeholder="Wired"
                    min="0"
                  />
                  <input
                    type="number"
                    value={room.wirelessHosts}
                    onChange={(e) => updateRoom(deptIndex, roomIndex, 'wirelessHosts', parseInt(e.target.value) || 0)}
                    className="input-field w-24"
                    placeholder="Wireless"
                    min="0"
                  />
                  {department.rooms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRoom(deptIndex, roomIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addRoom(deptIndex)}
                className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Room
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Requirements
        </label>
        <textarea
          value={formData.requirements.additionalRequirements}
          onChange={handleAdditionalRequirementsChange}
          rows={3}
          className="input-field"
          placeholder="Any specific requirements or constraints..."
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        {/* 6. REPLACED <button> with <LoadingButton> */}
        <LoadingButton
          type="submit"
          onClick={handleSubmit}
          className="btn-primary"
          loadingText="Submitting..."
        >
          Submit Request
        </LoadingButton>
      </div>
    </form>
  );
}
