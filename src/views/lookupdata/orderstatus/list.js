import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../config';
import { checkLogin } from '../../../utils/auth';
import { CIcon } from '@coreui/icons-react';
import { cilTrash, cilPencil } from '@coreui/icons';
import { DspToastMessage,getAuthHeaders } from '../../../utils/operation';

const OrderStatusList = () => {
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrderStatusID, setSelectedOrderStatusID] = useState(null);

  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    checkLogin(navigate);
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const fetchOrderStatuses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orderstatus/getorderstatusall`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify({ page: currentPage, limit: itemsPerPage }),
      });

      if (!response.ok) throw new Error('Failed to fetch Order Statuses');
      const data = await response.json();
      setOrderStatuses(data.data);
      setTotalPages(Math.ceil(data.totalCount / itemsPerPage));
    } catch (error) {
      setToastMessage('Error fetching Order Statuses');
      setToastType('fail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderStatuses();
  }, [currentPage]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getPageRange = () => {
    const range = [];
    const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
    const endPage = Math.min(startPage + 4, totalPages);
    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }
    return range;
  };

  const handleModifyClick = (OrderStatusID) => {
    navigate(`/orderstatus/modify?OrderStatusID=${OrderStatusID}`);
  };

  const handleDeleteClick = (OrderStatusID) => {
    setSelectedOrderStatusID(OrderStatusID);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orderstatus/delorderstatus`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify({ OrderStatusID: selectedOrderStatusID }),
      });

      if (response.ok) {
        setToastMessage('Order Status successfully deleted');
        setToastType('success');
        fetchOrderStatuses();
      } else {
        setToastMessage('Failed to delete Order Status');
        setToastType('fail');
      }
    } catch (err) {
      setToastMessage('Error deleting Order Status');
      setToastType('fail');
    } finally {
      setShowDeleteModal(false);
      setSelectedOrderStatusID(null);
    }
  };

  const pageNumbers = getPageRange();

  return (
    <div>
      <div className="page-title">
        <h3 style={{ margin: 0 }}>Order Status List</h3>
        <button
          onClick={() => navigate('/orderstatus/new')}
          className="add-product-button"
        >
          Add New Order Status
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <table className="grid-table">
            <thead>
              <tr>
                <th>#</th>
                <th>  Order Status</th>
                <th>  Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderStatuses.map((status, index) => (
                <tr key={status.OrderStatusID}>
                  <td><strong>{(currentPage - 1) * itemsPerPage + index + 1}</strong></td>
                  <td>{status.EnOrderStatusName}</td>
                  <td>{status.ArOrderStatusName}</td>
                  <td>
                    <CIcon onClick={() => handleModifyClick(status.OrderStatusID)} icon={cilPencil} size="lg" className="edit-icon" />
                    <CIcon onClick={() => handleDeleteClick(status.OrderStatusID)} icon={cilTrash} size="lg" className="trash-icon" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-container">
            <button
              className="pagination-button"
              onClick={() => handlePageClick(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {'<<'}
            </button>
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                className={`pagination-button ${currentPage === pageNumber ? 'active' : ''}`}
                onClick={() => handlePageClick(pageNumber)}
                disabled={currentPage === pageNumber}
              >
                {pageNumber}
              </button>
            ))}
            <button
              className="pagination-button"
              onClick={() => handlePageClick(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {'>>'}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content_50">
            <h4>Confirm Delete</h4>
            <p>Are you sure you want to delete this Order Status?</p>
            <div className="modal-buttons">
              <button className="admin-buttonv1" onClick={confirmDelete}>Yes</button>
              <button className="admin-buttonv1" onClick={() => setShowDeleteModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      <DspToastMessage message={toastMessage} type={toastType} />
    </div>
  );
};

export default OrderStatusList;
