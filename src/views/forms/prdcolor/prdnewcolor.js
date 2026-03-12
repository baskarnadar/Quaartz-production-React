import React, { useState, useEffect } from 'react';
import { checkLogin  } from '../../../utils/auth';
import { getAuthHeaders } from '../../../utils/operation'
const ProductproductDropdown = () => {
  
  const [products, setproduct] = useState([]);
  const [selectedproductid, setselectedproductid] = useState('');

  const [image, setImage] = useState(null);   
  const [loading, setLoading] = useState(false);  
  const [error, setError] = useState('');
     const navigate = useNavigate(); 

     // Check for Auth --------------------------------------------------------- 
     useEffect(() => {     checkLogin(navigate);   }, [navigate]);
     // Check for Auth ---------------------------------------------------------


  useEffect(() => {
    const fetchProduct = async () => {
      try {
         
        const response = await fetch(`${API_BASE_URL}/product/getProduct`
          , {
          method: 'POST',
        headers: getAuthHeaders(),
          body: JSON.stringify({ IsDataStatus: 1 }),   
        });

        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const data = await response.json();
        console.log('API Response:', data);

        
        if (Array.isArray(data.data)) {
          setproduct(data.data);  
        } else {
          console.error('Expected an array under the "data" key, but got:', data);
          setproduct([]);  
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setproduct([]);  
      }
    };

    fetchProduct();
  }, []);  

 
  const handleproductChange = (event) => {
    setselectedproductid(event.target.value);
    console.log('Selected product ID:', event.target.value);
  };
 
  
 
  const [EnPrdColorNameVal, setColorName] = useState('');
  const [ArPrdColorNameVal, setArPrdColorName] = useState('');
  const [PrdColorCodeVal, setPrdColorCode] = useState('');
  
  
  const handleSubmit = async (e) => {

    e.preventDefault(); 
     console.log("ys");

    try {
      const response = await fetch(`${API_BASE_URL}/product/createProductColor`, {
        method: 'POST',
       headers: getAuthHeaders(),

        body: JSON.stringify({

        EnPrdColorName: EnPrdColorNameVal,
        ArPrdColorName: ArPrdColorNameVal,
        PrdColorType:"PRODUCT",
        ProductID: selectedproductid ,
        PrdColorCode:PrdColorCodeVal, 
          createdBy: "USER",
          updatedBy: "USER",
          IsDataStatus:1,
          

        })
      }); 
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      // Parse the JSON response
      const data = await response.json();
      console.log('Product added:', data);
      return data;
    } catch (error) {
      console.error('Error adding Product:', error);
    }
    setError('Product added');
    setColorName('');
    setArPrdColorName('');
    
   
  };

 
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));  
    }
  };

  return (

    <form onSubmit={handleSubmit}> 

<div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Upload an Image</h2>

     
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange} 
      />
      <div style={{ marginTop: '20px' }}>
        {image && <img src={image} alt="Preview" style={{ maxWidth: '300px', marginTop: '10px' }} />}
      </div>
      
      <button
       
        style={{
          padding: '10px 20px',
          marginTop: '20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Uploading...' : 'Upload Image'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  
       <button type="submit">Add Product</button>
    <div>
          <label htmlFor="ColorName">Product Name</label>
          <input
            type="text"
            id="EnPrdColorName" 
            onChange={(e) => setColorName(e.target.value)}
            placeholder="Enter English Product name"
          />
            <input
            type="text"
            id="ArPrdColorName" 
            onChange={(e) => setArPrdColorName(e.target.value)}
            placeholder="Enter Arabic Product name"
          />
        </div>


        <div>
          <label htmlFor="PrdColorCode">Product Color</label>
          <input
            type="text"
            id="PrdColorCode" 
            onChange={(e) => setPrdColorCode(e.target.value)}
            placeholder="Enter English Product name"
          />
            
        </div>

        

         
         
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ padding: 20 }}>
      <h2>Select a Product product</h2> 
      <select 
        value={selectedproductid} 
        onChange={handleproductChange} 
        style={{ padding: '10px', fontSize: '16px', width: '200px' }}
      >
        <option value="">Select a product</option>
        {/* Map over the products and display them in the dropdown */}
        {Array.isArray(products) && products.length > 0 ? (
          products.map((product) => (
            <option key={product.ProductID} value={product.ProductID}>
              {product.PrdName} {/* Display product name */}
            </option>
          ))
        ) : (
          <option disabled>No products available</option>
        )}
      </select>
      <p style={{ marginTop: '20px' }}>Selected product ID: {selectedproductid}</p>
    </div>
    </form>
  );
};

export default ProductproductDropdown;
