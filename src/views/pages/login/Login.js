// login.js
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../../../config'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      setError('')

      const cleanUsername = String(username || '').trim()
      const cleanPassword = String(password || '')
        .trim()
        .replace(/^"(.*)"$/, '$1')
        .replace(/^'(.*)'$/, '$1')

      const payload = {
        username: cleanUsername,
        password: cleanPassword,
      }

      console.log('LOGIN API URL:', `${API_BASE_URL}/user/isUserValid`)
      console.log('USERNAME STATE:', username)
      console.log('PASSWORD STATE:', password)
      console.log('CLEAN USERNAME:', cleanUsername)
      console.log('CLEAN PASSWORD:', cleanPassword)
      console.log('LOGIN PAYLOAD:', payload)

      const response = await fetch(`${API_BASE_URL}/user/isUserValid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      console.log('API Response:', data)
      console.log('data?.data?.token:', data?.data?.token)
      console.log('data?.data?.UserType:', data?.data?.UserType)

      if (response.ok && data?.data?.token) {
        localStorage.setItem('allowedPages', JSON.stringify(data?.allowedPages || []))
        localStorage.setItem('token', data.data.token)

        localStorage.setItem('userId', data?.data?.UserID || '')
        localStorage.setItem('username', data?.data?.UserName || '')
        localStorage.setItem('usertype', data?.data?.UserType || '')

        console.log('UserType:', data?.data?.UserType)

        if (data?.data?.UserType === 'ADMIN') {
          navigate('/admin/dashboard')
        } else {
          navigate('/dashboard')
        }
      } else {
        handleLogout()
        setError(data?.message || 'Invalid credentials')
      }
    } catch (err) {
      console.error('Login error:', err)
      handleLogout()
      setError('Login failed. Please try again.')
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear()
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
    })
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleLogin()
                    }}
                  >
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account--</p>

                    {error && (
                      <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>
                    )}

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        id="login-username"
                        name="login_username"
                        placeholder="Username"
                        autoComplete="off"
                        value={username}
                        onChange={(e) => {
                          console.log('USERNAME INPUT CHANGED:', e.target.value)
                          setUsername(e.target.value)
                        }}
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        id="login-password"
                        name="login_password"
                        type="password"
                        placeholder="Password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => {
                          console.log('PASSWORD INPUT CHANGED:', e.target.value)
                          setPassword(e.target.value)
                        }}
                      />
                    </CInputGroup>

                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4" type="submit">
                          Login
                        </CButton>
                      </CCol>
                     
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>

              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2> </h2>
                    <p>
                      
                    </p>
                    
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login