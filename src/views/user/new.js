import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { checkLogin } from '../../utils/auth';
import '../../scss/toast.css';
import { DspToastMessage,getAuthHeaders } from '../../utils/operation';
const AddUserForm = () => {
  const navigate = useNavigate();

  const [UserFullName, setUserFullName] = useState('');
  const [username, setusername] = useState('');
  const [password, setpassword] = useState(''); // 🔐 New state for password
  const [UserType, setUserType] = useState('');
  const [UserStatus, setUserStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkLogin(navigate);
  }, [navigate]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!UserFullName || !username || !password || !UserType) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
 
    try {
      const response = await fetch(`${API_BASE_URL}/user/createUser`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify({
          UserFullName,
          username,
          password,  
          UserType,
          UserStatus: UserStatus ? 1 : 0,
          CreatedBy: 'ADMIN',
          ModifyBy: 'ADMIN',
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const result = await response.json();
      setToastMessage('User added successfully!');
      setTimeout(() => navigate('/user/list'), 2000);
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Failed to add user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="page-title">
        <h3 style={{ margin: 0 }}>Add User</h3>
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
          placeholder="Enter Full Name"
          required
        />
      </div>

      <div className="form-group">
        <label>User Name (Mobile No)</label>
        <input
          className="admin-txt-box"
          type="text"
          value={username}
          onChange={(e) => setusername(e.target.value)}
          placeholder="Enter User Name"
          required
        />
      </div>

      <div className="form-group">
        <label>password</label>
        <input
          className="admin-txt-box"
          type="password"
          value={password}
          onChange={(e) => setpassword(e.target.value)}
          placeholder="Enter password"
          required
        />
      </div>

      <div className="form-group">
        <label>User Type</label>
        <select
          className="admin-txt-box"
          value={UserType}
          onChange={(e) => setUserType(e.target.value)}
          required
        >
           <option value="--">--Select User Type</option>
          <option value="ADMIN">ADMIN</option>
          <option value="BRANCH-USER">BRANCH-USER</option>
          <option value="SUB-ADMIN">SUB-ADMIN</option>
        </select>
      </div>

      <div className="form-group">
        <label>Status</label>
        <select
          className="admin-txt-box"
          value={UserStatus ? '1' : '0'}
          onChange={(e) => setUserStatus(e.target.value === '1')}
        >
           <option value="--">--Select User Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>

      <div className="submit-container custom-top-5">
        <button type="submit" className="admin-buttonv1">
          {loading ? 'Saving...' : 'Submit'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {toastMessage && <div className="toast-message">{toastMessage}</div>}
    </form>
  );
};

export default AddUserForm;
