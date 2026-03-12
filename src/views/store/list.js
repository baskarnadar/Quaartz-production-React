 import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import CIcon from '@coreui/icons-react';
import { cilTrash, cilPencil } from '@coreui/icons';
import { checkLogin  } from '../../utils/auth';
import { getAuthHeaders } from '../../utils/operation';
const StoreListWithPagination = () => {
  const [stores, setStores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const storesPerPage = 10;
  const navigate = useNavigate();
  // Check for Auth --------------------------------------------------------- 
  useEffect(() => {     checkLogin(navigate);   }, [navigate]);
  // Check for Auth -----------------------------------------------------------
  // Check for login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/store/getStoreList`, {
        method: 'POST',
      headers: getAuthHeaders(),
        body: JSON.stringify({
          page: currentPage,
          limit: storesPerPage,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch stores');

      const data = await response.json();
      setStores(data.data);
      setTotalPages(Math.ceil((data.totalCount || data.data.length) / storesPerPage));
    } catch (err) {
      setError('Error fetching stores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [currentPage]);

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleModifyClick = (store) => {
    navigate(`/forms/modifystore?StoreID=${store._id}`);
  };

 const handleDeleteClick = async (StoreID) => {
  try {
    const response = await fetch(`${API_BASE_URL}/store/delStorebyID`, {
      method: 'POST',
    headers: getAuthHeaders(),
      body: JSON.stringify({ StoreID }), // send StoreID in body as JSON
    });

    console.log(response);
    if (response.ok) {
      alert('Store deleted successfully');
      fetchStores();
    } else {
      alert('Failed to delete store');
    }
  } catch (err) {
    alert('Error deleting store');
  }
};

  const getPageRange = () => {
    const range = [];
    const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
    const endPage = Math.min(startPage + 4, totalPages);
    for (let i = startPage; i <= endPage; i++) range.push(i);
    return range;
  };

  return (
    <div>
      <div className="page-title">
        <h3 style={{ margin: 0 }}>Store List</h3>
        <button onClick={() => navigate('/store/new')} className="add-product-button">
          Add New Store
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div>
          <table className="grid-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Store Code</th>
                <th>Store Name</th>
                <th>Sales Rep Name</th>
                <th>Store Area</th>
                <th>City (EN)</th>
                <th>City (AR)</th>
                <th>Store Address</th>
                <th>Google Map</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store, index) => (
                <tr key={store._id}>
                  <td>{(currentPage - 1) * storesPerPage + index + 1}</td>
                  <td>{store.StoreCodeID}</td>
                  <td>{store.StoreName}</td>
                  <td>{store['Sales Rep name ']}</td>
                  <td>{store.StoreArea}</td>
                  <td>{store.EnCityName}</td>
                  <td>{store.ArCityName}</td>
                  <td>{store.StoreAdress}</td>
                  <td>
                    <a
                      href={store.StoreGoogleMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Map
                    </a>
                  </td>
                  <td>{store.StoreLatitude}</td>
                  <td>{store.StoreLongitude}</td>
                  <td>
                    <CIcon
                      onClick={() => handleModifyClick(store)}
                      icon={cilPencil}
                      size="lg"
                      className="edit-icon"
                    />
                    <CIcon
  onClick={() => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      handleDeleteClick(store.StoreID);
    }
  }}
  icon={cilTrash}
  size="lg"
  className="trash-icon"
/>

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
            {getPageRange().map((page) => (
              <button
                key={page}
                className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageClick(page)}
              >
                {page}
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
    </div>
  );
};

export default StoreListWithPagination;
