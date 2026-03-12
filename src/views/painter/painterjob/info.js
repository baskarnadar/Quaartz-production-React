import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { API_BASE_URL } from '../../../config'
import { CBadge } from '@coreui/react'
import { getAuthHeaders } from '../../../utils/operation';
 import { checkLogin  } from '../../../utils/auth';
const UserOrdersListWithPagination = () => {
  const [userorderss, setuserorderss] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const OrderPerPage = 10

  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const orderRefNo = searchParams.get('OrderRefNo')

   // ✅ Check for login
    useEffect(() => {
      const token = localStorage.getItem('token') // adjust key if needed
      if (!token) {
        navigate('/login') // redirect if not logged in
      }
    }, [])
    
  // ✅ Fetch user orders
  const fetchuserorderss = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/order/getorderbyorderrefnonew`, {
        method: 'POST',
       headers: getAuthHeaders(),
        body: JSON.stringify({
          OrderRefNo: orderRefNo,
          page: currentPage,
          limit: OrderPerPage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user orders')
      }

      const data = await response.json()
      console.log('Fetched data:', data)

      setuserorderss(data.data || [])
      setTotalPages(Math.ceil((data.totalCount || 0) / OrderPerPage))
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Error fetching orders')
    } finally {
      setLoading(false)
    }
  }

  // ✅ useEffect to trigger fetch on page or param change
  useEffect(() => {
    if (orderRefNo) {
      fetchuserorderss()
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
  <CBadge color="success" shape="pill">
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
          <td>{totalAmount}</td>
          <td colSpan="3"></td>
        </tr>
      );
    })()}
  </tbody>
</table>

  </div>
))}

        
        </div>
      )}
    </div>
  )
}

export default UserOrdersListWithPagination
