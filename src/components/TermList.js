import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './TermList.css'; // Ensure the custom CSS is imported

function TermList() {
  const [terms, setTerms] = useState([]);
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
    fetch('http://127.0.0.1:5000/api/terms')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setTerms(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);

  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSummary = filterCriteria.summary === 'None' ||
      (filterCriteria.summary === 'True' && term.audit && term.audit.Summary) ||
      (filterCriteria.summary === 'False' && (!term.audit || !term.audit.Summary));

    const matchesFAQ = filterCriteria.faq === 'None' ||
      (filterCriteria.faq === 'True' && term.audit && term.audit.FAQ) ||
      (filterCriteria.faq === 'False' && (!term.audit || !term.audit.FAQ));

    const matchesTechnical = filterCriteria.technical === 'None' ||
      (filterCriteria.technical === 'True' && term.audit && term.audit.Technical_Stuff) ||
      (filterCriteria.technical === 'False' && (!term.audit || !term.audit.Technical_Stuff));

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

  const handleTermClick = (termId) => {
    navigate(`/term/${termId}`);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="container">
      <h2 className="term-list-title">Terms List</h2>
      <input
        type="text"
        placeholder="Search for a term..."
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
      <Link to="/term/new" className="add-title">
        <div className="add-card">
          Add New Term
        </div>
      </Link>
      {filteredTerms.map(term => (
        <div
          key={term.id}
          className="term-card"
          onClick={() => handleTermClick(term.id)}
        >
          <h3 className="term-title">{term.name}</h3>
        </div>
      ))}
    </div>
  );
}

export default TermList;
