import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LegislationList.css'; // Ensure the custom CSS is imported

const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL;

function LegislationList() {
  const [legislation, setLegislation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({
    summary: 'None',
    faq: 'None',
    technical: 'None',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BACKEND_API_URL}/api/legislation/bills`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setLegislation(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);

  const filteredLegislation = legislation.filter(item => {
    const matchesSearch = item.bill_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSummary = filterCriteria.summary === 'None' ||
      (filterCriteria.summary === 'True' && item.summary) ||
      (filterCriteria.summary === 'False' && !item.summary);

    const matchesFAQ = filterCriteria.faq === 'None' ||
      (filterCriteria.faq === 'True' && item.faq) ||
      (filterCriteria.faq === 'False' && !item.faq);

    const matchesTechnical = filterCriteria.technical === 'None' ||
      (filterCriteria.technical === 'True' && item.technical) ||
      (filterCriteria.technical === 'False' && !item.technical);

    return matchesSearch && matchesSummary && matchesFAQ && matchesTechnical;
  });

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilterCriteria({
      ...filterCriteria,
      [name]: value,
    });
  };

  const handleLegislationClick = (congress_id, legislative_id) => {
    navigate(`/legislation/${congress_id}/${legislative_id}`);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all legislation?')) {
      try {
        const response = await fetch(`${BACKEND_API_URL}/api/legislation/bills/clear`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setLegislation([]);
        } else {
          const errorData = await response.json();
          alert(`Failed to clear legislation: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error clearing legislation.');
      }
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="container">
      <h2 className="legislation-list-title">Legislation List</h2>
      <input
        type="text"
        placeholder="Search for legislation..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-input"
      />
      <div className="filter-container">
        <label>
          Summary Audited Passed:
          <select name="summary" value={filterCriteria.summary} onChange={handleFilterChange}>
            <option value="None">None</option>
            <option value="True">True</option>
            <option value="False">False</option>
          </select>
        </label>
        <label>
          FAQ Audited Passed:
          <select name="faq" value={filterCriteria.faq} onChange={handleFilterChange}>
            <option value="None">None</option>
            <option value="True">True</option>
            <option value="False">False</option>
          </select>
        </label>
        <label>
          Technical Audited Passed:
          <select name="technical" value={filterCriteria.technical} onChange={handleFilterChange}>
            <option value="None">None</option>
            <option value="True">True</option>
            <option value="False">False</option>
          </select>
        </label>
      </div>
      <Link to="/legislation/new" className="add-title">
        <div className="add-card">
          Add New Legislation
        </div>
      </Link>
      {filteredLegislation.map(item => (
        <div
          key={item.id}
          className="legislation-card"
          onClick={() => handleLegislationClick(item.congress_id, item.legislative_id)}
        >
          <h3 className="legislation-title">{item.bill_name || 'Unnamed Bill'}</h3>
        </div>
      ))}
      <button className="clear-button" onClick={handleClearAll}>Clear All Legislation</button>
    </div>
  );
}

export default LegislationList;
