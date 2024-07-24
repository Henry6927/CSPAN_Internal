import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddOrUpdateLegislation({ isUpdate, existingData }) {
  const navigate = useNavigate();
  const [legislation, setLegislation] = useState(existingData || {
    legislative_id: '',
    summary: '',
    bill_name: '',
    congress_id: '',
    text: '',
    link: ''
  });

  const handleChange = (e) => {
    setLegislation({ ...legislation, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isUpdate 
      ? `http://127.0.0.1:5000/api/legislation/${legislation.congress_id}/${legislation.legislative_id}` 
      : 'http://127.0.0.1:5000/api/legislation/bills';
    const method = isUpdate ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(legislation)
      });
      if (response.ok) {
        alert(`${isUpdate ? 'Updated' : 'Added'} legislation successfully!`);
        navigate('/');
      } else {
        alert(`Failed to ${isUpdate ? 'update' : 'add'} legislation`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error ${isUpdate ? 'updating' : 'adding'} legislation`);
    }
  };

  return (
    <div>
      <h2>{isUpdate ? 'Update Legislation' : 'Add New Legislation'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Legislative ID:</label>
          <input type="text" name="legislative_id" value={legislation.legislative_id} onChange={handleChange} />
        </div>
        <div>
          <label>Summary:</label>
          <textarea name="summary" value={legislation.summary} onChange={handleChange}></textarea>
        </div>
        <div>
          <label>Bill Name:</label>
          <input type="text" name="bill_name" value={legislation.bill_name} onChange={handleChange} />
        </div>
        <div>
          <label>Congress ID:</label>
          <input type="number" name="congress_id" value={legislation.congress_id} onChange={handleChange} />
        </div>
        <div>
          <label>Text:</label>
          <textarea name="text" value={legislation.text} onChange={handleChange}></textarea>
        </div>
        <div>
          <label>Link:</label>
          <input type="text" name="link" value={legislation.link} onChange={handleChange} />
        </div>
        <button type="submit">{isUpdate ? 'Update Legislation' : 'Add Legislation'}</button>
      </form>
    </div>
  );
}

export default AddOrUpdateLegislation;
