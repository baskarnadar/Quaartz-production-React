import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../../config';
import { checkLogin  } from '../../../utils/auth';
import { getAuthHeaders } from '../../../utils/operation';

const ViewPainter = () => {

  const navigate = useNavigate();
  // Check for Auth --------------------------------------------------------- 
  useEffect(() => {     checkLogin(navigate);   }, [navigate]);
  // Check for Auth -----------------------------------------------------------


  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const PrtUserIDVal = queryParams.get('PrtUserID');

  const [PtrFullName, setPtrFullName] = useState('');
  const [PtrAddress, setPtrAddress] = useState('');
  const [PtrLocation, setPtrLocation] = useState('');
  const [PtrMobileNo, setPtrMobileNo] = useState('');
  const [PtrIDNumber, setPtrIDNumber] = useState('');
  const [PtrImage, setPtrImage] = useState(null);
  const [PtrIDCopy, setPtrIDCopy] = useState(null);
  const [PtrAgreementFrom, setPtrAgreementFrom] = useState('');
  const [PtrAgreementTo, setPtrAgreementTo] = useState('');
  const [PtrTermsAndCondition, setPtrTermsAndCondition] = useState('');
  const [PtrPaymentMode, setPtrPaymentMode] = useState('');
  const [PtrIBAN, setPtrIBAN] = useState('');
  const [UserStatus, setUserStatus] = useState('ACTIVE');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchpainterlist = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/painter/getPainterInfo`, {
        method: 'POST',
      headers: getAuthHeaders(),
        body: JSON.stringify({ PrtUserID: PrtUserIDVal }),
      });

      if (!response.ok) throw new Error('Failed to fetch PainterInfos');

      const data = await response.json();
      const painter = data.data?.[0];

      if (painter) {
        setPtrFullName(painter.PtrFullName || '');
        setPtrAddress(painter.PtrAddress || '');
        setPtrLocation(painter.PtrLocation || '');
        setPtrMobileNo(painter.PtrMobileNo || '');
        setPtrIDNumber(painter.PtrIDNumber || '');
        setPtrImage(painter.PtrImageUrl || null);
        setPtrIDCopy(painter.PtrIDCopyUrl || null);
        setPtrAgreementFrom(painter.PtrAgreementFrom || '');
        setPtrAgreementTo(painter.PtrAgreementTo || '');
        setPtrTermsAndCondition(painter.PtrTermsAndCondition || '');
        setPtrPaymentMode(painter.PtrPaymentMode || '');
        setPtrIBAN(painter.PtrIBAN || '');
        setUserStatus(painter.UserStatus || 'ACTIVE');
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching painter details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (PrtUserIDVal) fetchpainterlist();
  }, [PrtUserIDVal]);

  const displayRow = (label, value) => (
    <div className="form-row">
      <label>{label}</label>
      <div className="readonly-value">{value || '-'}</div>
    </div>
  );

  const updateAccountStatus = async () => {
    setError('');
    setSuccessMsg('');
    try {
      const response = await fetch(`${API_BASE_URL}/painter/updateAccStatus`, {
        method: 'POST',
       headers: getAuthHeaders(),
        body: JSON.stringify({
          UserID: PrtUserIDVal,
          UserStatus: UserStatus,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Update failed');

      setSuccessMsg('Account status updated successfully.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update account status');
    }
  };

  return (
    <div className="form-container">
      <div className="page-title">
        <h3 style={{ margin: 0 }}>View Painter</h3>
        <button
          onClick={() => navigate('/painter/painterinfo')}
          className="admin-buttonv1"
          type="button"
        >
          Return
        </button>
      </div>

      {displayRow('Full Name', PtrFullName)}
      {displayRow('Address', PtrAddress)}
      {displayRow('Location', PtrLocation)}
      {displayRow('Mobile No', PtrMobileNo)}
      {displayRow('ID Number', PtrIDNumber)}

      <div className="form-row">
        <label>Painter Image</label>
        {PtrImage ? (
          <img src={PtrImage} alt="Painter" className="file-preview" />
        ) : (
          <div className="readonly-value">No image uploaded</div>
        )}
      </div>

      <div className="form-row">
        <label>ID Copy</label>
        {PtrIDCopy ? (
          <img src={PtrIDCopy} alt="ID Copy" className="file-preview" />
        ) : (
          <div className="readonly-value">No ID copy uploaded</div>
        )}
      </div>

      {displayRow('Agreement From', PtrAgreementFrom)}
      {displayRow('Agreement To', PtrAgreementTo)}

      <div className="form-row">
        <label>Agreed Terms and Condition</label>
        <div className="readonly-value" style={{ whiteSpace: 'pre-wrap' }}>{PtrTermsAndCondition || '-'}</div>
      </div>

      {displayRow('Payment Mode', PtrPaymentMode)}
      {displayRow('Bank IBAN No', PtrIBAN)}

      <div className="form-row">
        <label>Account Status</label>
        <label>
          <input
            type="radio"
            value="ACTIVE"
            checked={UserStatus === 'ACTIVE'}
            onChange={(e) => setUserStatus(e.target.value)}
          />
          Active
        </label>
        <label style={{ marginLeft: '1rem' }}>
          <input
            type="radio"
            value="DE-ACTIVE"
            checked={UserStatus === 'DE-ACTIVE'}
            onChange={(e) => setUserStatus(e.target.value)}
          />
          De-Active
        </label>
      </div>

      <div className="form-row">
        <button type="button" className="admin-buttonv1" onClick={updateAccountStatus}>
          Update Account Status
        </button>
      </div>

      {error && <p className="message-error">{error}</p>}
      {successMsg && <p className="message-success">{successMsg}</p>}
    </div>
  );
};

export default ViewPainter;
