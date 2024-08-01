import React, { useState } from 'react';
import './AddLegislation.css';
import { useNavigate } from 'react-router-dom';

const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL;

function AddLegislation({ isUpdate, existingData }) {
  const navigate = useNavigate();
  const [legislation, setLegislation] = useState(existingData || {
    legislative_id: '',
    congress_id: '',
  });
  const [bulkLegislation, setBulkLegislation] = useState({
    legislative_id_start: '',
    legislative_id_end: '',
    congress_id: '',
  });
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('bulk')) {
      setBulkLegislation({ ...bulkLegislation, [name.replace('bulk_', '')]: value });
    } else {
      setLegislation({ ...legislation, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isUpdate) {
      const url = `${BACKEND_API_URL}/api/legislation/${legislation.congress_id}/${legislation.legislative_id}`;
      const method = 'PUT';

      try {
        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(legislation),
        });
        if (response.ok) {
          alert('Updated legislation successfully!');
          navigate('/');
        } else {
          const errorData = await response.json();
          alert(`Failed to update legislation: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error updating legislation');
      } finally {
        setLoading(false);
      }
    } else {
      const url = `${BACKEND_API_URL}/api/legislation/generate-and-save-legislation/${legislation.congress_id}/${legislation.legislative_id}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          alert('Generated and saved legislation successfully!');
          navigate('/LegislationList');
        } else {
          const errorData = await response.json();
          alert(`Failed to generate and save legislation: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error generating and saving legislation');
      } finally {
        setLoading(false); 
      }
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    const startId = parseInt(bulkLegislation.legislative_id_start, 10);
    const endId = parseInt(bulkLegislation.legislative_id_end, 10);

    for (let id = startId; id <= endId; id++) {
      const url = `${BACKEND_API_URL}/api/legislation/generate-and-save-legislation/${bulkLegislation.congress_id}/${id}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          setLog(prevLog => [...prevLog, `Successfully generated legislation ID: ${id}`]);
        } else {
          const errorData = await response.json();
          setLog(prevLog => [...prevLog, `Failed to generate legislation ID: ${id} - ${errorData.error}`]);
        }
      } catch (error) {
        console.error('Error:', error);
        setLog(prevLog => [...prevLog, `Error generating legislation ID: ${id}`]);
      }
    }

    setLoading(false);
    navigate('/LegislationList');
  };

  return (
    <div className="container">
      <h2 className="title">{isUpdate ? 'Update Legislation' : 'Add New Legislation'}</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Legislative ID:</label>
          <input type="text" name="legislative_id" value={legislation.legislative_id} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Congress ID:</label>
          <input type="number" name="congress_id" value={legislation.congress_id} onChange={handleChange} required />
        </div>
        <button className="submit-button" type="submit" disabled={loading}>{isUpdate ? 'Update Legislation' : 'Generate and Save Legislation'}</button>
      </form>
      
      <hr />

      <h3>Bulk Add Legislations</h3>
      <form className="form" onSubmit={handleBulkSubmit}>
        <div className="form-group">
          <label>Congress ID:</label>
          <input type="number" name="bulk_congress_id" value={bulkLegislation.congress_id} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Start Legislative ID:</label>
          <input type="number" name="bulk_legislative_id_start" value={bulkLegislation.legislative_id_start} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>End Legislative ID:</label>
          <input type="number" name="bulk_legislative_id_end" value={bulkLegislation.legislative_id_end} onChange={handleChange} required />
        </div>
        <button className="submit-button" type="submit" disabled={loading}>Generate and Save Legislations</button>
      </form>

      <div>
        <h3>Processing Log</h3>
        <ul className="logs">
          {log.map((logItem, index) => (
            <li key={index}>{logItem}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AddLegislation;
