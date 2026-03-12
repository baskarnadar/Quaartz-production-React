import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../config';
import { checkLogin } from '../../../utils/auth';
import '../../../scss/toast.css';
import { DspToastMessage,getAuthHeaders } from '../../../utils/operation';

const AddOrderStatusForm = () => {
  const navigate = useNavigate();

  const [EnOrderStatusName, setEnOrderStatusName] = useState('');
  const [ArOrderStatusName, setArOrderStatusName] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

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

    if (!EnOrderStatusName || !ArOrderStatusName) {
      setToastMessage('Please fill in all required fields.');
      setToastType('fail');
      return;
    }

    setLoading(true);
    setToastMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/orderstatus/createorderstatus`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify({
          EnOrderStatusName,
          ArOrderStatusName,
          IsDataStatus: 1,
          CreatedBy: 'USER',   // Ideally from auth context
          ModifyBy: 'USER',
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      await response.json();
      setToastMessage('Order Status added successfully!');
      setToastType('success');

      setTimeout(() => navigate('/orderstatus/list'), 2000);
    } catch (err) {
      console.error('Error adding order status:', err);
      setToastMessage('Failed to add order status.');
      setToastType('fail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="page-title">
        <h3 style={{ margin: 0 }}>Add Order Status</h3>
        <button
          type="button"
          onClick={() => navigate('/orderstatus/list')}
          className="admin-buttonv1"
        >
          Return
        </button>
      </div>

      <div className="form-group">
        <label>English Order Status Name</label>
        <input
          className="admin-txt-box"
          type="text"
          value={EnOrderStatusName}
          onChange={(e) => setEnOrderStatusName(e.target.value)}
          placeholder="Enter  Order Status Name"
          required
        />
      </div>

      <div className="form-group">
        <label>Arabic Order Status Name</label>
        <input
          className="admin-txt-box"
          type="text"
          value={ArOrderStatusName}
          onChange={(e) => setArOrderStatusName(e.target.value)}
          placeholder="Enter   Order Status Name"
          required
        />
      </div>

      <div className="submit-container custom-top-5">
        <button type="submit" className="admin-buttonv1" disabled={loading}>
          {loading ? 'Saving...' : 'Submit'}
        </button>
      </div>

      <DspToastMessage message={toastMessage} type={toastType} />
    </form>
  );
};

export default AddOrderStatusForm;
