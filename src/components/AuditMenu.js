import React, { useEffect, useState } from 'react';
import "./AuditMenu.css";

const AuditMenu = ({ sections, termId }) => {
  const [auditData, setAuditData] = useState(sections.reduce((acc, section) => ({
    ...acc,
    [section]: false,
  }), {}));
  const [notes, setNotes] = useState('');
  const [isAuditDataLoaded, setIsAuditDataLoaded] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (termId) {
      fetch(`http://127.0.0.1:5000/api/audit/${termId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            setAuditData(data.auditData);
            setNotes(data.notes || '');
          } else {
            setAuditData(sections.reduce((acc, section) => ({
              ...acc,
              [section]: false,
            }), {}));
            setNotes('');
          }
          setIsAuditDataLoaded(true);
        })
        .catch((error) => {
          console.error('Error fetching audit:', error);
          setIsAuditDataLoaded(true);
        });
    }
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

  const handleSubmit = () => {
    const auditPayload = {
      auditData,
      notes,
    };

    const url = `http://127.0.0.1:5000/api/audit/${termId}`;

    fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auditPayload),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Audit submitted successfully:', data);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      })
      .catch((error) => {
        console.error('Error submitting audit:', error);
      });
  };

  if (!isAuditDataLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h2>Audit Page</h2>
      {sections.map((section) => (
        <div key={section} className="audit-item">
          <label>
            <input
              type="checkbox"
              checked={auditData[section]}
              onChange={() => handleCheckboxChange(section)}
            />
            {section}
          </label>
        </div>
      ))}
      <div className="notes-section">
        <textarea
          className="Notes"
          placeholder="Notes"
          value={notes}
          onChange={handleNotesChange}
        />
      </div>
      <button className="bottombutton" onClick={handleSubmit}>
        Submit Audit
      </button>
      {showSuccessMessage && <div className="success-message">Audit submitted successfully!</div>}
    </>
  );
};

export default AuditMenu;
