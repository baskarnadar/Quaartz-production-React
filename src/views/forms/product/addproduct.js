import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../config';
import { getFileNameFromUrl } from '../../../utils/operation';
import { checkLogin } from '../../../utils/auth';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../../scss/toast.css';
import { DspToastMessage,getAuthHeaders } from '../../../utils/operation';
const ProductCategoryDropdown = () => {
  const navigate = useNavigate();

    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info');
    
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [PtrImage, setPtrImage] = useState(null);
  const [loading, setLoading] = useState(false);
 

  const [PrdCodeNoVal, setPrdCodeNo] = useState('');
  const [EnPrdNameVal, setPrdName] = useState('');
  const [ArPrdNameVal, setArPrdName] = useState('');
  const [PrdDiscountVal, setPrdDiscountVal] = useState('');
  const [PrdDescVal, setPrdDesc] = useState('');

  useEffect(() => {
    checkLogin(navigate);
  }, [navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/product/getProductCategory`, {
          method: 'POST',
            headers: getAuthHeaders(),
          body: JSON.stringify({ IsDataStatus: 1 }),
        });

        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleFileUpload = (setter) => async (e) => {
    const file = e.target.files[0];
    if (file) setter(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToastMessage('');

   if (
      !PtrImage ||
      !EnPrdNameVal ||
      !ArPrdNameVal ||
      !PrdCodeNoVal ||
      !selectedCategory ||
      !PrdDescVal ||
      PrdDescVal.trim() === '' ||
      PrdDescVal === '<p><br></p>'
    ) {
      setToastMessage('Please fill in all required fields.');
      setLoading(false);
      return;
    }

        
 

    let uploadedImageKey = PtrImage;
    try {
      if (PtrImage && PtrImage instanceof File) {
        const formdata = new FormData();
        formdata.append("image", PtrImage);
        formdata.append("foldername", "files/product/images");

        const uploadResponse = await fetch(`${API_BASE_URL}/product/upload/uploadImage`, {
          method: "POST",
          body: formdata,
        });

        if (!uploadResponse.ok) throw new Error(`Image upload failed: ${uploadResponse.status}`);
        const uploadResult = await uploadResponse.json();
        uploadedImageKey = uploadResult?.data?.key || uploadResult?.data?.Key;
      }

      const PrdImageVal = getFileNameFromUrl(uploadedImageKey);

      const response = await fetch(`${API_BASE_URL}/product/createProduct`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify({
          PrdCodeNo: PrdCodeNoVal,
          PrdName: EnPrdNameVal,
          ArPrdName: ArPrdNameVal,
          PrdThumb: PrdImageVal,
          PrdLarge: PrdImageVal,
          PrdBanner: PrdImageVal,
          PrdGridList: PrdImageVal,
          PrdDesc: PrdDescVal,
          PrdDiscount:  parseInt(PrdDiscountVal),
          createdBy: "USER",
          updatedBy: "USER",
          IsDataStatus: 1,
          CategoryID: selectedCategory,
          ProductTypeID: "PRODUCT"
        })
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = await response.json();
      console.log('Product added:', data);
      setToastMessage('Product added successfully!');
 setToastType('success');
      setTimeout(() => {
        navigate('/forms/product/productlist');
      }, 2000);

    } catch (error) {
      console.error('Error adding Product:', error);
      setToastMessage('Failed to add product.');
       setToastType('fail');
    }

    setLoading(false);
    setPrdName('');
    setArPrdName('');
    setPrdDesc('');
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="page-title">
        <h3 style={{ margin: 0 }}>Add Product</h3>
        <button
          type="button"
          onClick={() => navigate('/forms/product/productlist')}
          className="admin-buttonv1"
        >
          Return
        </button>
      </div>

      <div className="form-group">
        <label>Product Image</label>
        <input
          className='admin-txt-box'
          type="file"
          accept="image/*"
          onChange={handleFileUpload(setPtrImage)}
          required
        />
        {PtrImage && (
          <img
            src={PtrImage instanceof File ? URL.createObjectURL(PtrImage) : PtrImage}
            alt="Preview"
            className="image-preview"
          />
        )}
      </div>

      <div className="form-group">
        <label>English Product Name</label>
        <input
          className='admin-txt-box'
          type="text"
          value={EnPrdNameVal}
          onChange={(e) => setPrdName(e.target.value)}
          placeholder="Enter English Product Name"
          required
        />
      </div>

      <div className="form-group">
        <label>Arabic Product Name</label>
        <input
          className='admin-txt-box'
          type="text"
          value={ArPrdNameVal}
          onChange={(e) => setArPrdName(e.target.value)}
          placeholder="Enter Arabic Product Name"
          required
        />
      </div>

      <div className="form-group">
        <label>Product Code</label>
        <input
          className='admin-txt-box'
          type="text"
          value={PrdCodeNoVal}
          onChange={(e) => setPrdCodeNo(e.target.value)}
          placeholder="Enter Product Code"
          required
        />
      </div>

     <div className="form-group">
        <label>Product Description</label>
        <textarea
          className='admin-txt-box'
          rows={4}
          value={PrdDescVal}
          onChange={(e) => setPrdDesc(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Product Discount (%)</label>
        <input
          className='admin-txt-box'
          type="text"
          value={PrdDiscountVal}
          onChange={(e) => setPrdDiscountVal(e.target.value)}
          placeholder="Enter Product Discount (e.g. 10.5)"
          pattern="^\d+(\.\d{1,2})?$"
          title="Please enter a valid percentage (e.g. 10.5)"
        />
      </div>

      <div className="form-group">
        <label>Select Product Category</label>
        <select required className='admin-txt-box' value={selectedCategory} onChange={handleCategoryChange}>
          <option value="">Select a category</option>
          {categories.length > 0 ? (
            categories.map((category) => (
              <option key={category.CategoryID} value={category.CategoryID}>
                {category.EnCategoryName}
              </option>
            ))
          ) : (
            <option disabled>No categories available</option>
          )}
        </select>
      </div>

      <div className="submit-container custom-top-5">
        <button type="submit" className="admin-buttonv1">
          {loading ? 'Uploading...' : 'Submit'}
        </button>
      </div>

       {/* Toast Message */}
           <DspToastMessage  message={toastMessage}  type={toastType} /> 
    </form>
  );
};

export default ProductCategoryDropdown;
