import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../config';
import { checkLogin  } from '../../../utils/auth';
import { getStatusBadgeColor,getAuthHeaders } from '../../../utils/operation';
import { CBadge } from '@coreui/react'
const OrderList = () => {
  const [userorderss, setuserorderss] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selecteduserorders, setSelecteduserorders] = useState(null);

  const OrderPerPage =10;
  const navigate = useNavigate();  
  // Check for Auth --------------------------------------------------------- 
  useEffect(() => {     checkLogin(navigate);   }, [navigate]);
  // Check for Auth -----------------------------------------------------------


         

  // Fetch userorderss from API with pagination
  const fetchuserorderss = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/order/getorder`, {
        method: 'POST',
      headers: getAuthHeaders(),
        body: JSON.stringify({
          page: currentPage,
          limit: OrderPerPage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch userorderss');
      }

      const data = await response.json();

      setuserorderss(data.data); // Assuming the response has a 'data' array
      setTotalPages(Math.ceil(data.totalCount / OrderPerPage)); // Assuming 'totalCount' is returned
    } catch (error) {
      setError('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

//  Check for login --------------------------------------------
useEffect(() => {
const token = localStorage.getItem('token') // adjust key if needed
if (!token) {
navigate('/login') // redirect if not logged in
}
}, [])
//  Check for login --------------------------------------------

  // Fetch userorderss on page change or component mount
  useEffect(() => {
    fetchuserorderss();
  }, [currentPage]);

  // Pagination handler
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleuserordersColorClick = (userorders) => {
    setSelecteduserorders(userorders);
    // Navigate to the userorders Color List page with the OrderRefNo in the URL
    navigate(`/forms/prdcolor/prdcolorlist?OrderRefNo=${userorders.OrderRefNo}`); // Pass OrderRefNo in the URL
  };

  const handleuserordersSizeClick = (userorders) => {
    setSelecteduserorders(userorders);
    // Navigate to the userorders Color List page with the OrderRefNo in the URL
    navigate(`/forms/prdsize/prdsizelist?OrderRefNo=${userorders.OrderRefNo}`); // Pass OrderRefNo in the URL
  };

  // Generate page range to display, max 5 page numbers at a time
  const getPageRange = () => {
    const range = [];
    const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
    const endPage = Math.min(startPage + 4, totalPages);
    
    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }

    return range;
  };

  const pageNumbers = getPageRange();

  // Handle Modify action
  const handleModifyClick = (userorders) => {
    navigate(`/forms/modifyuserorders?OrderRefNo=${userorders.OrderRefNo}`); // Redirect to Modify userorders page
  };

  // Handle Delete action
  const handleDeleteClick = async (OrderRefNo) => {
    if (window.confirm('Are you sure you want to delete this userorders?')) {
      try {
        const response =await fetch(`${API_BASE_URL}/userorders/deleteuserorders/${OrderRefNo}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('userorders deleted successfully');
          fetchuserorderss(); // Refresh the userorders list
        } else {
          alert('Failed to delete userorders');
        }
      } catch (error) {
        alert('Error deleting userorders');
      }
    }
  };

  return (
    <div>
    <div  className="page-title">
    <h3 style={{ margin: 0 }}>Order List</h3>

   
    </div>


      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div>
          {/* Data Grid (Table) View */}
           <table className="grid-table">
  <thead>
    <tr>
      <th>  #</th>
  <th>UserOrderNo</th> 
  <th> Order Type</th>

  <th>  Order Date</th>
  <th>Order Status</th>
    </tr>
  </thead>
  <tbody>
    {userorderss.map((userorders, index) => (
      <tr key={userorders.PrdCodeNo}>
        <td><strong>{(currentPage - 1) * OrderPerPage + index + 1}</strong></td>
          <td>
      <span
        style={{ color: 'blue', cursor: 'pointer' }}
        onClick={() => navigate(`/orders/orderinfo?OrderRefNo=${userorders.OrderRefNo}`)}
      >
        {userorders.UserOrderNo}
      </span>
    </td>
        <td>
          
            {userorders.DeliveryTypeID}
          
        </td>
        <td>{userorders.createdAt}</td>
        <td>
          
            <CBadge color={getStatusBadgeColor(userorders.orderstatus)} shape="pill">
           {userorders.orderstatus}
          </CBadge>
          
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
    </div>
  );
};

export default OrderList;
