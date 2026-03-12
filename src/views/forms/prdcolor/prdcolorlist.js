import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../../style/common.css'; // Import the CSS file
import { CIcon } from '@coreui/icons-react';
import { cilTrash, cilPencil } from '@coreui/icons';
import { API_BASE_URL } from '../../../config';
import { checkLogin } from '../../../utils/auth';
import { getAuthHeaders } from '../../../utils/operation'

const isValidHexColor = (val) => {
  if (!val) return false;
  const v = val.trim();
  return /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(v);
};

const expandHex = (val) => {
  if (!isValidHexColor(val)) return val;
  const hex = val.trim().toUpperCase();
  if (hex.length === 4) {
    const r = hex[1], g = hex[2], b = hex[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return hex;
};

const normalizeHexInput = (raw) => {
  if (!raw) return '';
  let s = raw.trim().toUpperCase();

  // Auto-prepend # if missing
  if (s && s[0] !== '#') s = `#${s}`;

  // Disallow non-hex characters after '#'
  // (We still let the user type and validate on Save)
  const m = s.match(/^#([0-9A-F]*)$/i);
  if (!m) return s; // leave as-is; on-screen validation handles

  return s;
};

const Swatch = ({ color }) => (
  <span
    style={{
      display: 'inline-block',
      width: 28,
      height: 22,
      marginLeft: 8,
      borderRadius: 4,
      border: '1px solid #ddd',
      backgroundColor: isValidHexColor(color) ? expandHex(color) : 'transparent',
      verticalAlign: 'middle',
    }}
    title={isValidHexColor(color) ? expandHex(color) : 'Invalid color'}
  />
);

const ColorList = () => {
  const [colorList, setColorList] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addColorDialogOpen, setAddColorDialogOpen] = useState(false);

  const [colorToDelete, setColorToDelete] = useState(null);
  const [colorToEdit, setColorToEdit] = useState(null);

  const [newColorName, setNewColorName] = useState('');
  const [newPrdColorCode, setPrdColorCode] = useState('');
  const [newArPrdColorName, setArPrdColorName] = useState('');

  const [addCodeError, setAddCodeError] = useState('');
  const [editCodeError, setEditCodeError] = useState('');
  const [savingAdd, setSavingAdd] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const ProductID = queryParams.get('ProductID');

  const navigate = useNavigate();

  // Auth guard
  useEffect(() => {
    checkLogin(navigate);
  }, [navigate]);

  useEffect(() => {
    fetchColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ProductID]);

  const fetchColors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prdcolor/getprdcolorbyid`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify({ ProductID }),
      });
      if (response.ok) {
        const data = await response.json();
        setColorList(data.data || []);
      } else {
        console.error('Failed to fetch colors');
      }
    } catch (err) {
      console.error('Failed to fetch colors', err);
    }
  };

  const handleDeleteClick = (color) => {
    setColorToDelete(color);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (color) => {
    setColorToEdit(color);
    setNewColorName(color.EnPrdColorName || '');
    setArPrdColorName(color.ArPrdColorName || '');
    setPrdColorCode(color.PrdColorCode || '');
    setEditCodeError('');
    setEditDialogOpen(true);
  };

  const handleAddColorClick = () => {
    setNewColorName('');
    setArPrdColorName('');
    setPrdColorCode('');
    setAddCodeError('');
    setAddColorDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!colorToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/prdcolor/delPrdColor`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify({
          ProductID: colorToDelete.ProductID,
          PrdColorCodeID: colorToDelete.PrdColorCodeID,
        }),
      });

      if (response.ok) {
        setColorList((prev) => prev.filter((c) => c._id !== colorToDelete._id));
        setDeleteDialogOpen(false);
        fetchColors();
      } else {
        console.error('Failed to delete color');
      }
    } catch (err) {
      console.error('Failed to delete color', err);
    }
  };

  const handleConfirmEdit = async () => {
    const finalHex = expandHex(newPrdColorCode);
    if (!isValidHexColor(finalHex)) {
      setEditCodeError('Please enter a valid hex color like #AABBCC or #ABC.');
      return;
    }
    if (!colorToEdit) return;

    try {
      setSavingEdit(true);
      const response = await fetch(`${API_BASE_URL}/prdcolor/editPrdColor`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify({
          PrdColorCode: finalHex,
          EnPrdColorName: newColorName,
          ArPrdColorName: newArPrdColorName,
          ProductID: colorToEdit.ProductID,
          PrdColorCodeID: colorToEdit.PrdColorCodeID,
        }),
      });

      if (response.ok) {
        await fetchColors();
        setColorList((prev) =>
          prev.map((c) =>
            c._id === colorToEdit._id
              ? {
                  ...c,
                  EnPrdColorName: newColorName,
                  ArPrdColorName: newArPrdColorName,
                  PrdColorCode: finalHex,
                }
              : c
          )
        );
        setEditDialogOpen(false);
      } else {
        const t = await response.text();
        console.error('Failed to update color', t);
        setEditCodeError('Failed to update color.');
      }
    } catch (err) {
      console.error('Failed to update color', err);
      setEditCodeError('Failed to update color.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmAddColor = async () => {
    const finalHex = expandHex(newPrdColorCode);
    if (!isValidHexColor(finalHex)) {
      setAddCodeError('Please enter a valid hex color like #AABBCC or #ABC.');
      return;
    }

    try {
      setSavingAdd(true);
      const response = await fetch(`${API_BASE_URL}/prdcolor/addPrdColor`, {
        method: 'POST',
          headers: getAuthHeaders(),
        body: JSON.stringify({
          EnPrdColorName: newColorName,
          ArPrdColorName: newArPrdColorName,
          PrdColorCode: finalHex,
          ProductID: ProductID,
        }),
      });

      if (response.ok) {
        const newColor = await response.json();
        setColorList((prevList) => [...prevList, newColor.data || newColor]);
        setAddColorDialogOpen(false);
        fetchColors();
      } else {
        const t = await response.text();
        console.error('Failed to add new color', t);
        setAddCodeError('Failed to add new color.');
      }
    } catch (err) {
      console.error('Failed to add new color', err);
      setAddCodeError('Failed to add new color.');
    } finally {
      setSavingAdd(false);
    }
  };

  const onAddColorCodeChange = (e) => {
    const val = normalizeHexInput(e.target.value);
    setPrdColorCode(val);
    // Only show an error when clearly invalid AND non-empty
    if (val && !isValidHexColor(val)) {
      setAddCodeError('Invalid hex. Use #AABBCC or #ABC.');
    } else {
      setAddCodeError('');
    }
  };

  const onEditColorCodeChange = (e) => {
    const val = normalizeHexInput(e.target.value);
    setPrdColorCode(val);
    if (val && !isValidHexColor(val)) {
      setEditCodeError('Invalid hex. Use #AABBCC or #ABC.');
    } else {
      setEditCodeError('');
    }
  };

  const handleProductSizeClick = (color) => {
    navigate(
      `/forms/prdsize/prdsizelist?ProductID=${color.ProductID}&PrdColorCodeID=${color.PrdColorCodeID}`
    );
  };

  const btnReturn = () => {
    navigate(`/forms/product/productlist`);
  };

  return (
    <div>
      <div className="page-title">
        <h3>Product Color List</h3>
        <div className="button-group">
          <button onClick={handleAddColorClick} className="add-product-button">
            Add New Color
          </button>
          <button onClick={btnReturn} className="admin-buttonv1">
            Return
          </button>
        </div>
      </div>

      <table className="grid-table">
        <thead>
          <tr>
            <th style={{ width: '40%' }}>Color Name</th>
            <th>Color Code</th>
            <th style={{ width: '15%' }}>Product Size</th>
            <th style={{ width: '10%', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {colorList.map((color) => (
            <tr key={color._id}>
              <td>
                <span
                  style={{
                    width: '100px',
                    height: '18px',
                    display: 'inline-block',
                    marginRight: 8,
                    backgroundColor: color.PrdColorCode,
                    borderRadius: '4px',
                    border: '1px solid #eee',
                    verticalAlign: 'middle',
                  }}
                  title={color.PrdColorCode}
                />
                {color.EnPrdColorName}
              </td>
              <td>{color.PrdColorCode}</td>

              <td style={{ backgroundColor: '#fcf2f5', textAlign: 'center' }}>
                <div className="admin-buttonv1">
                  <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleProductSizeClick(color)}
                  >
                    Add Product Size
                  </span>
                </div>
              </td>
              <td style={{ width: '10%', textAlign: 'center' }}>
                <CIcon
                  onClick={() => handleEditClick(color)}
                  icon={cilPencil}
                  size="lg"
                  className="edit-icon"
                />
                <CIcon
                  onClick={() => handleDeleteClick(color)}
                  icon={cilTrash}
                  size="lg"
                  className="trash-icon"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Color Dialog */}
      {addColorDialogOpen && (
        <div className="modal-overlay" onClick={() => setAddColorDialogOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Add New Color</h4>

            <label htmlFor="colorNameEn" className="input-label">
              English Color Name
            </label>
            <input
              id="colorNameEn"
              className="admin-txt-box"
              type="text"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
            />

            <label htmlFor="colorNameAr" className="input-label">
              Arabic Color Name
            </label>
            <input
              id="colorNameAr"
              className="admin-txt-box"
              type="text"
              value={newArPrdColorName}
              onChange={(e) => setArPrdColorName(e.target.value)}
            />

            <label htmlFor="colorCodeAdd" className="input-label">
              Color Code (manual)
            </label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                id="colorCodeAdd"
                className="admin-txt-box"
                type="text"
                placeholder="#AABBCC or #ABC"
                value={newPrdColorCode}
                onChange={onAddColorCodeChange}
                style={{ flex: 1 }}
              />
              <Swatch color={newPrdColorCode} />
            </div>
            {addCodeError ? (
              <div style={{ color: 'red', marginTop: 6 }}>{addCodeError}</div>
            ) : null}

            <div className="modal-buttons">
              <button
                onClick={handleConfirmAddColor}
                className="admin-buttonv1"
                disabled={savingAdd || !isValidHexColor(newPrdColorCode)}
                title={
                  isValidHexColor(newPrdColorCode)
                    ? 'Save'
                    : 'Enter a valid hex color code'
                }
              >
                {savingAdd ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setAddColorDialogOpen(false)}
                className="admin-buttonv1"
                disabled={savingAdd}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Color Dialog */}
      {editDialogOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Edit Color</h4>

            <label htmlFor="editColorNameEn" className="input-label">
              English Color Name
            </label>
            <input
              id="editColorNameEn"
              className="admin-txt-box"
              type="text"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
            />

            <label htmlFor="editColorNameAr" className="input-label">
              Arabic Color Name
            </label>
            <input
              id="editColorNameAr"
              className="admin-txt-box"
              type="text"
              value={newArPrdColorName}
              onChange={(e) => setArPrdColorName(e.target.value)}
            />

            <label htmlFor="editColorCode" className="input-label">
              Color Code (manual)
            </label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                id="editColorCode"
                className="admin-txt-box"
                type="text"
                placeholder="#AABBCC or #ABC"
                value={newPrdColorCode}
                onChange={onEditColorCodeChange}
                style={{ flex: 1 }}
              />
              <Swatch color={newPrdColorCode} />
            </div>
            {editCodeError ? (
              <div style={{ color: 'red', marginTop: 6 }}>{editCodeError}</div>
            ) : null}

            <div className="modal-buttons">
              <button
                onClick={handleConfirmEdit}
                className="admin-buttonv1"
                disabled={savingEdit || !isValidHexColor(newPrdColorCode)}
                title={
                  isValidHexColor(newPrdColorCode)
                    ? 'Save'
                    : 'Enter a valid hex color code'
                }
              >
                {savingEdit ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setEditDialogOpen(false)}
                className="admin-buttonv1"
                disabled={savingEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteDialogOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Are you sure you want to delete the color?</p>
            <div className="button-row">
              <button className="admin-buttonv1" onClick={handleConfirmDelete}>
                Yes
              </button>
              <button
                className="admin-buttonv1"
                onClick={() => setDeleteDialogOpen(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorList;
