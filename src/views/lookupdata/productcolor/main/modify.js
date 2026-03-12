import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { API_BASE_URL } from '../../../../config'
import { checkLogin } from '../../../../utils/auth'
import '../../../../scss/toast.css'
import { DspToastMessage ,getAuthHeaders} from '../../../../utils/operation'

const MainProductColorModify = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  // ✅ UPDATED: use MainColorCodeID from query string
  const MainColorCodeID = queryParams.get('MainColorCodeID')
 
  const [loading, setLoading] = useState(false)

  // ✅ UPDATED: use MainColor fields (match DB)
  const [MainColorCode, setMainColorCode] = useState('#ffffff')
  const [MainColorType, setMainColorType] = useState('')
  const [EnMainColorName, setEnMainColorName] = useState('')
  const [ArMainColorName, setArMainColorName] = useState('')

  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('info')

  useEffect(() => {
    checkLogin(navigate)
  }, [navigate])

  // --------------------------
  // Debug helpers
  // --------------------------
  const safeJsonParse = (text) => {
    try {
      return JSON.parse(text)
    } catch {
      return null
    }
  }

  const logFetch = async (label, url, options) => {
    const start = performance.now()
    console.groupCollapsed(`🌐 ${label}`)
    console.log('URL:', url)
    console.log('OPTIONS:', options)

    try {
      const res = await fetch(url, options)

      const ms = Math.round(performance.now() - start)
      const headersObj = {}
      try {
        for (const [k, v] of res.headers.entries()) headersObj[k] = v
      } catch {}

      const rawText = await res.text()
      const json = safeJsonParse(rawText)

      console.log('STATUS:', res.status, res.statusText, `(${ms}ms)`)
      console.log('HEADERS:', headersObj)
      console.log('RAW RESPONSE TEXT:', rawText)
      console.log('PARSED JSON:', json)
      console.groupEnd()

      return { res, rawText, json }
    } catch (err) {
      console.error('FETCH ERROR:', err)
      console.groupEnd()
      throw err
    }
  }

  // --------------------------
  // FETCH: data for edit form
  // --------------------------
  useEffect(() => {
    const fetchData = async () => {
      if (!MainColorCodeID) {
        console.warn('Missing MainColorCodeID in URL query string.')
        setToastMessage('Missing MainColorCodeID in URL.')
        setToastType('fail')
        return
      }

      // ✅ keep SAME endpoint name (backend route)
      const url = `${API_BASE_URL}/lookupdata/productcolor/main/editMainColor`

      // ✅ IMPORTANT: your backend controller editPrdColor still reads MainColorCodeID
      // so we send it, but value is MainColorCodeID
      const payload = { MainColorCodeID: String(MainColorCodeID) }

      try {
        const { res, json, rawText } = await logFetch('EDIT (fetch main color)', url, {
          method: 'POST',
            headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const msg = json?.message || json?.Message || json?.error || `Edit API failed: HTTP ${res.status}`
          setToastMessage(msg)
          setToastType('fail')
          return
        }

        const row = json?.data
        if (row) {
          // ✅ UPDATED: read MainColor fields from DB
          setMainColorCode(row.MainColorCode || '#ffffff')
          setMainColorType(row.MainColorType || '')
          setEnMainColorName(row.EnMainColorName || '')
          setArMainColorName(row.ArMainColorName || '')
        } else {
          console.warn('No row returned. Full response:', json || rawText)
          setToastMessage('No data returned from edit API.')
          setToastType('fail')
        }
      } catch (err) {
        console.error('Error fetching main color:', err)
        setToastMessage('Error fetching main color.')
        setToastType('fail')
      }
    }

    fetchData()
  }, [MainColorCodeID])

  // --------------------------
  // SUBMIT: update
  // --------------------------
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setToastMessage('')

    if (!MainColorCodeID) {
      setToastMessage('Missing MainColorCodeID.')
      setToastType('fail')
      setLoading(false)
      return
    }

    if (
      !String(MainColorCode).trim() ||
      !String(MainColorType).trim() ||
      !String(EnMainColorName).trim() ||
      !String(ArMainColorName).trim()
    ) {
      setToastMessage('Please fill in all required fields.')
      setToastType('fail')
      setLoading(false)
      return
    }

    // ✅ IMPORTANT:
    // Your backend update route is still updatePrdColor and it updates PrdColor* fields.
    // But your DB fields are MainColor*. So payload must be MainColor* AND backend must accept them.
    //
    // Since you asked "use same fields" (MainColor fields), we send MainColor fields here.
    const payload = {
      MainColorCodeID: String(MainColorCodeID),
      MainColorCode: String(MainColorCode).trim(),
      MainColorType: String(MainColorType).trim(),
      EnMainColorName: String(EnMainColorName).trim(),
      ArMainColorName: String(ArMainColorName).trim(),
      ModifyBy: 'USER',
      modifiedAt: new Date().toISOString(),
    }

    // ✅ keep SAME endpoint (as your backend)
    const url = `${API_BASE_URL}/lookupdata/productcolor/main/updateMainColor`

    try {
      const { res, json } = await logFetch('UPDATE (save main color)', url, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const msg =
          json?.message ||
          json?.Message ||
          json?.error?.message ||
          json?.error ||
          `Update API failed: HTTP ${res.status}`
        setToastMessage(msg)
        setToastType('fail')
        setLoading(false)
        return
      }

      setToastMessage(json?.message || 'Main Product Color updated successfully!')
      setToastType('success')

      // ✅ fixed: list route is /productcolor/main/list (not listt)
      setTimeout(() => navigate('/productcolor/main/list'), 1200)
    } catch (err) {
      console.error('Error updating main color:', err)
      setToastMessage('Failed to update Main Product Color.')
      setToastType('fail')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="page-title">
        <h3>Main Product Color - Edit</h3>
        <button type="button" onClick={() => navigate('/productcolor/main/list')} className="admin-buttonv1">
          Return
        </button>
      </div>

      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>
        MainColorCodeID: <b>{MainColorCodeID || 'N/A'}</b>
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
          placeholder="Enter Color Type"
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
          {loading ? 'Saving...' : 'Update Color'}
        </button>
      </div>

      <DspToastMessage message={toastMessage} type={toastType} />
    </form>
  )
}

export default MainProductColorModify
