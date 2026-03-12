// src/views/pages/logout/Logout.js
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Logout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // ✅ Same logout logic you use in Login
    try {
      localStorage.clear()
      sessionStorage.clear()
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
      })
    } catch (e) {
      console.error('Logout error:', e)
    }

    // ✅ redirect to login
    navigate('/login', { replace: true })
  }, [navigate])

  return null
}

export default Logout