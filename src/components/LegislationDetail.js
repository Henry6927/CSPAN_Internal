import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './LegislationDetail.css';

const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE_URL = `${BACKEND_API_URL}/api`;

function LegislationDetail() {
  const { congressId, legislativeId } = useParams();
  const navigate = useNavigate();
  const [legislation, setLegislation] = useState([]);
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState('https://via.placeholder.com/800x400');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/legislation/${congressId}/${legislativeId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched data:', data);
        setBill(data);
        setLoading(false);

        if (legislation.length === 0) {
          fetch(`${API_BASE_URL}/legislation`)
            .then(response => response.json())
            .then(allData => {
              setLegislation(allData);
            })
            .catch(error => {
              console.error('Error fetching all legislation:', error);
            });
        }

        if (data.bill_name) {
          fetch(`https://www.googleapis.com/customsearch/v1?q=${data.bill_name}&cx=${process.env.REACT_APP_GOOGLE_CSE_CX}&key=${process.env.REACT_APP_GOOGLE_CSE_API_KEY}&searchType=image&num=1`)
            .then(response => response.json())
            .then(imageData => {
              if (imageData.items && imageData.items.length > 0) {
                setImageUrl(imageData.items[0].link);
              }
            })
            .catch(error => {
              console.error('Error fetching image:', error);
            });
        }
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, [congressId, legislativeId, legislation.length]);

  const handlePrev = () => {
    const currentIndex = legislation.findIndex(b => b.legislative_id.toString() === legislativeId && b.congress_id.toString() === congressId);
    if (currentIndex > 0) {
      const prevBill = legislation[currentIndex - 1];
      navigate(`/legislation/${prevBill.congress_id}/${prevBill.legislative_id}`);
    }
  };

  const handleNext = () => {
    const currentIndex = legislation.findIndex(b => b.legislative_id.toString() === legislativeId && b.congress_id.toString() === congressId);
    if (currentIndex < legislation.length - 1) {
      const nextBill = legislation[currentIndex + 1];
      navigate(`/legislation/${nextBill.congress_id}/${nextBill.legislative_id}`);
    }
  };

  const handleEditOpen = () => {
    setIsEditOpen(true);
  };

  const handleEditClose = () => {
    setIsEditOpen(false);
  };

  const updateBillData = (updatedData) => {
    setBill(updatedData);
  };

  const generateDescription = () => {
    if (bill) {
      fetch(`${API_BASE_URL}/generate-legislation-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bill_name: bill.bill_name, summary: bill.summary })
      })
      .then(response => response.json())
      .then(data => {
        if (data.description) {
          setGeneratedDescription(data.description);
        } else if (data.error) {
          console.error('Error generating description:', data.error);
        }
      })
      .catch(error => {
        console.error('Error generating description:', error);
      });
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!bill) {
    return <p>No legislation found</p>;
  }

  return (
    <div className="container">
      <div className="navigation-buttons">
        <button onClick={handlePrev} disabled={legislation.findIndex(b => b.legislative_id.toString() === legislativeId && b.congress_id.toString() === congressId) === 0}>Previous</button>
        <button onClick={handleNext} disabled={legislation.findIndex(b => b.legislative_id.toString() === legislativeId && b.congress_id.toString() === congressId) === legislation.length - 1}>Next</button>
      </div>
      <h1 className="bill-title">{bill.bill_name || "No title available"}</h1>
      <img src={imageUrl} alt="Legislation related" className="legislation-image" />
      <div className="content-section">
        <div className="summary-section">
          <p><a href={bill.link}>{bill.link}</a></p>
        </div>
        <div className="summary-section">
          <h3>Summary</h3>
          <p>{bill.summary}</p>
        </div>
      </div>
      <div className="content-section">
        <div className="details-section">
          <p><strong>Congress ID:</strong> {bill.congress_id}</p>
          <p><strong>Legislative ID:</strong> {bill.legislative_id}</p>
          <p><strong>Character Count:</strong> {bill.charcount}</p>
        </div>
      </div>
      <div className="content-section">
        <div className="raw-text-section">
          <h3>Raw Text</h3>
          <p>{bill.text}</p>
        </div>
      </div>
      {generatedDescription && (
        <div className="generated-description">
          <h3>Generated Description</h3>
          <p>{generatedDescription}</p>
        </div>
      )}
      <div className="generate-description-button">
        <button onClick={generateDescription}>Generate Legislation Description</button>
      </div>
      <div className="navigation-buttons">
        <button onClick={handlePrev} disabled={legislation.findIndex(b => b.legislative_id.toString() === legislativeId && b.congress_id.toString() === congressId) === 0}>Previous</button>
        <button onClick={handleNext} disabled={legislation.findIndex(b => b.legislative_id.toString() === legislativeId && b.congress_id.toString() === congressId) === legislation.length - 1}>Next</button>
      </div>
    </div>
  );
}

export default LegislationDetail;
