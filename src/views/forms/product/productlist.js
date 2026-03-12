
//productlist.js

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../config';
import { CIcon } from '@coreui/icons-react';
import { cilTrash, cilPencil } from '@coreui/icons';
import '../../../scss/toast.css';
import { checkLogin } from '../../../utils/auth';
import { DspToastMessage,getAuthHeaders } from '../../../utils/operation';

const ProductListWithPagination = () => {
  const [products, setProducts] = useState([]);              // raw list from API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ProductIDToDelete, setProductIDToDelete] = useState(null);

  // Pagination + filters
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const [searchQuery, setSearchQuery] = useState('');        // search by product name
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // category filter

  const navigate = useNavigate();

  useEffect(() => {
    checkLogin(navigate);
  }, [navigate]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/product/getAllProductsList`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify({
          page: 1,                 // fetch first chunk or full; assuming API returns all for admin lists
          limit: 100000,           // if your API supports large limit to get all for client-side filters
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      const list = Array.isArray(data?.data) ? data.data : [];
      setProducts(list);
      setCurrentPage(1); // reset page after new fetch
    } catch (err) {
      setError('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Unique categories from products (Arabic category shown in grid) ---
  const categoryOptions = useMemo(() => {
    const set = new Set();
    products.forEach(p => {
      const cat = (p?.ArCategoryName ?? '').toString().trim();
      if (cat) set.add(cat);
    });
    return ['ALL', ...Array.from(set).sort((a, b) => a.localeCompare(b, 'ar'))];
  }, [products]);

  // --- Apply client-side filters ---
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter(p => {
      const nameEn = (p?.PrdName ?? '').toString().toLowerCase();
      const nameAr = (p?.ArPrdName ?? '').toString().toLowerCase();
      const matchName = q ? (nameEn.includes(q) || nameAr.includes(q)) : true;

      const cat = (p?.ArCategoryName ?? '').toString();
      const matchCategory = selectedCategory === 'ALL' ? true : (cat === selectedCategory);

      return matchName && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // --- Derived total pages based on filtered list ---
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  }, [filteredProducts.length]);

  // Ensure currentPage is valid if filters shrink results
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  // --- Slice for current page ---
  const currentPageProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage]);

  const handlePageClick = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  const handleProductColorClick = (product) => {
    setSelectedProduct(product);
    navigate(`/forms/prdcolor/prdcolorlist?ProductID=${product.ProductID}`);
  };

  const handleModifyClick = (ProductID) => {
    navigate(`/forms/product/modify?ProductID=${ProductID}`);
  };

  const handleDeleteClick = (ProductID) => {
    setProductIDToDelete(ProductID);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/product/delproductByID`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify({ ProductID: ProductIDToDelete }),
      });

      if (response.ok) {
        setToastType('success');
        setToastMessage('Product deleted successfully!');
        setShowDeleteModal(false);
        // Re-fetch list (so filters/categories stay accurate)
        fetchProducts();
      } else {
        setToastType('fail');
        setToastMessage('Failed to delete product!');
      }
    } catch (error) {
      setToastType('fail');
      setToastMessage('Error deleting product');
    }
  };

  // ----- Pagination (10-number chunk) -----
  const getPageRange = () => {
    const range = [];
    const maxButtons = 10; // show up to 10 numbers per segment
    let startPage = Math.floor((currentPage - 1) / maxButtons) * maxButtons + 1;
    let endPage = Math.min(startPage + maxButtons - 1, totalPages);

    if (endPage - startPage + 1 < maxButtons && totalPages >= maxButtons) {
      startPage = Math.max(1, totalPages - maxButtons + 1);
      endPage = totalPages;
    }

    for (let i = startPage; i <= endPage; i++) range.push(i);
    return range;
  };

  const pageNumbers = getPageRange();

  return (
    <div>
      <div className="page-title" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, flex: '1 0 auto' }}>Product List</h3>

        {/* Filters */}
        <input
          type="text"
          placeholder="Search product name (EN/AR)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px 10px', minWidth: 240 }}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: '8px 10px', minWidth: 200 }}
        >
          {categoryOptions.map(opt => (
            <option key={opt} value={opt}>
              {opt === 'ALL' ? 'All Categories' : opt}
            </option>
          ))}
        </select>

        <button
          onClick={() => navigate('/forms/product/addproduct')}
          className="add-product-button"
          style={{ marginLeft: 'auto' }}
        >
          Add New Product
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <>
          <table className="grid-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Arabic Name</th>
                <th>English Name</th>
                <th>Code No</th>
                <th>Category</th>
                <th style={{ textAlign: 'center' }}>Discount (%)</th>
                <th>Product Color</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPageProducts.map((product, index) => (
                <tr key={`${product.PrdCodeNo}-${index}`}>
                  <td>
                    <strong>{(currentPage - 1) * productsPerPage + index + 1}</strong>
                  </td>
                  <td>
                    <div className="product-image-circle">
                      <img src={product.ProductImageUrl} alt="Product" />
                    </div>
                  </td>
                  <td
                    style={{ color: 'blue', cursor: 'pointer' }}
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.ArPrdName}
                  </td>
                  <td>{product.PrdName}</td>
                  <td>{product.PrdCodeNo}</td>
                  <td>{product.ArCategoryName}</td>
                  <td style={{ textAlign: 'center' }}>
                    {product.PrdDiscount != null ? `${product.PrdDiscount}%` : '0%'}
                  </td>
                  <td style={{ backgroundColor: '#fcf2f5', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <span
                      className="add-product-button"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleProductColorClick(product)}
                    >
                      Add Product Color
                    </span>
                  </td>

                  <td style={{ width: '10%', textAlign: 'center' }}>
                    <CIcon
                      onClick={() => handleModifyClick(product.ProductID)}
                      icon={cilPencil}
                      size="lg"
                      className="edit-icon"
                    />
                    <CIcon
                      onClick={() => handleDeleteClick(product.ProductID)}
                      icon={cilTrash}
                      size="lg"
                      className="trash-icon"
                    />
                  </td>
                </tr>
              ))}

              {currentPageProducts.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 16 }}>
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-container">
            <button
              className="pagination-button"
              onClick={() => handlePageClick(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
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
              aria-label="Next page"
            >
              {'>>'}
            </button>
          </div>
        </>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content_50">
            <h4>Confirm Delete</h4>
            <p>Are you sure you want to delete this product?</p>
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

export default ProductListWithPagination;
