import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { checkLogin  } from '../../utils/auth';
import { getAuthHeaders } from '../../utils/operation';
const DeleteStore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Extract StoreID from query string: /store/del?StoreID=34587345
  const queryParams = new URLSearchParams(location.search);
  const StoreID = queryParams.get('StoreID');
  // Check for Auth --------------------------------------------------------- 
  useEffect(() => {     checkLogin(navigate);   }, [navigate]);
  // Check for Auth -----------------------------------------------------------
  useEffect(() => {
    const deleteStore = async () => {
      if (!StoreID) {
        setMessage('StoreID not provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/store/delStorebyID`, {
          method: 'POST',  // changed from DELETE to POST
        headers: getAuthHeaders(),
          body: JSON.stringify({ StoreID }), // pass StoreID in body
        });

        if (!response.ok) {
          throw new Error('Failed to delete store');
        }

        const data = await response.json();
        setMessage('Store deleted successfully!');
      } catch (error) {
        console.error('Delete error:', error);
        setMessage('Error deleting store.');
      } finally {
        setLoading(false);
        // Redirect to store list after 2 seconds
        setTimeout(() => {
          navigate('/store/list');
        }, 2000);
      }
    };

    deleteStore();
  }, [StoreID, navigate]);

  return (
    <div className="delete-store-container">
      {loading ? (
        <p>Deleting store...</p>
      ) : (
        <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default DeleteStore;
