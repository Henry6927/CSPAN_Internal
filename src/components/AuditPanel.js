import React, { useState, useEffect } from 'react';
import './AuditPanel.css';
import { FaChevronDown, FaChevronUp, FaClipboard, FaRobot, FaFileCsv, FaHandPaper, FaCog } from 'react-icons/fa';
import AuditMenu from './AuditMenu';
import EditMenu from './EditMenu'; // DON'T DELETE, ITS FOR CSS
import ManualEditMenu from './ManualEditMenu';
import CsvDownloadMenu from './CsvDownloadMenu';
import SettingsMenu from './SettingsMenu';
import ModSummary from './ModSummary';
import ModFAQ from './ModFAQ';

const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL;

const AuditPanelWithEdit = ({ sections, termId }) => {
  const [auditData, setAuditData] = useState(sections.reduce((acc, section) => ({
    ...acc,
    [section]: false,
  }), {}));
  const [notes, setNotes] = useState('');
  const [auditId, setAuditId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [manualEditOpen, setManualEditOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        const response = await fetch(`${BACKEND_API_URL}/api/audit/${termId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data && data.auditData) {
          setAuditData(data.auditData);
          setNotes(data.notes || '');
          setAuditId(data.id);
        } else {
          setAuditData(sections.reduce((acc, section) => ({
            ...acc,
            [section]: false,
          }), {}));
          setNotes('');
          setAuditId(null);
        }
      } catch (error) {
        console.error('Error fetching audit:', error);
        setAuditData(sections.reduce((acc, section) => ({
          ...acc,
          [section]: false,
        }), {}));
        setNotes('');
        setAuditId(null);
      }
    };

    const fetchTermSummary = async () => {
      try {
        const response = await fetch(`${BACKEND_API_URL}/api/terms/${termId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setSummary(data.response);
      } catch (error) {
        console.error('Error fetching term summary:', error);
      }
    };

    fetchAuditData();
    fetchTermSummary();
  }, [termId, sections]);

  const handleCheckboxChange = (section) => {
    setAuditData({
      ...auditData,
      [section]: !auditData[section],
    });
  };

  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };

  const handleSubmit = async () => {
    const auditPayload = {
      termId,
      auditData,
      notes,
    };

    const url = auditId
      ? `${BACKEND_API_URL}/api/audit/${auditId}`
      : `${BACKEND_API_URL}/api/audit`;

    const method = auditId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auditPayload),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Audit submitted successfully:', data);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      if (!auditId) {
        setAuditId(data.id);
      }
    } catch (error) {
      console.error('Error submitting audit:', error);
    }
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
    setActiveMenu(null);
  };

  const toggleMenu = (menu) => {
    if (menu === 'manualEdit') {
      setActiveMenu(null);
      setManualEditOpen(true);
    } else {
      setActiveMenu(activeMenu === menu ? null : menu);
      setManualEditOpen(false);
    }
  };

  const handleDropdownClick = (action) => {
    setPopupType(action);
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setPopupType(null);
  };

  return (
    <div className={`audit-panel ${isOpen ? 'open' : 'closed'}`}>
      <button className="toggle-button" onClick={togglePanel}>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      {isOpen && (
        <div className="content">
          <div className="button-row">
            <button className="icon-button" onClick={() => toggleMenu('audit')} title="Audit">
              <FaClipboard />
            </button>
            <button className="edit-button" onClick={() => toggleMenu('edit')} title="Regenerate Descriptions">
              <FaRobot />
            </button>
            <button className="edit-button" onClick={() => toggleMenu('manualEdit')} title="Manual Edits">
              <FaHandPaper />
            </button>
            <button className="edit-button" onClick={() => toggleMenu('csvDownload')} title="Download as CSV">
              <FaFileCsv />
            </button>
            <button className="edit-button" onClick={() => toggleMenu('settings')} title="Settings">
              <FaCog />
            </button>
          </div>
          {activeMenu === 'audit' && (
            <AuditMenu
              sections={sections}
              termId={termId}
              auditData={auditData}
              handleCheckboxChange={handleCheckboxChange}
              notes={notes}
              handleNotesChange={handleNotesChange}
              handleSubmit={handleSubmit}
              showSuccessMessage={showSuccessMessage}
              setShowSuccessMessage={setShowSuccessMessage}
            />
          )}
          {activeMenu === 'edit' && (
            <div className="dropdown-menu">
              <button onClick={() => handleDropdownClick('modifySummary')} className="mod-button">Modify summary</button>
              <button onClick={() => handleDropdownClick('modifyFAQ')} className="mod-button">Modify FAQ</button>
            </div>
          )}
          {activeMenu === 'csvDownload' && <CsvDownloadMenu termId={termId} />}
          {activeMenu === 'settings' && <SettingsMenu termId={termId} />}
        </div>
      )}
      <ManualEditMenu termId={termId} open={manualEditOpen} onClose={() => setManualEditOpen(false)} />
      {popupType === 'modifySummary' && (
        <ModSummary open={popupOpen} onClose={handleClosePopup} termId={termId} summary={summary} />
      )}
      {popupType === 'modifyFAQ' && (
        <ModFAQ open={popupOpen} onClose={handleClosePopup} termId={termId} />
      )}
    </div>
  );
};

export default AuditPanelWithEdit;
