import React, { useEffect,useState } from 'react';
 
import { useNavigate } from 'react-router-dom';
// ✅ Import your API base URL (adjust path if needed)
import { API_BASE_URL } from '../../../config';
import { checkLogin  } from '../../../utils/auth';
import { getAuthHeaders } from '../../../utils/operation'
const AddCategoryForm = () => {
  const navigate = useNavigate();
  const [EnCategoryName, setEnCategoryName] = useState('');
  const [ArCategoryName, setArCategoryName] = useState('');
  const [error, setError] = useState('');
  // Check for Auth --------------------------------------------------------- 
  useEffect(() => {     checkLogin(navigate);   }, [navigate]);
  // Check for Auth -----------------------------------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!EnCategoryName) {
      setError('Category name is required');
      return;
    }

    addCategory(EnCategoryName, ArCategoryName);
  };

  const addCategory = async (EnEnCategoryName, ArEnCategoryName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/product/createProductCategory`, {
        method: 'POST',
       headers: getAuthHeaders(),
        body: JSON.stringify({
          EnCategoryName: EnEnCategoryName,
          ArCategoryName: ArEnCategoryName,
          PrdCategoryImage: '',
          createdBy: 'USER',
          updatedBy: 'USER',
          IsDataStatus: 1,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      console.log('Category added:', data);

      navigate('/forms/category'); // ✅ Navigate after success
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Failed to add category.');
    }
  };

  return (
    <div>
      <div className="page-title">
        <h3 style={{ margin: 0 }}>Add Product Category</h3>
        <button
          onClick={() => navigate('/forms/category')}
          className="admin-buttonv1"
        >
          Return
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="EnEnCategoryName" style={{ display: 'block', marginBottom: '5px' }}>
            English Category Name
          </label>
          <input
            type="text"
            id="EnEnCategoryName"
            value={EnCategoryName}
            onChange={(e) => setEnCategoryName(e.target.value)}
            placeholder="Enter English category name"
            className="admin-txt-box"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="ArEnCategoryName" style={{ display: 'block', marginBottom: '5px' }}>
            Arabic Category Name
          </label>
          <input
            type="text"
            id="ArEnCategoryName"
            value={ArCategoryName}
            onChange={(e) => setArCategoryName(e.target.value)}
            placeholder="Enter Arabic category name"
            className="admin-txt-box"
          />
        </div>

        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

        <button type="submit" className="admin-buttonv1">Submit</button>
      </form>
    </div>
  );
};

export default AddCategoryForm;
