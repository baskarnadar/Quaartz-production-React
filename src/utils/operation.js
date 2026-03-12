 
import React, { useEffect, useState } from 'react';
import '../scss/toast.css';  
import { BaseURL  } from '../config'
// Display status with color
export function dspStatus(statusVal) {
  const status = (statusVal || '').toUpperCase(); // Normalize & handle null
  let color;

  switch (status) {
    case 'ACTIVE':
      color = 'green';
      break;
    case 'DE-ACTIVE':
      color = 'red';
      break;
    default:
      color = 'gray';
      break;
  }

  return <span style={{ color, fontWeight: 'bold' }}>{statusVal || 'Unknown'}</span>;
}

// Extract file name from a URL string
export function getFileNameFromUrl(key) {
 if (typeof key !== 'string') {
    console.warn('Expected a string for key but got:', key);
    return '';
  }

  const parts = key.split('/');
  
  return parts[parts.length - 1]; // Returns "filename.png"
}
export function generateOfferCode(key) {
  
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };


 
 

 export const DspToastMessage = ({ message, type = 'info', duration = 3000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  if (!visible || !message) return null;

  // Just render one div with class based on type
  // Make sure your CSS handles 'success', 'error', etc.
  return (
    <div className={`toast-message-${type}`}>
      {message}
    </div>
  );
};

 // src/utils/statusUtils.js

export const getStatusBadgeColor = (status) => {
  const statusColorMap = {
    'Pending': 'warning',
    'Approved': 'success',
    'Rejected': 'danger',
    'Delivered': 'primary',
    'Cancelled': 'danger',
     'Completed': 'success',
       'New': 'primary',
         'NEW': 'primary',
    // Add more as needed
  };

  return statusColorMap[status] || 'dark'; // default fallback color
};
export function getAuthHeaders() {
  const token = localStorage.getItem('token'); 
  console.log("token:", token);

  // ✅ Check expiry before returning headers
  if (!token || isTokenExpired(token)) {
    console.warn("Token missing or expired — redirecting to login");
    localStorage.removeItem('token');
    window.location.href = BaseURL;
    return {}; // return empty headers
  }

  return { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export function getAuthHeadersV1() {
  const token = localStorage.getItem('token');
  console.log("token:", token); 
  return { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}
 function isTokenExpired(token) {
  try {
    // JWT format: header.payload.signature → we take payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000); // current time in seconds
    return payload.exp && payload.exp < now;
  } catch (e) {
    console.error("Invalid token format", e);
    return true; // treat as expired if broken
  }
}
