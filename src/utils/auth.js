// src/utils/auth.js

export const checkLogin = (navigate) => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login');
  }
};

// auth/checkUserAccess.js
 // auth/checkUserAccess.js

 // auth/IsUserHasAccessThisPage.js

 export async function IsUserHasAccessThisPage(navigate,pageid) {

  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login');
  }

  try {
    const userid = localStorage.getItem('userid');
    const username = localStorage.getItem('username');
    const groupid = localStorage.getItem('groupid');

    // Basic validation
    if (!userid || !username || !groupid) {
       navigate('/login');
      return false;
    }

    const stored = localStorage.getItem('allowedPages');
    if (!stored) {
       navigate('/login');
      return false;
    }

    const allowedPages = JSON.parse(stored); 
    if (Array.isArray(allowedPages) && allowedPages.includes(pageid)) {
      return true;
    } else {
      // User does not have access
      navigate('/login');
      return false;
    }

  } catch (error) {
    console.error('Access check failed:', error);
     navigate('/login');
    return false;
  }
}
