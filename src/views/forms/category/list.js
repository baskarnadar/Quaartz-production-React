import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../config';
import { CIcon } from '@coreui/icons-react';
import { cilTrash, cilPencil } from '@coreui/icons';
import { checkLogin  } from '../../../utils/auth';
import { getAuthHeaders } from '../../../utils/operation'

const CategoryList = () => {
  const [Categorys, setCategorys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // ✅ Modify Modal State
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyCategoryID, setModifyCategoryID] = useState('');
  const [modifyEnCategoryName, setModifyEnCategoryName] = useState('');
  const [modifyArCategoryName, setModifyArCategoryName] = useState('');
  const [modifyLoading, setModifyLoading] = useState(false);
  const [modifyError, setModifyError] = useState('');

  const CategorysPerPage = 10;
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
  }, []);

  const fetchCategorys = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/product/getProductCategory`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          page: currentPage,
          limit: CategorysPerPage,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch Categorys');

      const data = await response.json();
      setCategorys(data.data);
      setTotalPages(Math.ceil(data.totalCount / CategorysPerPage));
    } catch (error) {
      setError('Error fetching Categorys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorys();
  }, [currentPage]);

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // ✅ Open modify modal instead of navigating
  const handleModifyClick = (Category) => {
    setModifyError('');
    setModifyCategoryID(Category.CategoryID || '');
    setModifyEnCategoryName(Category.EnCategoryName || '');
    setModifyArCategoryName(Category.ArCategoryName || '');
    setSelectedCategory(Category);
    setShowModifyModal(true);
  };

  // ✅ Close modify modal
  const handleCancelModify = () => {
    setShowModifyModal(false);
    setSelectedCategory(null);
    setModifyCategoryID('');
    setModifyEnCategoryName('');
    setModifyArCategoryName('');
    setModifyError('');
    setModifyLoading(false);
  };

  // ✅ Modify category submit
  const handleModifySubmit = async () => {
    const CategoryID = String(modifyCategoryID || '').trim();
    const EnCategoryName = String(modifyEnCategoryName || '').trim();
    const ArCategoryName = String(modifyArCategoryName || '').trim();

    if (!CategoryID) {
      setModifyError('CategoryID is required.');
      return;
    }

    if (!EnCategoryName) {
      setModifyError('English Category Name is required.');
      return;
    }

    if (!ArCategoryName) {
      setModifyError('Arabic Category Name is required.');
      return;
    }

    setModifyLoading(true);
    setModifyError('');

    try {
      const payload = {
        CategoryID: CategoryID,
        EnCategoryName: EnCategoryName,
        ArCategoryName: ArCategoryName,
      };

      console.log('UPDATE PRODUCT CATEGORY URL:', `${API_BASE_URL}/product/updateProductCategory`);
      console.log('UPDATE PRODUCT CATEGORY PAYLOAD:', payload);

      const response = await fetch(`${API_BASE_URL}/product/updateProductCategory`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      console.log('UPDATE PRODUCT CATEGORY RESPONSE:', data);

      if (response.ok && (!data || data.status !== true)) {
        handleCancelModify();
        fetchCategorys();
      } else {
        setModifyError(data?.message || 'Failed to update Category.');
      }
    } catch (error) {
      console.error('UPDATE PRODUCT CATEGORY ERROR:', error);
      setModifyError('Error updating Category.');
    } finally {
      setModifyLoading(false);
    }
  };

  const handleDeleteClick = (CategoryID) => {
    setCategoryToDelete(CategoryID);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Category/delCategorybyID`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ CategoryID: categoryToDelete }),
      });

      if (response.ok) {
        fetchCategorys();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete Category');
      }
    } catch (error) {
      alert('Error deleting Category');
    } finally {
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
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

  return (
    <div>
      <div className="page-title">
        <h3 style={{ margin: 0 }}>Category List</h3>
        <button
          onClick={() => navigate('/forms/newcategory')}
          className="admin-buttonv1"
        >
          Add New Category
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
                <th>Category Name (AR)</th>
                <th>Category Name (EN)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Categorys.map((Category, index) => (
                <tr key={Category.PrdCodeNo}>
                  <td>
                    <strong>{(currentPage - 1) * CategorysPerPage + index + 1}</strong>
                  </td>
                  <td>
                    <span
                      style={{ color: 'blue', cursor: 'pointer' }}
                      onClick={() => setSelectedCategory(Category)}
                    >
                      {Category.ArCategoryName}
                    </span>
                  </td>
                  <td>{Category.EnCategoryName}</td>
                  <td style={{ width: '10%', textAlign: 'center' }}>
                    <CIcon onClick={() => handleModifyClick(Category)} icon={cilPencil} size="lg" className="edit-icon" />
                    <CIcon onClick={() => handleDeleteClick(Category.CategoryID)} icon={cilTrash} size="lg" className="trash-icon" />
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
            {getPageRange().map((pageNumber) => (
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

      {showModifyModal && (
        <div className="modal-overlay">
          <div className="modal-content_50">
            <h4>Modify Category</h4>

            {modifyError && (
              <p style={{ color: 'red', marginTop: '8px', marginBottom: '12px' }}>
                {modifyError}
              </p>
            )}

            {/* ✅ CategoryID is hidden from UI but still kept in state and sent in payload */}
            <input type="hidden" value={modifyCategoryID} readOnly />

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                Category Name (EN)
              </label>
              <input
                type="text"
                value={modifyEnCategoryName}
                onChange={(e) => setModifyEnCategoryName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                Category Name (AR)
              </label>
              <input
                type="text"
                value={modifyArCategoryName}
                onChange={(e) => setModifyArCategoryName(e.target.value)}
                dir="rtl"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                }}
              />
            </div>

            <div className="modal-buttons">
              <button
                className="admin-buttonv1"
                onClick={handleModifySubmit}
                disabled={modifyLoading}
              >
                {modifyLoading ? 'Updating...' : 'Update'}
              </button>

              <button
                className="admin-buttonv1"
                onClick={handleCancelModify}
                disabled={modifyLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content_50">
            <h4>Confirm Delete</h4>
            <p>Are you sure you want to delete this Category?</p>
            <div className="modal-buttons">
              <button   className="admin-buttonv1" onClick={confirmDelete}>Yes</button>
              <button  className="admin-buttonv1" onClick={() => setShowDeleteModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
