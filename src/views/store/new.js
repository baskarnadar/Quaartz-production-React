import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { checkLogin  } from '../../utils/auth';
import { getAuthHeaders } from '../../utils/operation';
const AddStoreForm = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    StoreCodeID: '',
    StoreName: '',
    SalesRepName: '',
    StoreArea: '',
    CityID: '',
    StoreAdress: '',
    StoreGoogleMapLink: '',
    StoreLatitude: '',
    StoreLongitude: '',
  });
  // Check for Auth --------------------------------------------------------- 
  useEffect(() => {     checkLogin(navigate);   }, [navigate]);
  // Check for Auth -----------------------------------------------------------
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/common/getCity`, {
          method: 'POST',
            headers: getAuthHeaders(),
          body: JSON.stringify({ IsDataStatus: 1 }),
        });
        const result = await response.json();
        setCities(result.data || []);
      } catch (err) {
        console.error('Failed to fetch cities', err);
        setCities([]);
      }
    };
    fetchCities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const payload = {
      ...formData,
      createdBy: 'USER',
      updatedBy: 'USER',
      IsDataStatus: 1,
      createdat: new Date(),
      modifyat: new Date(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/store/createStore`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create store');
      const data = await response.json();
      setMessage('Store added successfully!');
      setFormData({
        StoreCodeID: '',
        StoreName: '',
        SalesRepName: '',
        StoreArea: '',
        CityID: '',
        StoreAdress: '',
        StoreGoogleMapLink: '',
        StoreLatitude: '',
        StoreLongitude: '',
      });
    } catch (error) {
      console.error('Error adding store:', error);
      setMessage('Error adding store.');
    } finally {
      setLoading(false);
    }

     setTimeout(() => {
       navigate('/store/list');
     }, 2000); // 1-second delay

  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="page-title">
        <h3>Add Store</h3>
        <button
          type="button"
          onClick={() => navigate('/store/list')}
          className="admin-buttonv1"
        >
          Return
        </button>
      </div>

      {[
        { label: 'Store Code ID', name: 'StoreCodeID' },
        { label: 'Store Name', name: 'StoreName' },
        { label: 'Sales Rep Name', name: 'SalesRepName' },
        { label: 'Store Area', name: 'StoreArea' },
        { label: 'Store Address', name: 'StoreAdress' },
        { label: 'Google Map Link', name: 'StoreGoogleMapLink' },
        { label: 'Latitude', name: 'StoreLatitude' },
        { label: 'Longitude', name: 'StoreLongitude' },
      ].map(({ label, name }) => (
        <div key={name} className="form-group">
          <label>{label}</label>
          <input
            className="admin-txt-box"
            type="text"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={`Enter ${label}`}
          />
        </div>
      ))}

      <div className="form-group">
        <label>City</label>
        <select
          className="admin-txt-box"
          name="CityID"
          value={formData.CityID}
          onChange={handleChange}
        >
          <option value="">Select a city</option>
          {cities.map((city) => (
            <option key={city.CityID} value={city.CityID}>
              {city.EnCityName} / {city.ArCityName}
            </option>
          ))}
        </select>
      </div>

      <div className="submit-container custom-top-5">
        <button type="submit" className="admin-buttonv1">
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {message && (
        <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
    </form>
  );
};

export default AddStoreForm;
