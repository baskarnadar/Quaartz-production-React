import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../../../config'
import { checkLogin } from '../../../../utils/auth'
import '../../../../scss/toast.css'
import { DspToastMessage ,getAuthHeaders} from '../../../../utils/operation'

const SubProductColorNew = () => {
  const navigate = useNavigate()

  // ✅ Dropdown data (Main colors)
  const [mainColors, setMainColors] = useState([])
  const [mainColorsLoading, setMainColorsLoading] = useState(false)

  // ✅ Selected MainColorCodeID from dropdown
  const [MainColorCodeID, setMainColorCodeID] = useState('')

  // ✅ SubColor fields
  const [SubColorCode, setSubColorCode] = useState('#ffffff')

  // ✅ UPDATED HERE → default value PRODUCT
  const [SubColorType, setSubColorType] = useState('PRODUCT')

  const [EnSubColorName, setEnSubColorName] = useState('')
  const [ArSubColorName, setArSubColorName] = useState('')

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

  // ------------------------------------------------------------
  // Fetch Main Colors for dropdown
  // ------------------------------------------------------------
  useEffect(() => {
    const fetchMainColors = async () => {
      setMainColorsLoading(true)
      try {
        const res = await fetch(`${API_BASE_URL}/lookupdata/productcolor/main/getMaincolorlist`, {
          method: 'POST',
            headers: getAuthHeaders(),
          body: JSON.stringify({}),
        })

        const json = await res.json().catch(() => null)

        if (!res.ok) {
          const msg = json?.message || json?.error || `HTTP error: ${res.status}`
          throw new Error(msg)
        }

        const list = Array.isArray(json?.data) ? json.data : []
        setMainColors(list)

        if (!MainColorCodeID && list.length > 0) {
          setMainColorCodeID(String(list[0]?.MainColorCodeID || '').trim())
        }
      } catch (err) {
        console.error('Error fetching main colors:', err)
        setMainColors([])
        setToastMessage(err?.message || 'Failed to load Main Colors.')
        setToastType('fail')
      } finally {
        setMainColorsLoading(false)
      }
    }

    fetchMainColors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!MainColorCodeID || !SubColorCode || !SubColorType || !EnSubColorName || !ArSubColorName) {
      setToastMessage('Please fill in all required fields.')
      setToastType('fail')
      return
    }

    setLoading(true)
    setToastMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/lookupdata/productcolor/sub/addSubColor`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify({
          MainColorCodeID: String(MainColorCodeID).trim(),
          SubColorCode: String(SubColorCode).trim(),
          SubColorType: String(SubColorType).trim(),
          EnSubColorName: String(EnSubColorName).trim(),
          ArSubColorName: String(ArSubColorName).trim(),
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

      setToastMessage('Sub Product Color added successfully!')
      setToastType('success')

      setTimeout(() => navigate('/productcolor/sub/list'), 1200)
    } catch (err) {
      console.error('Error adding sub color:', err)
      setToastMessage(err?.message || 'Failed to add Sub Product Color.')
      setToastType('fail')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="page-title">
        <h3 style={{ margin: 0 }}>Add Sub Product Color</h3>
        <button type="button" onClick={() => navigate('/productcolor/sub/list')} className="admin-buttonv1">
          Return
        </button>
      </div>

      {/* Dropdown Main Colors */}
      <div className="form-group">
        <label>Main Color (Arabic Name)</label>
        <select
          className="admin-txt-box"
          value={MainColorCodeID}
          onChange={(e) => setMainColorCodeID(e.target.value)}
          disabled={mainColorsLoading}
          required
        >
          <option value="">{mainColorsLoading ? 'Loading...' : 'Select Main Color'}</option>

          {mainColors.map((c) => (
            <option key={c.MainColorCodeID || c._id} value={c.MainColorCodeID}>
              {c.ArMainColorName || c.MainColorCodeID}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>SubColorCode</label>
        <input
          className="admin-txt-box"
          type="text"
          value={SubColorCode}
          onChange={(e) => setSubColorCode(e.target.value)}
          placeholder="Enter Color Code (ex: #ccdadd)"
          required
        />
      </div>

      <div className="form-group">
        <label>SubColorType</label>
        <input
          className="admin-txt-box"
          type="text"
          value={SubColorType}
          onChange={(e) => setSubColorType(e.target.value)}
          placeholder="Enter Color Type (ex: SOLID)"
          required
        />
      </div>

      <div className="form-group">
        <label>English Color Name</label>
        <input
          className="admin-txt-box"
          type="text"
          value={EnSubColorName}
          onChange={(e) => setEnSubColorName(e.target.value)}
          placeholder="Enter English Color Name"
          required
        />
      </div>

      <div className="form-group">
        <label>Arabic Color Name</label>
        <input
          className="admin-txt-box"
          type="text"
          value={ArSubColorName}
          onChange={(e) => setArSubColorName(e.target.value)}
          placeholder="Enter Arabic Color Name"
          required
        />
      </div>

      <div className="submit-container custom-top-5">
        <button type="submit" className="admin-buttonv1" disabled={loading || mainColorsLoading}>
          {loading ? 'Saving...' : 'Submit'}
        </button>
      </div>

      <DspToastMessage message={toastMessage} type={toastType} />
    </form>
  )
}

export default SubProductColorNew
