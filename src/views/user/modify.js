import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { checkLogin } from '../../utils/auth';
import '../../scss/toast.css';
import { DspToastMessage,getAuthHeaders } from '../../utils/operation';
const UserForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const UserID = queryParams.get('UserID');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [UserFullName, setUserFullName] = useState('');
  const [UserName, setUserName] = useState('');
  const [UserType, setUserType] = useState('Admin');
  const [UserStatus, setUserStatus] = useState(1); // 1 = Active, 0 = Inactive

  useEffect(() => {
    checkLogin(navigate);
  }, [navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!UserID) return;

      try {
        const res = await fetch(`${API_BASE_URL}/user/getuserbyid`, {
          method: 'POST',
            headers: getAuthHeaders(),
          body: JSON.stringify({ UserID }),
        });

        const result = await res.json();
        const user = result.data;

        if (user) {
          setUserFullName(user.UserFullName || '');
          setUserName(user.UserName || '');
          setUserType(user.UserType || 'Admin');
          setUserStatus(user.UserStatus ?? 1);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUserData();
  }, [UserID]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!UserFullName.trim() || !UserName.trim()) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const payload = {
      UserFullName,
      UserName,
      UserType,
      UserStatus,
      updatedBy: 'ADMIN',
    };

    if (UserID) {
      payload.UserID = UserID;
    } else {
      payload.createdBy = 'ADMIN';
    }

    const apiUrl = UserID
      ? `${API_BASE_URL}/user/updateuserbyid`
      : `${API_BASE_URL}/user/create`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      setError('User saved successfully!');
      setTimeout(() => navigate('/users/userlist'), 2000);
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user.');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="page-title">
        <h3>{UserID ? 'Edit' : 'Add'} User</h3>
        <button
          type="button"
          onClick={() => navigate('/users/userlist')}
          className="admin-buttonv1"
        >
          Return
        </button>
      </div>

      <div className="form-group">
        <label>User Full Name</label>
        <input
          className="admin-txt-box"
          type="text"
          value={UserFullName}
          onChange={(e) => setUserFullName(e.target.value)}
          required
          placeholder="Enter Full Name"
        />
      </div>

      <div className="form-group">
        <label>User Name</label>
        <input
          className="admin-txt-box"
          type="text"
          value={UserName}
          onChange={(e) => setUserName(e.target.value)}
          required
          placeholder="Enter User Name"
        />
      </div>

      <div className="form-group">
        <label>User Type</label>
        <select
          className="admin-txt-box"
          value={UserType}
          onChange={(e) => setUserType(e.target.value)}
        >
          <option value="Admin">Admin</option>
          <option value="Editor">Editor</option>
          <option value="Viewer">Viewer</option>
        </select>
      </div>

      <div className="form-group">
        <label>Status</label>
        <select
          className="admin-txt-box"
          value={UserStatus}
          onChange={(e) => setUserStatus(Number(e.target.value))}
        >
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </select>
      </div>

      <div className="submit-container custom-top-5">
        <button type="submit" className="admin-buttonv1" disabled={loading}>
          {loading ? 'Saving...' : UserID ? 'Update User' : 'Submit'}
        </button>
      </div>

      {error && (
        <div className={`toast-message ${error.includes('success') ? 'success' : 'error'}`}>
          {error}
        </div>
      )}
    </form>
  );
};

export default UserForm;
