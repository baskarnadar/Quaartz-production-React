import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../../../config'
import { checkLogin } from '../../../../utils/auth'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPencil } from '@coreui/icons'
import { DspToastMessage ,getAuthHeaders} from '../../../../utils/operation'
const MainProductColorList = () => {
  const [rows, setRows] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('info')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // ✅ UPDATED: use MainColorCodeID (not PrdColorCodeID)
  const [selectedMainColorCodeID, setSelectedMainColorCodeID] = useState(null)

  const perPage = 10
  const navigate = useNavigate()

  useEffect(() => {
    checkLogin(navigate)
  }, [navigate])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) navigate('/login')
  }, [navigate])

  const fetchMainColors = async () => {
    setLoading(true)
    try {
      // ✅ keep SAME endpoint (your backend still uses this route)
      const response = await fetch(`${API_BASE_URL}/lookupdata/productcolor/main/getMaincolorlist`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify({ page: currentPage, limit: perPage }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const msg = data?.message || data?.error || 'Failed to fetch Main Product Color'
        throw new Error(msg)
      }

      // ✅ UPDATED: rows contain MainColor fields
      const list = Array.isArray(data?.data) ? data.data : []
      setRows(list)

      // backend returns no totalCount -> fallback
      const totalCount = Number(data?.totalCount ?? list.length ?? 0)
      setTotalPages(Math.max(1, Math.ceil(totalCount / perPage)))
    } catch (error) {
      console.error(error)
      setToastMessage('Error fetching Main Product Color')
      setToastType('fail')
      setRows([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMainColors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

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

  // ✅ UPDATED: query param uses MainColorCodeID
  const handleModifyClick = (MainColorCodeID) => {
    navigate(`/productcolor/main/modify?MainColorCodeID=${MainColorCodeID}`)
  }

  const handleDeleteClick = (MainColorCodeID) => {
    setSelectedMainColorCodeID(MainColorCodeID)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      // ✅ keep SAME delete endpoint, but payload must use MainColorCodeID
      const response = await fetch(`${API_BASE_URL}/lookupdata/productcolor/main/delMainColor`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify({ MainColorCodeID: selectedMainColorCodeID }),
      })

      const data = await response.json().catch(() => null)

      if (response.ok) {
        setToastMessage(data?.message || 'Main Product Color successfully deleted')
        setToastType('success')
        fetchMainColors()
      } else {
        setToastMessage(data?.message || 'Failed to delete Main Product Color')
        setToastType('fail')
      }
    } catch (err) {
      console.error(err)
      setToastMessage('Error deleting Main Product Color')
      setToastType('fail')
    } finally {
      setShowDeleteModal(false)
      setSelectedMainColorCodeID(null)
    }
  }

  const pageNumbers = getPageRange()

  return (
    <div>
      <div className="page-title">
        <h3 style={{ margin: 0 }}>Main Product Color</h3>
        <button onClick={() => navigate('/productcolor/main/new')} className="add-product-button">
          Add New Color
        </button>
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
                <th>MainColorCode</th>
                <th>MainColorType</th>
                <th>English Name</th>
                <th>Arabic Name</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, index) => (
                <tr key={r.MainColorCodeID || r._id || index}>
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
                        background: r.MainColorCode || '#ffffff',
                        margin: '0 auto',
                      }}
                      title={r.MainColorCode}
                    />
                  </td>

                  <td>{r.MainColorCode}</td>
                  <td>{r.MainColorType}</td>
                  <td>{r.EnMainColorName}</td>
                  <td>{r.ArMainColorName}</td>

                  <td>
                    <CIcon
                      onClick={() => handleModifyClick(r.MainColorCodeID)}
                      icon={cilPencil}
                      size="lg"
                      className="edit-icon"
                    />
                    <CIcon
                      onClick={() => handleDeleteClick(r.MainColorCodeID)}
                      icon={cilTrash}
                      size="lg"
                      className="trash-icon"
                    />
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 14 }}>
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

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

export default MainProductColorList
