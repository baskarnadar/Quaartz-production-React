import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../../../config'
import { checkLogin } from '../../../../utils/auth'
import '../../../../scss/toast.css'
import { DspToastMessage ,getAuthHeaders} from '../../../../utils/operation'

const MainProductColorNew = () => {
  const navigate = useNavigate()

  // ✅ UPDATED: MainColor fields (match backend addMainColor payload)
  const [MainColorCode, setMainColorCode] = useState('#ffffff')
  const [MainColorType, setMainColorType] = useState('')
  const [EnMainColorName, setEnMainColorName] = useState('')
  const [ArMainColorName, setArMainColorName] = useState('')

  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('info')

  useEffect(() => {
    checkLogin(navigate)
  }, [navigate])

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(''), 2000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // ✅ UPDATED validation keys
    if (!MainColorCode || !MainColorType || !EnMainColorName || !ArMainColorName) {
      setToastMessage('Please fill in all required fields.')
      setToastType('fail')
      return
    }

    setLoading(true)
    setToastMessage('')

    try {
      // ✅ UPDATED endpoint to match your route:
      // http://localhost:3000/api/lookupdata/productcolor/main/addMainColor
      const response = await fetch(`${API_BASE_URL}/lookupdata/productcolor/main/addMainColor`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify({
          MainColorCode: String(MainColorCode).trim(),
          MainColorType: String(MainColorType).trim(),
          EnMainColorName: String(EnMainColorName).trim(),
          ArMainColorName: String(ArMainColorName).trim(),
          IsDataStatus: 1,
          CreatedBy: 'USER',
          ModifyBy: 'USER',
        }),
      })

      const json = await response.json().catch(() => null)

      if (!response.ok) {
        const msg = json?.message || json?.error || `HTTP error: ${response.status}`
        throw new Error(msg)
      }

      setToastMessage('Main Product Color added successfully!')
      setToastType('success')

      setTimeout(() => navigate('/productcolor/main/list'), 1200)
    } catch (err) {
      console.error('Error adding main color:', err)
      setToastMessage(err?.message || 'Failed to add Main Product Color.')
      setToastType('fail')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="page-title">
        <h3 style={{ margin: 0 }}>Add Main Product Color</h3>
        <button type="button" onClick={() => navigate('/productcolor/main/list')} className="admin-buttonv1">
          Return
        </button>
      </div>

      <div className="form-group">
        <label>MainColorCode</label>
        <input
          className="admin-txt-box"
          type="text"
          value={MainColorCode}
          onChange={(e) => setMainColorCode(e.target.value)}
          placeholder="Enter Color Code (ex: #ccdadd)"
          required
        />
      </div>

      <div className="form-group">
        <label>MainColorType</label>
        <input
          className="admin-txt-box"
          type="text"
          value={MainColorType}
          onChange={(e) => setMainColorType(e.target.value)}
          placeholder="Enter Color Type (ex: SOLID)"
          required
        />
      </div>

      <div className="form-group">
        <label>English Color Name</label>
        <input
          className="admin-txt-box"
          type="text"
          value={EnMainColorName}
          onChange={(e) => setEnMainColorName(e.target.value)}
          placeholder="Enter English Color Name"
          required
        />
      </div>

      <div className="form-group">
        <label>Arabic Color Name</label>
        <input
          className="admin-txt-box"
          type="text"
          value={ArMainColorName}
          onChange={(e) => setArMainColorName(e.target.value)}
          placeholder="Enter Arabic Color Name"
          required
        />
      </div>

      <div className="submit-container custom-top-5">
        <button type="submit" className="admin-buttonv1" disabled={loading}>
          {loading ? 'Saving...' : 'Submit'}
        </button>
      </div>

      <DspToastMessage message={toastMessage} type={toastType} />
    </form>
  )
}

export default MainProductColorNew
