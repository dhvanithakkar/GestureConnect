import { useEffect, useState } from 'react';
import * as React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [userData, setUserData] = useState<{ email: string; name?: string } | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={handleLogout}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Profile</h1>
        {userData ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Email:</p>
              <p className="text-lg font-bold">{userData.email}</p>
            </div>
            {userData.name && (
              <div>
                <p className="text-sm font-medium text-gray-700">Name:</p>
                <p className="text-lg font-bold">{userData.name}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
