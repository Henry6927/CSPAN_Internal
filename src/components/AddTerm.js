import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddTerm.css';
import Papa from 'papaparse';
import { Box, TextField, InputAdornment, Select, MenuItem } from '@mui/material';

const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL;

function AddTerm() {
  const [name, setName] = useState('');
  const [termType, setTermType] = useState('');
  const [additionalKeywords, setAdditionalKeywords] = useState('');
  const [priority, setPriority] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [log, setLog] = useState([]);
  const [keywordSuggestion, setKeywordSuggestion] = useState('');
  const [showKeywordInput, setShowKeywordInput] = useState(false);
  const [keywordOptions, setKeywordOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchKeywordOptions();
  }, []);
  


  const fetchKeywordOptions = async () => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/terms`);
      const data = await response.json();
      const terms = data.map(term => term.name);
      setKeywordOptions(terms);
    } catch (error) {
      console.error('Error fetching keyword options:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/terms/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, type: termType, additional_keywords: additionalKeywords, priority }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      navigate(`/term/${data.id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    setCsvFile(event.target.files[0]);
  };

  const handleBulkUpload = async () => {
    if (!csvFile) return;
  
    setLoading(true);
    setError(null);
    setLog([]);
  
    Papa.parse(csvFile, {
      header: false,
      skipEmptyLines: true,
      complete: async (results) => {
        const terms = results.data;
        for (let i = 0; i < terms.length; i++) {
          const [term, type, keywords, priority, customPrompt] = terms[i];
          const termTypeValue = type || 'other';
  
          try {
            const response = await fetch(`${BACKEND_API_URL}/api/terms/new`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: term,
                type: termTypeValue,
                additional_keywords: keywords,
                priority: priority,
                custom_prompt: customPrompt || ''
              }),
            });
  
            if (!response.ok) {
              throw new Error(`Failed to add term: ${term}`);
            }
  
            const data = await response.json();
            setLog((prevLog) => [
              ...prevLog,
              <li
                key={data.id}
                className="success"
                onClick={() => window.open(`/term/${data.id}`, '_blank')}
              >
                <span>Successfully added term: {term}</span>
              </li>,
            ]);
          } catch (error) {
            setLog((prevLog) => [
              ...prevLog,
              <li
                key={i}
                className="error"
                onClick={() => alert(`Failed to add term: ${term}`)}
              >
                <span>Error adding term: {term} - {error.message}</span>
              </li>,
            ]);
          }
        }
        setLoading(false);
      },
    });
  };
  const handleKeywordChange = (event) => {
    const inputValue = event.target.value;
    setAdditionalKeywords(inputValue);

    const lastWord = inputValue.split(',').pop().trim().toLowerCase();
    if (inputValue.trim() === '') {
      setKeywordSuggestion('');
    } else if (lastWord.length > 20) {
      setKeywordSuggestion('');
    } else {
      const suggestion = keywordOptions.find(option => option.toLowerCase().startsWith(lastWord));
      setKeywordSuggestion(suggestion || '');
    }
  };

  const handleKeywordKeyDown = (event) => {
    if (event.key === 'Tab' && keywordSuggestion) {
      event.preventDefault();
      const currentKeywords = additionalKeywords.split(',');
      currentKeywords.pop();
      currentKeywords.push(keywordSuggestion);
      setAdditionalKeywords(currentKeywords.join(', ') + ', ');
      setKeywordSuggestion('');
    }
  };

  const handleKeywordBlur = () => {
    setKeywordSuggestion('');
  };

  const truncateSuggestion = (suggestion) => {
    const maxLength = 15;
    if (suggestion.length > maxLength) {
      return suggestion.substring(0, maxLength) + '...';
    }
    return suggestion;
  };

  const toggleKeywordInput = () => {
    setShowKeywordInput(!showKeywordInput);
  };

  return (
    <div className="container">
      <h2 className="add-term-title">Add New Term</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="add-term-form">
        <div className="form-group">
          <label htmlFor="name">Term Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="termType">Type:</label>
          <select
            id="termType"
            value={termType}
            onChange={(e) => setTermType(e.target.value)}
            required
          >
            <option value="">Select Type</option>
            <option value="organization">Organization</option>
            <option value="countries">Countries</option>
            <option value="cities">Cities</option>
            <option value="scientists">Scientists</option>
            <option value="first ladies">First Ladies</option>
            <option value="notable people">Notable People</option>
            <option value="military conflicts">Military Conflicts</option>
            <option value="person">Person</option>
            <option value="political events">Political Events</option>
            <option value="us laws">US Laws</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="priority">Priority:</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            required
          >
            <option value="">Select Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          <label htmlFor="additionalKeywords">Additional Keywords (optional):</label>
          <Box>
            <TextField
              label="Enter keywords"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={additionalKeywords}
              onChange={handleKeywordChange}
              onKeyDown={handleKeywordKeyDown}
              onBlur={handleKeywordBlur}
              InputProps={{
                style: {
                  paddingBottom: keywordSuggestion ? '40px' : '10px',
                },
                endAdornment: (
                  <InputAdornment position="end" style={{ position: 'absolute', bottom: '15px', right: '10px' }}>
                    <span>
                      {keywordSuggestion && keywordSuggestion.toLowerCase().startsWith(additionalKeywords.split(',').pop().trim().toLowerCase()) ? truncateSuggestion(keywordSuggestion) : ''}
                    </span>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Creating...' : 'Create Term'}
        </button>
      </form>
      <hr />
      <h3>Bulk Upload Terms</h3>
      <div className="form-group">
  <input type="file" accept=".csv" onChange={handleFileChange} />
  <button onClick={handleBulkUpload} className="submit-button" disabled={loading}>
    {loading ? 'Uploading...' : 'Upload CSV'}
  </button> 
</div>
<p>Please make sure the CSV file has the following format:</p>
<ul className="instructions">
  <li><strong>Column A:</strong> Term Name</li>
  <li><strong>Column B:</strong> Type</li>
  <li><strong>Column C:</strong> Additional Keywords (optional)</li>
  <li><strong>Column D:</strong> Priority</li>
  <li><strong>Column E:</strong> Custom Prompt (optional)</li>
</ul>
<div className="log">
  <h4>Upload Log</h4>
  <ul className="logs">
    {log.map((logItem, index) => (
      <li key={index}>{logItem}</li>
    ))}
  </ul>
</div>
    </div>
  );
}

export default AddTerm;