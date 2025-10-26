import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

// A simple inline spinner component for the buttons
const ButtonSpinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function ProfileSettings() {
  const { user } = useAuth();
  
  // State for profile information
  const [name, setName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // State for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Populate form with user data on load
  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error('Name cannot be empty.');
      return;
    }
    
    setIsUpdatingProfile(true);
    // --- SIMULATED API CALL ---
    // In a real app, you would call your API here:
    // try {
    //   const updatedUser = await authAPI.updateMe({ name });
    //   toast.success('Profile updated!');
    //   // You might need to update the user in AuthContext as well
    // } catch (error) {
    //   toast.error(error.response?.data?.message || 'Failed to update profile.');
    // }
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating network delay
    toast.success('Profile updated successfully!');
    // --- End Simulation ---
    
    setIsUpdatingProfile(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    
    setIsChangingPassword(true);
    // --- SIMULATED API CALL ---
    // try {
    //   await authAPI.changePassword({ currentPassword, newPassword });
    //   toast.success('Password changed!');
    //   setCurrentPassword('');
    //   setNewPassword('');
    //   setConfirmPassword('');
    // } catch (error) {
    //   toast.error(error.response?.data?.message || 'Failed to change password.');
    // }
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating network delay
    toast.success('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    // --- End Simulation ---
    
    setIsChangingPassword(false);
  };

  if (!user) {
    return <Layout><div className="card">Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Profile Information Card */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-base font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2.5 px-3"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-base font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={user.email}
                disabled
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed text-base py-2.5 px-3"
              />
            </div>
            <div className="text-right">
              <button
                type="submit"
                className="btn-primary inline-flex items-center text-base py-2.5 px-5"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile && <ButtonSpinner />}
                {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-base font-medium text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2.5 px-3"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-base font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2.5 px-3"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-base font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2.5 px-3"
              />
            </div>
            <div className="text-right">
              <button
                type="submit"
                className="btn-primary inline-flex items-center text-base py-2.5 px-5"
                disabled={isChangingPassword}
              >
                {isChangingPassword && <ButtonSpinner />}
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

