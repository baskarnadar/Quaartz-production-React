import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../../../config'
import { checkLogin } from '../../../../utils/auth'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPencil } from '@coreui/icons'
import { DspToastMessage ,getAuthHeaders} from '../../../../utils/operation'

const SubProductColorList = () => {
  const [rows, setRows] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('info')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // ✅ UPDATED: SubColorCodeID
  const [selectedSubColorCodeID, setSelectedSubColorCodeID] = useState(null)

  // ✅ Search + Filter
  const [searchText, setSearchText] = useState('')
  const [filterByName, setFilterByName] = useState('all') // all | en | ar | both

  // ✅ NEW: Filter by MainColorCodeID (dropdown)
  const [mainColorFilter, setMainColorFilter] = useState('') // '' => All

  // ✅ NEW: Page size dropdown (10,25,50,100,500)
  const [perPage, setPerPage] = useState(10)

  const navigate = useNavigate()

  useEffect(() => {
    checkLogin(navigate)
  }, [navigate])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) navigate('/login')
  }, [navigate])

  const fetchSubColors = async () => {
    setLoading(true)
    try {
      // ✅ UPDATED endpoint: sub
      const response = await fetch(`${API_BASE_URL}/lookupdata/productcolor/sub/getSubcolorlist`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify({ page: currentPage, limit: perPage }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const msg = data?.message || data?.error || 'Failed to fetch Sub Product Color'
        throw new Error(msg)
      }

      // ✅ UPDATED: rows contain SubColor fields
      const list = Array.isArray(data?.data) ? data.data : []
      setRows(list)

      // backend returns no totalCount -> fallback
      const totalCount = Number(data?.totalCount ?? list.length ?? 0)
      setTotalPages(Math.max(1, Math.ceil(totalCount / perPage)))
    } catch (error) {
      console.error(error)
      setToastMessage('Error fetching Sub Product Color')
      setToastType('fail')
      setRows([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubColors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, perPage])

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(''), 3000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  const handlePageClick = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return
    setCurrentPage(pageNumber)
  }

  const getPageRange = () => {
    const range = []
    const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1
    const endPage = Math.min(startPage + 4, totalPages)
    for (let i = startPage; i <= endPage; i++) range.push(i)
    return range
  }

  // ✅ UPDATED: query param uses SubColorCodeID
  const handleModifyClick = (SubColorCodeID) => {
    navigate(`/productcolor/sub/modify?SubColorCodeID=${SubColorCodeID}`)
  }

  const handleDeleteClick = (SubColorCodeID) => {
    setSelectedSubColorCodeID(SubColorCodeID)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      // ✅ UPDATED delete endpoint + payload
      const response = await fetch(`${API_BASE_URL}/lookupdata/productcolor/sub/delSubColor`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify({ SubColorCodeID: selectedSubColorCodeID }),
      })

      const data = await response.json().catch(() => null)

      if (response.ok) {
        setToastMessage(data?.message || 'Sub Product Color successfully deleted')
        setToastType('success')
        fetchSubColors()
      } else {
        setToastMessage(data?.message || 'Failed to delete Sub Product Color')
        setToastType('fail')
      }
    } catch (err) {
      console.error(err)
      setToastMessage('Error deleting Sub Product Color')
      setToastType('fail')
    } finally {
      setShowDeleteModal(false)
      setSelectedSubColorCodeID(null)
    }
  }

  // ✅ Build MainColorCodeID options from loaded rows (current page)
  // ✅ UPDATED (as requested):
  // - Dropdown displays ONLY color NAME (no code)
  // - Still filters by MainColorCodeID internally
  const mainColorOptions = useMemo(() => {
    const map = new Map()
    ;(rows || []).forEach((r) => {
      const id = r?.MainColorCodeID
      if (id === null || id === undefined || String(id).trim() === '') return
      const key = String(id)

      // Prefer English name, fallback to Arabic, fallback to existing old label/code
      const name =
        String(r?.EnMainColorName ?? '').trim() ||
        String(r?.ArMainColorName ?? '').trim() ||
        ''

      // ✅ IMPORTANT: label = NAME ONLY (no key shown)
      const label = name || 'Unknown'

      if (!map.has(key)) map.set(key, label)
    })

    // sort by label
    const arr = Array.from(map.entries()).map(([value, label]) => ({ value, label }))
    arr.sort((a, b) => String(a.label).localeCompare(String(b.label)))
    return arr
  }, [rows])

  // ✅ Filtered rows (client-side)
  const filteredRows = useMemo(() => {
    const q = String(searchText || '').trim().toLowerCase()
    const mainId = String(mainColorFilter || '').trim()

    return (rows || []).filter((r) => {
      // 1) MainColorCodeID filter
      if (mainId) {
        const rMain = String(r?.MainColorCodeID ?? '').trim()
        if (rMain !== mainId) return false
      }

      // 2) Search filter
      if (!q) return true

      const en = String(r?.EnSubColorName ?? '').toLowerCase()
      const ar = String(r?.ArSubColorName ?? '').toLowerCase()
      const code = String(r?.SubColorCode ?? '').toLowerCase()
      const type = String(r?.SubColorType ?? '').toLowerCase()

      // ✅ include main color NAME in search (so user can search by main color name too)
      const mainEn = String(r?.EnMainColorName ?? '').toLowerCase()
      const mainAr = String(r?.ArMainColorName ?? '').toLowerCase()

      // keep your existing variables (mainName/mainCodeIdText) for compatibility
      const mainName = String(r?.ArMainColorName ?? '').toLowerCase()
      const mainCodeIdText = String(r?.MainColorCodeID ?? '').toLowerCase()

      if (filterByName === 'en') return en.includes(q)
      if (filterByName === 'ar') return ar.includes(q)
      if (filterByName === 'both') return en.includes(q) || ar.includes(q)

      // all
      return (
        en.includes(q) ||
        ar.includes(q) ||
        code.includes(q) ||
        type.includes(q) ||
        mainName.includes(q) ||
        mainCodeIdText.includes(q) ||
        mainEn.includes(q) ||
        mainAr.includes(q)
      )
    })
  }, [rows, searchText, filterByName, mainColorFilter])

  const pageNumbers = getPageRange()

  return (
    <div>
      <div className="page-title">
        <h3 style={{ margin: 0 }}>Sub Product Color</h3>
        <button onClick={() => navigate('/productcolor/sub/new')} className="add-product-button">
          Add New Color
        </button>
      </div>

      {/* ✅ Search + Filters (includes MainColorCodeID filter) */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* MainColorCodeID Filter */}
          <select
            value={mainColorFilter}
            onChange={(e) => setMainColorFilter(e.target.value)}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.15)',
              outline: 'none',
              minWidth: 220,
            }}
            title="Filter by Main Color"
          >
            <option value="">All Main Colors</option>
            {mainColorOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* ✅ NEW: Page size dropdown */}
          <select
            value={perPage}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              setPerPage(v)
              setCurrentPage(1) // ✅ reset to first page when page size changes
            }}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.15)',
              outline: 'none',
              minWidth: 140,
            }}
            title="Page Size"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
          </select>

          {/* Search box */}
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search color name / code..."
            style={{
              width: 280,
              maxWidth: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.15)',
              outline: 'none',
            }}
          />

          {/* Search scope */}
          <select
            value={filterByName}
            onChange={(e) => setFilterByName(e.target.value)}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.15)',
              outline: 'none',
              minWidth: 160,
            }}
            title="Filter where to search"
          >
            <option value="all">All Fields</option>
            <option value="en">English Name</option>
            <option value="ar">Arabic Name</option>
            <option value="both">English + Arabic</option>
          </select>

          {(searchText || mainColorFilter) && (
            <button
              className="admin-buttonv1"
              onClick={() => {
                setSearchText('')
                setFilterByName('all')
                setMainColorFilter('')
              }}
              style={{ padding: '8px 12px' }}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{ fontSize: 13, opacity: 0.8 }}>
          Showing <strong>{filteredRows.length}</strong> result(s)
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <table className="grid-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Color</th>
                <th>SubColorCode</th>
                <th>SubColorType</th>
                <th>English Name</th>
                <th>Arabic Name</th>
                <th>MainColorCodeID</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((r, index) => (
                <tr key={r.SubColorCodeID || r._id || index}>
                  <td>
                    <strong>{(currentPage - 1) * perPage + index + 1}</strong>
                  </td>

                  <td style={{ width: 80 }}>
                    <div
                      style={{
                        width: 34,
                        height: 20,
                        borderRadius: 6,
                        border: '1px solid rgba(0,0,0,0.15)',
                        background: r.SubColorCode || '#ffffff',
                        margin: '0 auto',
                      }}
                      title={r.SubColorCode}
                    />
                  </td>

                  <td>{r.SubColorCode}</td>
                  <td>{r.SubColorType}</td>
                  <td>{r.EnSubColorName}</td>
                  <td>{r.ArSubColorName}</td>

                  {/* ✅ Display MAIN COLOR NAME instead of code */}
                  <td>{r.EnMainColorName || r.ArMainColorName || ''}</td>

                  <td>
                    <CIcon
                      onClick={() => handleModifyClick(r.SubColorCodeID)}
                      icon={cilPencil}
                      size="lg"
                      className="edit-icon"
                    />
                    <CIcon
                      onClick={() => handleDeleteClick(r.SubColorCodeID)}
                      icon={cilTrash}
                      size="lg"
                      className="trash-icon"
                    />
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 14 }}>
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ✅ KEEP your pagination (still based on backend pages) */}
          <div className="pagination-container">
            <button
              className="pagination-button"
              onClick={() => handlePageClick(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {'<<'}
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                className={`pagination-button ${currentPage === pageNumber ? 'active' : ''}`}
                onClick={() => handlePageClick(pageNumber)}
                disabled={currentPage === pageNumber}
              >
                {pageNumber}
              </button>
            ))}

            <button
              className="pagination-button"
              onClick={() => handlePageClick(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {'>>'}
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content_50">
            <h4>Confirm Delete</h4>
            <p>Are you sure you want to delete this Color?</p>
            <div className="modal-buttons">
              <button className="admin-buttonv1" onClick={confirmDelete}>
                Yes
              </button>
              <button className="admin-buttonv1" onClick={() => setShowDeleteModal(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <DspToastMessage message={toastMessage} type={toastType} />
    </div>
  )
}

export default SubProductColorList
