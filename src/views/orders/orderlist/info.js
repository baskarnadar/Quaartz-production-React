import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { API_BASE_URL } from '../../../config'
import { CBadge } from '@coreui/react'
 import { checkLogin  } from '../../../utils/auth';
import { DspToastMessage,getStatusBadgeColor,getAuthHeaders } from '../../../utils/operation';
const UserOrdersListWithPagination = () => {
 
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info');
  const [userorderss, setuserorderss] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const OrderPerPage = 10
const [orderStatuses, setOrderStatuses] = useState([]); // ✅ Add this
const [selectedStatus, setSelectedStatus] = useState('');
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const orderRefNo = searchParams.get('OrderRefNo')

  // Check for Auth --------------------------------------------------------- 
  useEffect(() => {     checkLogin(navigate);   }, [navigate]);
  // Check for Auth -----------------------------------------------------------
 
 const fetchUserOrder = async () => {
  setLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/order/getorderbyorderrefnonew`, {
      method: 'POST',
   headers: getAuthHeaders(),
      body: JSON.stringify({
        OrderRefNo: orderRefNo, // ✅ Keep only OrderRefNo
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user orders');
    }

    const data = await response.json();
    console.log('Fetched data:', data);

    setuserorderss(data.data || []);
    setTotalPages(1); // Optional: you can remove pagination logic entirely
  } catch (error) {
    console.error('Error fetching orders:', error);
    setError('Error fetching orders');
  } finally {
    setLoading(false);
  }
};
 

const handleStatusUpdate = async () => {
  if (!selectedStatus || !orderRefNo) {
    alert('Please select a valid order status.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/order/updateOrderStatus`, {
      method: 'POST',
     headers: getAuthHeaders(),
      body: JSON.stringify({
        OrderRefNo: orderRefNo,
        OrderStatus: selectedStatus,
      }),
    });

    const result = await response.json();

    if (result.success) {
     
       setToastMessage('Order status updated successfully.');
       setToastType('success');
       fetchUserOrder(); // 🔁 Refresh order details
    } else {
      setToastMessage(result.message || 'Failed to update order status.');
      setToastType('fail');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    setToastMessage('An error occurred while updating the order status.');
    setToastType('fail');
  }
};


const fetchOrderStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/orderstatus/getorderstatusall`, {
        method: 'POST',
          headers: getAuthHeaders(),
      });

      const result = await res.json();

      if (result?.data) {
        setOrderStatuses(result.data);
      }
    } catch (err) {
      console.error('Error fetching order statuses:', err);
    }
  };
 

  // ✅ useEffect to trigger fetch on page or param change
  useEffect(() => {
    if (orderRefNo) {
      fetchUserOrder()
       fetchOrderStatus();
    }
  }, [orderRefNo, currentPage])

  // ✅ Pagination
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const getPageRange = () => {
    const range = []
    const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1
    const endPage = Math.min(startPage + 4, totalPages)

    for (let i = startPage; i <= endPage; i++) {
      range.push(i)
    }

    return range
  }
  const btnReturn = () => {
    navigate(`/orders/orderlist`);
  };
  const pageNumbers = getPageRange()

  return (
    <div>
      
  <div
  className="page-title"
   
>
  <h3 style={{ margin: 0 }}>Order Information</h3>

  {userorderss.length > 0 && (

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
  <strong>ORDER STATUS:</strong>
  <CBadge color={getStatusBadgeColor(userorderss[0]?.orderstatus)} shape="pill">
  {userorderss[0]?.orderstatus || 'N/A'}
</CBadge>
</div>

   
  )}

  <div className="button-group" style={{ textAlign: 'right' }}>
    <button onClick={btnReturn} className="admin-buttonv1">
      Return
    </button>
  </div>
</div>

      
         

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div>
         
<div style={{ marginTop: '10px' }}>
  <label style={{ fontWeight: 'bold', marginRight: '10px' }}>
    Change Order Status To:
  </label>
  <select
    className="admin-txt-box"
    style={{ width: '200px' }}
   
    onChange={(e) => setSelectedStatus(e.target.value)}
  >
    <option value="">Select Status</option>
    {orderStatuses.map((status) => (
      <option key={status.EnOrderStatusName} value={status.EnOrderStatusName}>
        {status.EnOrderStatusName}
      </option>
    ))}
  </select>
   <button
    className="admin-buttonv1"
    style={{ marginLeft: '10px' }}
    onClick={handleStatusUpdate}
    disabled={!selectedStatus}
  >
    Update Order Status
  </button>
</div>

        
          {userorderss.map((order, index) => (
  <div key={order._id} style={{ border: '0px solid #ccc', marginBottom: '20px', padding: '15px' }}>
    <h4>Order #{index + 1}</h4>
    

<table className="grid-table">
    <thead>
      <tr>
        <th colSpan="2"  >
          <strong>Order Information</strong>
        </th>
      </tr>
    </thead>
      <tbody>
        <tr><td style={{ width: '30%' }}><strong>Order Type</strong></td><td>{order.DeliveryTypeID}</td></tr>
         <tr><td><strong>Order No</strong></td><td>{order.UserOrderNo}</td></tr>
        <tr><td><strong>Order Ref No</strong></td><td>{order.OrderRefNo}</td></tr>
        <tr><td><strong>Order Status</strong></td><td>{order.orderstatus}</td></tr>
        <tr><td><strong>Created At</strong></td><td>{new Date(order.createdAt).toLocaleString()}</td></tr>
           </tbody>
    </table>
   

    <table className="grid-table">
       <thead>
      <tr>
        <th colSpan="2"  >
          <strong>User Information</strong>
        </th>
      </tr>
    </thead>
    <tbody> 
    <tr><td style={{ width: '30%' }}><strong>Customer Name</strong></td><td>{order.userDetails?.[0]?.RegFullName}</td></tr>
    <tr><td><strong>Customer Email Address</strong></td><td>{order.userDetails?.[0]?.RegEmailAddress}</td></tr>
    <tr><td><strong>Customer Mobile</strong></td><td>{order.userDetails?.[0]?.RegMobileNo}</td></tr>
    <tr><td><strong>City</strong></td><td>{order.citydetails?.[0]?.EnCityName}</td></tr>
    <tr><td><strong>Store</strong></td><td>{order.storedetails?.[0]?.StoreName}</td></tr>
    </tbody>
    </table>

 
    {order.storedetails && order.storedetails.length > 0 && (
  <table
    className="grid-table" 
  >
    <thead>
      <tr>
        <th colSpan="2"  >
          <strong>Location Information</strong>
        </th>
      </tr>
    </thead>
    <tbody>
      {order.storedetails.map((store, index) => (
        <React.Fragment key={store._id}>
          <tr>
            <td style={{ width: '30%' }}><strong>Store Name</strong></td>
            <td>{store.StoreName}</td>
          </tr>
          <tr>
            <td><strong>Store Code</strong></td>
            <td>{store.StoreCodeID}</td>
          </tr>
          <tr>
            <td><strong>Sales Rep Name</strong></td>
            <td>{store['Sales Rep name ']}</td>
          </tr>
          <tr>
            <td><strong>Area</strong></td>
            <td>{store.StoreArea}</td>
          </tr>
          <tr>
            <td><strong>Address</strong></td>
            <td>{store.StoreAdress}</td>
          </tr>
          <tr>
            <td><strong>Map Link</strong></td>
            <td>
              <a
                href={store.StoreGoogleMapLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Map
              </a>
            </td>
          </tr>
        </React.Fragment>
      ))}
    </tbody>
  </table>
)}



    <h5 style={{ marginTop: '20px' }}>Items in this Order:</h5>
   <table className="grid-table" style={{   width: '100%' }}>
  <thead>
    <tr>
      <th>#</th>
        <th>Image</th>
      <th>Product Name</th>
      <th>Qty</th>
      <th>Amount</th>
      <th>Color</th>
      <th>Size</th>
      <th>Description</th>
    
    </tr>
  </thead>
  <tbody>
    {order.suborderviews.map((item, subIndex) => (
      <tr key={item._id}>
        <td>{subIndex + 1}</td>
        <td>
          <img
            src={item.PrdThumb}
            alt={item.PrdName}
            width="60"
            style={{ borderRadius: '5px' }}
          />
        </td>
        <td>{item.PrdName}</td>
        <td>{item.ProductQty}</td>
        <td>{item.ProductAmount}</td>
        <td>{item.EnPrdColorName || 'N/A'}</td>
        <td>{item.EnPrdSizeName || 'N/A'}</td>
        <td>{item.PrdDesc}



<table>
<tr>
<td>
  
  {item.OrderTypeID === 'PAINTER-REQ' && (
    <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
      <div><strong>Date:</strong> {item.PainterReqDate || 'N/A'}</div>
      <div><strong>Time:</strong> {String(item.PainterReqTime || 'N/A')}</div>
      <div><strong>Work Type:</strong> {item.PainterReqWorkType || 'N/A'}</div>
      <div><strong>Size:</strong> {item.PainterReqSize || 'N/A'}</div>
    </div>
  )}
</td>
</tr>
</table>

        </td>
        
      </tr>
    ))}



    {/* Totals Row */}
    {(() => {
      const totalQty = order.suborderviews.reduce((sum, item) => sum + (item.ProductQty || 0), 0);
      const totalAmount = order.suborderviews.reduce(
        (sum, item) => sum + (item.ProductQty * item.ProductAmount || 0),
        0
      );

      return (
        <tr style={{ backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
          <td  ></td>
           <td colSpan="2">Total</td>
          <td>{totalQty}</td>
          <td>

 
 
 {totalAmount} 
 <img src="../src/assets/images/moneyv1.png" alt="Logo" className="custommoney"   />
   
 </td>
          <td colSpan="3"></td>
        </tr>
      );
    })()}
  </tbody>
</table>

  </div>
))}
<DspToastMessage  message={toastMessage}  type={toastType} /> 
        
        </div>
      )}
    </div>
  )
}

export default UserOrdersListWithPagination
