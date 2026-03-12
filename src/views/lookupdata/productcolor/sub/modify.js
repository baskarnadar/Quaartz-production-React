import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { API_BASE_URL } from '../../../../config'
import { checkLogin } from '../../../../utils/auth'
import '../../../../scss/toast.css'
import { DspToastMessage ,getAuthHeaders} from '../../../../utils/operation'

const SubProductColorModify = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const SubColorCodeID = queryParams.get('SubColorCodeID')

  const [loading, setLoading] = useState(false)

  // Sub fields
  const [SubColorCode, setSubColorCode] = useState('#ffffff')
  const [SubColorType, setSubColorType] = useState('')
  const [EnSubColorName, setEnSubColorName] = useState('')
  const [ArSubColorName, setArSubColorName] = useState('')

  // ✅ Dropdown data (Main colors)
  const [mainColors, setMainColors] = useState([])
  const [mainColorsLoading, setMainColorsLoading] = useState(false)

  // ✅ Selected MainColorCodeID (from row + dropdown)
  const [MainColorCodeID, setMainColorCodeID] = useState('')

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

  // --------------------------
  // Helpers
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

  // ------------------------------------------------------------
  // 1) Fetch SubColor row first (so we know MainColorCodeID)
  // ------------------------------------------------------------
  useEffect(() => {
    const fetchSubRow = async () => {
      if (!SubColorCodeID) {
        setToastMessage('Missing SubColorCodeID in URL.')
        setToastType('fail')
        return
      }

      const url = `${API_BASE_URL}/lookupdata/productcolor/sub/editSubColor`
      const payload = { SubColorCodeID: String(SubColorCodeID) }

      try {
        const { res, json, rawText } = await logFetch('EDIT (fetch sub color)', url, {
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
        if (!row) {
          setToastMessage('No data returned from edit API.')
          setToastType('fail')
          console.warn('No row returned. Full response:', json || rawText)
          return
        }

        setSubColorCode(row.SubColorCode || '#ffffff')
        setSubColorType(row.SubColorType || '')
        setEnSubColorName(row.EnSubColorName || '')
        setArSubColorName(row.ArSubColorName || '')

        // ✅ set selected main id from DB row
        setMainColorCodeID(String(row.MainColorCodeID || '').trim())
      } catch (err) {
        console.error('Error fetching sub color:', err)
        setToastMessage('Error fetching sub color.')
        setToastType('fail')
      }
    }

    fetchSubRow()
  }, [SubColorCodeID])

  // ------------------------------------------------------------
  // 2) Fetch Main Colors list for dropdown
  //    Dropdown will auto-select because value={MainColorCodeID}
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

        // Optional fallback: if row doesn't have MainColorCodeID, select first
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

  // --------------------------
  // SUBMIT: update
  // --------------------------
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setToastMessage('')

    if (!SubColorCodeID) {
      setToastMessage('Missing SubColorCodeID.')
      setToastType('fail')
      setLoading(false)
      return
    }

    if (
      !String(MainColorCodeID).trim() ||
      !String(SubColorCode).trim() ||
      !String(SubColorType).trim() ||
      !String(EnSubColorName).trim() ||
      !String(ArSubColorName).trim()
    ) {
      setToastMessage('Please fill in all required fields.')
      setToastType('fail')
      setLoading(false)
      return
    }

    const payload = {
      SubColorCodeID: String(SubColorCodeID).trim(),
      MainColorCodeID: String(MainColorCodeID).trim(), // ✅ from dropdown
      SubColorCode: String(SubColorCode).trim(),
      SubColorType: String(SubColorType).trim(),
      EnSubColorName: String(EnSubColorName).trim(),
      ArSubColorName: String(ArSubColorName).trim(),
      ModifyBy: 'USER',
      modifiedAt: new Date().toISOString(),
    }

    const url = `${API_BASE_URL}/lookupdata/productcolor/sub/updateSubColor`

    try {
      const { res, json } = await logFetch('UPDATE (save sub color)', url, {
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

      setToastMessage(json?.message || 'Sub Product Color updated successfully!')
      setToastType('success')
      setTimeout(() => navigate('/productcolor/sub/list'), 1200)
    } catch (err) {
      console.error('Error updating sub color:', err)
      setToastMessage('Failed to update Sub Product Color.')
      setToastType('fail')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="page-title">
        <h3>Sub Product Color - Edit</h3>
        <button type="button" onClick={() => navigate('/productcolor/sub/list')} className="admin-buttonv1">
          Return
        </button>
      </div>

      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>
        SubColorCodeID: <b>{SubColorCodeID || 'N/A'}</b>
      </div>

      {/* ✅ Dropdown Main Colors (auto-selected using MainColorCodeID from row) */}
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
           
        />
      </div>

      <div className="form-group">
        <label>SubColorType</label>
        <input
          className="admin-txt-box"
          type="text"
          value={SubColorType}
          onChange={(e) => setSubColorType(e.target.value)}
          placeholder="Enter Color Type"
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
          {loading ? 'Saving...' : 'Update Color'}
        </button>
      </div>

      <DspToastMessage message={toastMessage} type={toastType} />
    </form>
  )
}

export default SubProductColorModify
