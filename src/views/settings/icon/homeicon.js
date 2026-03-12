import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../../config'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPencil, cilX } from '@coreui/icons'
import { checkLogin } from '../../../utils/auth'
import { getAuthHeaders } from '../../../utils/operation';
const StoreListWithPagination = () => {
  const [stores, setStores] = useState([]) // lang pack items
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ✅ Modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  // ✅ status api loading (per item)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)

  const storesPerPage = 10
  const navigate = useNavigate()

  // Check for Auth ---------------------------------------------------------
  useEffect(() => {
    checkLogin(navigate)
  }, [navigate])
  // Check for Auth -----------------------------------------------------------

  // Check for login
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  

  const fetchicon = async () => {
    setLoading(true)
    setError('')
    console.log(API_BASE_URL)
    try {
      const response = await fetch(`${API_BASE_URL}/setting/getAllHomeIcon`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })

      if (!response.ok) throw new Error('Failed to fetch language pack')

      const data = await response.json()

      // ✅ Your API returns: { statusCode, message, data:[...], totalCount? }
      const list = data?.data || []
      setStores(list)

      const count = data?.totalCount || list.length
      setTotalPages(Math.max(1, Math.ceil(count / storesPerPage)))
    } catch (err) {
      console.log(err)
      setError('Error fetching language pack')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchicon()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const handlePageClick = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return
    setCurrentPage(pageNumber)
  }

  // ✅ OPEN MODAL
  const handleModifyClick = (item) => {
    setSelectedItem(item)
    setShowEditModal(true)
  }

  const closeModal = () => {
    setShowEditModal(false)
    setSelectedItem(null)
  }

  // ⚠️ Delete not connected
  const handleDeleteClick = async (item) => {
    alert('Delete API not connected yet. Tell me your delete endpoint for tbllangpack.')
    console.log('Delete requested for:', item)
  }

  const getPageRange = () => {
    const range = []
    const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1
    const endPage = Math.min(startPage + 4, totalPages)
    for (let i = startPage; i <= endPage; i++) range.push(i)
    return range
  }

  // ✅ overlay click close
  const onOverlayClick = (e) => {
    if (e.target?.dataset?.overlay === 'true') closeModal()
  }

  // ✅ Status UI helpers (for table badge)
  const getStatusLabel = (val) => (Number(val) === 1 ? 'Active' : 'Deactive')

  const getStatusColors = (val) => {
    const n = Number(val)
    if (n === 1) {
      return {
        bg: 'rgba(34, 197, 94, 0.15)',
        border: 'rgba(34, 197, 94, 0.35)',
        text: 'rgb(22, 163, 74)',
        dot: 'rgb(22, 163, 74)',
      }
    }
    return {
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.35)',
      text: 'rgb(220, 38, 38)',
      dot: 'rgb(220, 38, 38)',
    }
  }

  // ✅ CALL API: ModifyStatus (ON/OFF)
  // Assumption: endpoint is: POST  `${API_BASE_URL}/common/ModifyStatus`
  // Body: { _id, LPID, IsDataStatus }
  const modifyStatusApi = async ({ _id, LPID, IsDataStatus }) => {
    const res = await fetch(`${API_BASE_URL}/setting/modifyAppHomeIconStatus`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ _id, LPID, IsDataStatus }),
    })
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      throw new Error(txt || 'ModifyStatus failed')
    }
    return res.json().catch(() => ({}))
  }

  const updateItemStatusInList = (targetId, newStatus) => {
    setStores((prev) =>
      prev.map((x) => {
        const id = x._id || x.id
        if (String(id) !== String(targetId)) return x
        return { ...x, IsDataStatus: newStatus }
      }),
    )
  }

  const handleToggleStatus = async (itemOrSelected, nextStatus) => {
    const item = itemOrSelected
    if (!item) return

    const itemId = item._id || item.id
    if (!itemId) return

    // prevent spam clicks
    if (statusUpdatingId && String(statusUpdatingId) === String(itemId)) return

    // optimistic UI
    const prevStatus = Number(item.IsDataStatus) === 1 ? 1 : 0
    setStatusUpdatingId(itemId)

    // update modal + list instantly
    updateItemStatusInList(itemId, nextStatus)
    setSelectedItem((prev) => (prev && String((prev._id || prev.id)) === String(itemId) ? { ...prev, IsDataStatus: nextStatus } : prev))

    try {
      await modifyStatusApi({
        _id: item._id,
        LPID: item.LPID,
        IsDataStatus: nextStatus,
      })
    } catch (e) {
      console.log(e)
      // rollback if failed
      updateItemStatusInList(itemId, prevStatus)
      setSelectedItem((prev) => (prev && String((prev._id || prev.id)) === String(itemId) ? { ...prev, IsDataStatus: prevStatus } : prev))
      alert('Failed to update status. Please check ModifyStatus API.')
    } finally {
      setStatusUpdatingId(null)
    }
  }

  // ✅ Toggle styles (YES/NO like your image)
  const toggleStyles = useMemo(() => {
    return {
      wrap: (active) => ({
        position: 'relative',
        width: 140,
        height: 46,
        borderRadius: 999,
        background: active ? 'rgba(34,197,94,0.20)' : 'rgba(239,68,68,0.18)',
        border: active ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(239,68,68,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 150ms ease',
      }),
      label: (isOn, active) => ({
        fontWeight: 900,
        fontSize: 13,
        letterSpacing: 0.5,
        color: isOn
          ? active
            ? 'rgb(22,163,74)'
            : 'rgba(0,0,0,0.35)'
          : !active
            ? 'rgb(220,38,38)'
            : 'rgba(0,0,0,0.35)',
        transition: 'all 150ms ease',
      }),
      knob: (active, disabled) => ({
        position: 'absolute',
        top: 5,
        left: active ? 88 : 6,
        width: 36,
        height: 36,
        borderRadius: 999,
        background: '#fff',
        boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
        border: active ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(239,68,68,0.35)',
        transition: 'all 180ms ease',
        opacity: disabled ? 0.6 : 1,
      }),
      miniDot: (active) => ({
        width: 8,
        height: 8,
        borderRadius: 999,
        background: active ? 'rgb(22,163,74)' : 'rgb(220,38,38)',
        display: 'inline-block',
      }),
    }
  }, [])

  const selectedActive = Number(selectedItem?.IsDataStatus) === 1
  const selectedId = selectedItem?._id || selectedItem?.id
  const selectedIsUpdating = selectedId && statusUpdatingId && String(statusUpdatingId) === String(selectedId)

  return (
    <div>
      <div className="page-title">
        <h3 style={{ margin: 0 }}>Language Pack List</h3>
        <button onClick={() => navigate('/settings/home-icon')} className="add-product-button">
          Add New
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div>
          <table className="grid-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title (EN)</th>
                <th>Title (AR)</th>
                <th>Type</th>
                <th>Status</th>
                <th>Icon</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center' }}>
                    No data found
                  </td>
                </tr>
              ) : (
                stores.map((item, index) => {
                  const statusColors = getStatusColors(item.IsDataStatus)
                  const statusText = getStatusLabel(item.IsDataStatus)
                  const rowId = item._id || item.id
                  const rowUpdating = rowId && statusUpdatingId && String(statusUpdatingId) === String(rowId)

                  return (
                    <tr key={item._id || index}>
                      <td>{(currentPage - 1) * storesPerPage + index + 1}</td>

                      <td>{item.LpEnTitle}</td>
                      <td style={{ direction: 'rtl', textAlign: 'right' }}>{item.LpArTitle}</td>
                      <td>{item.LangType || '-'}</td>

                      {/* ✅ Table badge (keep it simple here) */}
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 10px',
                            borderRadius: 999,
                            background: statusColors.bg,
                            border: `1px solid ${statusColors.border}`,
                            color: statusColors.text,
                            fontWeight: 700,
                            fontSize: 12,
                            lineHeight: '12px',
                            opacity: rowUpdating ? 0.6 : 1,
                          }}
                          title={`IsDataStatus = ${item.IsDataStatus}`}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 999,
                              background: statusColors.dot,
                              display: 'inline-block',
                            }}
                          />
                          {statusText}
                        </span>
                      </td>

                      <td>
                        {item.LangIconUrl ? (
                          <img
                            src={item.LangIconUrl}
                            alt="icon"
                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                          />
                        ) : (
                          '-'
                        )}
                      </td>

                      <td>
                        <CIcon
                          onClick={() => handleModifyClick(item)}
                          icon={cilPencil}
                          size="lg"
                          className="edit-icon"
                          style={{ cursor: 'pointer', opacity: rowUpdating ? 0.5 : 1 }}
                        />

                        <CIcon
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this item?')) {
                              handleDeleteClick(item)
                            }
                          }}
                          icon={cilTrash}
                          size="lg"
                          className="trash-icon"
                          style={{ cursor: 'pointer', marginLeft: 10, opacity: rowUpdating ? 0.5 : 1 }}
                        />
                      </td>
                    </tr>
                  )
                })
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

            {getPageRange().map((page) => (
              <button
                key={page}
                className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageClick(page)}
              >
                {page}
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

          {/* ===================== EDIT MODAL ===================== */}
          {showEditModal && (
            <div
              data-overlay="true"
              onClick={onOverlayClick}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: 16,
              }}
            >
              <div
                style={{
                  width: 'min(760px, 95vw)',
                  background: '#fff',
                  borderRadius: 14,
                  boxShadow: '0 20px 70px rgba(0,0,0,0.25)',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>Edit Language Pack</div>
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.55)' }}>
                      LPID: {selectedItem?.LPID || '-'} | ID: {selectedItem?._id || '-'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      padding: 6,
                      borderRadius: 8,
                    }}
                    title="Close"
                  >
                    <CIcon icon={cilX} size="lg" />
                  </button>
                </div>

                {/* Body */}
                <div style={{ padding: 16 }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '160px 1fr',
                      gap: 16,
                      alignItems: 'start',
                    }}
                  >
                    {/* Icon preview */}
                    <div
                      style={{
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: 12,
                        padding: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 160,
                        background: 'rgba(0,0,0,0.02)',
                      }}
                    >
                      {selectedItem?.LangIconUrl ? (
                        <img
                          src={selectedItem.LangIconUrl}
                          alt="icon"
                          style={{
                            width: 125,
                            height: 125,
                            objectFit: 'cover',
                            borderRadius: 12,
                            border: '1px solid rgba(0,0,0,0.08)',
                            background: '#fff',
                          }}
                        />
                      ) : (
                        <div style={{ color: 'rgba(0,0,0,0.45)', fontWeight: 700 }}>No Icon</div>
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div
                        style={{
                          border: '1px solid rgba(0,0,0,0.08)',
                          borderRadius: 12,
                          padding: 12,
                        }}
                      >
                        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', marginBottom: 6 }}>
                          Title (EN)
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>
                          {selectedItem?.LpEnTitle || '-'}
                        </div>
                      </div>

                      <div
                        style={{
                          border: '1px solid rgba(0,0,0,0.08)',
                          borderRadius: 12,
                          padding: 12,
                        }}
                      >
                        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', marginBottom: 6 }}>
                          Title (AR)
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 14, direction: 'rtl', textAlign: 'right' }}>
                          {selectedItem?.LpArTitle || '-'}
                        </div>
                      </div>

                      {/* ✅ Toggle like your image (YES / NO) + calls ModifyStatus */}
                      <div
                        style={{
                          border: '1px solid rgba(0,0,0,0.08)',
                          borderRadius: 12,
                          padding: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)' }}>Status</div>
                          <div style={{ fontWeight: 800, marginTop: 4 }}>
                            IsDataStatus = {selectedItem?.IsDataStatus ?? '-'}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {selectedIsUpdating && (
                            <span style={{ fontSize: 12, fontWeight: 800, color: 'rgba(0,0,0,0.55)' }}>
                              Updating...
                            </span>
                          )}

                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              if (!selectedItem) return
                              const next = selectedActive ? 0 : 1
                              handleToggleStatus(selectedItem, next)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                if (!selectedItem) return
                                const next = selectedActive ? 0 : 1
                                handleToggleStatus(selectedItem, next)
                              }
                            }}
                            style={toggleStyles.wrap(selectedActive)}
                            title="Click to toggle"
                            aria-disabled={selectedIsUpdating}
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                              <span style={toggleStyles.miniDot(true)} />
                              <span style={toggleStyles.label(true, selectedActive)}>YES</span>
                            </span>

                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                              <span style={toggleStyles.label(false, selectedActive)}>NO</span>
                              <span style={toggleStyles.miniDot(false)} />
                            </span>

                            <span style={toggleStyles.knob(selectedActive, selectedIsUpdating)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 10,
                    padding: 16,
                    borderTop: '1px solid rgba(0,0,0,0.08)',
                    background: 'rgba(0,0,0,0.02)',
                  }}
                >
                  <button
                    type="button"
                    onClick={closeModal}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid rgba(0,0,0,0.14)',
                      background: '#fff',
                      cursor: 'pointer',
                      fontWeight: 800,
                    }}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedItem) return
                      closeModal()
                      navigate(`/settings/home-icon?LPID=${selectedItem.LPID}&id=${selectedItem._id}`)
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid rgba(0,0,0,0.14)',
                      background: '#111827',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 900,
                    }}
                  >
                    Open Edit Page
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* ===================== /EDIT MODAL ===================== */}
        </div>
      )}
    </div>
  )
}

export default StoreListWithPagination
