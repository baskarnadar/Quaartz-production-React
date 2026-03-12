 import React,  { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../config';
import { getFileNameFromUrl,getAuthHeaders } from '../../../utils/operation';
import { checkLogin  } from '../../../utils/auth';
const AddNewPainter = () => {
  const navigate = useNavigate();

  const [PtrFullName, setPtrFullName] = useState('');
  const [PtrAddress, setPtrAddress] = useState('');
  const [PtrLocation, setPtrLocation] = useState('');
  const [PtrMobileNo, setPtrMobileNo] = useState('');
  const [PtrIDNumber, setPtrIDNumber] = useState('');
  const [PtrImage, setPtrImage] = useState(null); // will hold file URL string
  const [PtrIDCopy, setPtrIDCopy] = useState(null); // will hold file URL string
  const [PtrAgreementFrom, setPtrAgreementFrom] = useState('');
  const [PtrAgreementTo, setPtrAgreementTo] = useState('');
  const [PtrTermsAndCondition, setPtrTermsAndCondition] = useState('');
  const [PtrPaymentMode, setPtrPaymentMode] = useState('');
  const [PtrIBAN, setPtrIBAN] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for Auth --------------------------------------------------------- 
  useEffect(() => {     checkLogin(navigate);   }, [navigate]);
  // Check for Auth -----------------------------------------------------------

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    let uploadedImageKey = PtrImage;
    let uploadedIDCopyKey = PtrIDCopy;

    // 1. Upload PtrImage file (if selected)
    if (PtrImage && PtrImage instanceof File) {
      const formdata = new FormData();
      formdata.append("image", PtrImage);
      formdata.append("foldername", "painter");

      const uploadResponse = await fetch(`${API_BASE_URL}/product/upload/uploadImage`, {
        method: "POST",
        body: formdata,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Image upload failed with status ${uploadResponse.status}`);
      }

      const uploadResult = await uploadResponse.json();
      uploadedImageKey = uploadResult?.data?.key || uploadResult?.data?.Key;
    }

    // 2. Upload PtrIDCopy file (if selected)
    if (PtrIDCopy && PtrIDCopy instanceof File) {
      const formdata = new FormData();
      formdata.append("image", PtrIDCopy);
      formdata.append("foldername", "painter");

      const uploadResponse = await fetch(`${API_BASE_URL}/product/upload/uploadImage`, {
        method: "POST",
        body: formdata,
      });

      if (!uploadResponse.ok) {
        throw new Error(`ID Copy upload failed with status ${uploadResponse.status}`);
      }

      const uploadResult = await uploadResponse.json();
      uploadedIDCopyKey = uploadResult?.data?.key || uploadResult?.data?.Key;
    }

    // 3. Submit full painter data with uploaded file names (extracted from key)
    const response = await fetch(`${API_BASE_URL}/painter/createpainter`, {
      method: 'POST',
        headers: getAuthHeaders(),
      body: JSON.stringify({
        PtrFullName,
        PtrAddress,
        PtrLocation,
        PtrMobileNo,
        PtrIDNumber,
        PtrImage: getFileNameFromUrl(uploadedImageKey),
        PtrIDCopy: getFileNameFromUrl(uploadedIDCopyKey),
        PtrAgreementFrom,
        PtrAgreementTo,
        PtrTermsAndCondition,
        PtrPaymentMode,
        PtrIBAN,
        createdBy: 'USER',
        updatedBy: 'USER',
        IsDataStatus: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Painter added:', data);

    // Reset form
    setPtrFullName('');
    setPtrAddress('');
    setPtrLocation('');
    setPtrMobileNo('');
    setPtrIDNumber('');
    setPtrImage(null);
    setPtrIDCopy(null);
    setPtrAgreementFrom('');
    setPtrAgreementTo('');
    setPtrTermsAndCondition('');
    setPtrPaymentMode('');
    setPtrIBAN('');

    setError('Painter added successfully!');
  } catch (error) {
    console.error('Error adding painter:', error);
    setError('Failed to add painter.');
  } finally {
    setLoading(false);
  }
};

 

  const handleFileUpload = (setter) => async (e) => {

    const file = e.target.files[0];
  if (file) {
    setter(file); // Store the File object
  }
   // const file = e.target.files[0]; 
   // const formdata = new FormData();
   // formdata.append("image",  file);
   // formdata.append("foldername", "painter/v2"); 
   // const requestOptions = {
   // method: "POST",
    //body: formdata,
    //redirect: "follow"
    //}; 
   
    //fetch( `${API_BASE_URL}/product/upload/uploadImage`, requestOptions)
   // .then((response) => response.text())
   // .then((result) => console.log(result))
   // .catch((error) => console.error(error));
 

  };

  const formRow = (label, input) => (
    <div className="form-row">
      <label>{label}</label>
      {input}
    </div>
  );

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <div className="page-title">
        <h3 style={{ margin: 0 }}>New Painter</h3>

        <button
          type="button"
          onClick={() => navigate('/painter/painterinfo')}
          className="admin-buttonv1"
        >
          Return
        </button>
      </div>

      {formRow(
        'Full Name',
        <input
          className="admin-txt-box"
          type="text"
          value={PtrFullName}
          onChange={(e) => setPtrFullName(e.target.value)}
          required
        />
      )}
      {formRow(
        'PtrAddress',
        <input
          className="admin-txt-box"
          type="text"
          value={PtrAddress}
          onChange={(e) => setPtrAddress(e.target.value)}
          required
        />
      )}
      {formRow(
        'PtrLocation',
        <input
          className="admin-txt-box"
          type="text"
          value={PtrLocation}
          onChange={(e) => setPtrLocation(e.target.value)}
          required
        />
      )}
      {formRow(
        'Mobile No',
        <input
          className="admin-txt-box"
          type="tel"
          value={PtrMobileNo}
          onChange={(e) => setPtrMobileNo(e.target.value)}
          required
        />
      )}
      {formRow(
        'ID Number',
        <input
          className="admin-txt-box"
          type="text"
          value={PtrIDNumber}
          onChange={(e) => setPtrIDNumber(e.target.value)}
          required
        />
      )}

      {formRow(
        'Painter Image',
        <>
          <input 
            className="admin-txt-box"
            type="file"
            accept="image/*"
            onChange={handleFileUpload(setPtrImage)}
          />
          {PtrImage && (
            <img
              src={PtrImage}
              alt="Painter"
              className="file-preview"
              style={{ maxWidth: '150px', marginTop: '10px' }}
            />
          )}
        </>
      )}

      {formRow(
        'ID Copy',
        <>
          <input
            className="admin-txt-box"
            type="file"
            accept="image/*"
            onChange={handleFileUpload(setPtrIDCopy)}
          />
          {PtrIDCopy && (
            <img
              src={PtrIDCopy}
              alt="ID Copy"
              className="file-preview"
              style={{ maxWidth: '150px', marginTop: '10px' }}
            />
          )}
        </>
      )}

      {formRow(
        'Agreement From',
        <input
        required
          className="admin-txt-box"
          type="date"
          value={PtrAgreementFrom}
          onChange={(e) => setPtrAgreementFrom(e.target.value)}
          
        />
      )}
      {formRow(
        'Agreement To',
        <input
        required
          className="admin-txt-box"
          type="date"
          value={PtrAgreementTo}
          onChange={(e) => setPtrAgreementTo(e.target.value)}
          
        />
      )}

      {formRow(
        'Agreed Terms and Condition',
        <textarea
        required
          value={PtrTermsAndCondition}
          onChange={(e) => setPtrTermsAndCondition(e.target.value)}
          
          rows={4}
          className="admin-txt-box"
        />
      )}

      {formRow(
        'Payment Mode',
        <select
        required
          className="admin-txt-box"
          value={PtrPaymentMode}
          onChange={(e) => setPtrPaymentMode(e.target.value)}
          
        >
          <option value="">-- Select Payment Mode --</option>
          <option value="Online">Online</option>
          <option value="Cash">Cash</option>
        </select>
      )}

      {formRow(
        'Bank IBAN No',
        <input
        required
          className="admin-txt-box"
          type="text"
          value={PtrIBAN}
          onChange={(e) => setPtrIBAN(e.target.value)}
          
        />
      )}

      {formRow(
        '',
        <div className="button-group">
          <button className="admin-buttonv1" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button
            className="admin-buttonv1"
            type="button"
            onClick={() => navigate('/painter/painterinfo')}
          >
            Cancel
          </button>
          {error && (
            <p className={error.toLowerCase().includes('success') ? 'message-success' : 'message-error'}>
              {error}
            </p>
          )}
        </div>
      )}
    </form>
  );
};

export default AddNewPainter;
