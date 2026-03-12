import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../config';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash ,cilSettings  } from '@coreui/icons';
 import { dspStatus,getAuthHeaders } from '../../../utils/operation';
 import { checkLogin  } from '../../../utils/auth';
const PainterInfoListWithPagination = () => {
  const [PainterInfos, setPainterInfos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPainterInfo, setSelectedPainterInfo] = useState(null);

  const OrderPerPage =10;
  const navigate = useNavigate(); // Initialize navigate with useNavigate

  // Fetch PainterInfos from API with pagination
  const fetchpainterlist = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/painter/getpainterlist`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          page: currentPage,
          limit: OrderPerPage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch PainterInfos');
      }

      const data = await response.json();
      console.log(data);

      setPainterInfos(data.data); // Assuming the response has a 'data' array
      setTotalPages(Math.ceil(data.totalCount / OrderPerPage)); // Assuming 'totalCount' is returned
    } catch (error) {
      setError('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  // Check for Auth --------------------------------------------------------- 
  useEffect(() => {     checkLogin(navigate);   }, [navigate]);
  // Check for Auth -----------------------------------------------------------

  // Fetch PainterInfos on page change or component mount
  useEffect(() => {
    fetchpainterlist();
  }, [currentPage]);

  // Pagination handler
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
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
  const handleModifyClick = (PainterInfo) => {
    navigate(`/painter/painterinfo/modify?PainterID=${PainterInfo.PainterID}`); // Redirect to Modify PainterInfo page
  };

  // Handle Delete action
  const handleDeleteClick = async (PainterID) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response =await fetch(`${API_BASE_URL}/painter/painterinfo/delete/${PainterID}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('painter information deleted successfully');
          fetchpainterlist(); // Refresh the PainterInfo list
        } else {
          alert('Failed to delete ');
        }
      } catch (error) {
        alert('Error deleting painter');
      }
    }
  };

  const handleViewClick = (PainterInfo) => {
  navigate(`/painter/view?PrtUserID=${PainterInfo.PrtUserID}`);
};

  return (
   
  <div>
    <div  className="page-title">
    <h3 style={{ margin: 0 }}>Painter List</h3>

    <button
    onClick={() => navigate('/painter/addpainter')}
    className="add-product-button"
    >
    Add New Painter
    </button>
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
      <th>#</th>
       <th></th>
        <th>Mobile No</th>
      <th>Full Name</th>
      <th>Address</th>
      <th>Location</th>
     
      <th>ID Number</th>  
      <th>Status</th>  
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {PainterInfos.map((PainterInfo, index) => (
      <tr key={index}>
        <td><strong>{(currentPage - 1) * OrderPerPage + index + 1}</strong></td>
        <td>
          {PainterInfo.PtrImageUrl ? (
            <img src={PainterInfo.PtrImageUrl} alt="Photo"  className='UserImage' />
          ) : (
            'N/A'
          )}
        </td>
         <td>{PainterInfo.PtrMobileNo}</td>
         <td>{PainterInfo.PtrFullName}</td>
        <td>{PainterInfo.PtrAddress}</td>
        <td>{PainterInfo.PtrLocation}</td>
       
        <td>{PainterInfo.PtrIDNumber}</td> 
     
        <td>{dspStatus(PainterInfo.UserStatus)}</td>
         <td style={{ width: '10%', textAlign:'center' }}>
               <CIcon  onClick={() => handleViewClick(PainterInfo)}  icon={cilSettings}    size="lg"  className="edit-icon"    />
                <CIcon onClick={() => handleEditClick(PainterInfo)} icon={cilPencil} size="lg" className="edit-icon" /> 
                <CIcon onClick={() => handleDeleteClick(PainterInfo)} icon={cilTrash} size="lg" className="trash-icon" />
        
                  
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

export default PainterInfoListWithPagination;
