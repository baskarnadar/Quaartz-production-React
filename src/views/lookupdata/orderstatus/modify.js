import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../../config';
import { checkLogin } from '../../../utils/auth';
import '../../../scss/toast.css';
import { DspToastMessage,getAuthHeaders } from '../../../utils/operation';

const OrderStatusForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const OrderStatusID = queryParams.get('OrderStatusID');

  const [loading, setLoading] = useState(false);
  const [EnOrderStatusName, setEnOrderStatusName] = useState('');
  const [ArOrderStatusName, setArOrderStatusName] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  useEffect(() => {
    checkLogin(navigate);
  }, [navigate]);

  useEffect(() => {
    const fetchOrderStatusData = async () => {
      if (!OrderStatusID) return;

      try {
        const res = await fetch(`${API_BASE_URL}/orderstatus/getorderstatus`, {
          method: 'POST',
            headers: getAuthHeaders(),
          body: JSON.stringify({ OrderStatusID }),
        });

        const result = await res.json();
        const status = result.data;

        if (status) {
          setEnOrderStatusName(status.EnOrderStatusName || '');
          setArOrderStatusName(status.ArOrderStatusName || '');
        }
      } catch (err) {
        console.error('Error fetching order status:', err);
      }
    };

    fetchOrderStatusData();
  }, [OrderStatusID]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToastMessage('');

    if (!EnOrderStatusName.trim() || !ArOrderStatusName.trim()) {
      setToastMessage('Please fill in all required fields.');
      setToastType('fail');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        OrderStatusID,
        EnOrderStatusName,
        ArOrderStatusName,
        ModifyAt: new Date(),
        ModifyBy: 'USER',
      };

      const response = await fetch(`${API_BASE_URL}/orderstatus/updateorderstatus`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      setToastMessage('Order Status updated successfully!');
      setToastType('success');
      setTimeout(() => navigate('/orderstatus/list'), 2000);
    } catch (err) {
      console.error('Error updating order status:', err);
      setToastMessage('Failed to update order status.');
      setToastType('fail');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="page-title">
        <h3>{OrderStatusID ? 'Edit' : 'Add'} Order Status</h3>
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
          placeholder="Enter   Order Status Name"
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
          {loading ? 'Saving...' : OrderStatusID ? 'Update Order Status' : 'Submit'}
        </button>
      </div>

      <DspToastMessage message={toastMessage} type={toastType} />
    </form>
  );
};

export default OrderStatusForm;
