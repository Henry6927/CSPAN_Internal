import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuditPanelWithEdit from './AuditPanel';
import ManualEditMenu from './ManualEditMenu';
import './TermDetail.css';

const GOOGLE_CSE_API_KEY = process.env.REACT_APP_GOOGLE_CSE_API_KEY;
const GOOGLE_CSE_CX = process.env.REACT_APP_GOOGLE_CSE_CX;
const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL;

function TermDetail() {
  const { termId } = useParams();
  const navigate = useNavigate();
  const [terms, setTerms] = useState([]);
  const [term, setTerm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState('https://via.placeholder.com/800x400');
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/terms')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setTerms(data);
        const foundTerm = data.find(term => term.id.toString() === termId);
        setTerm(foundTerm);
        setLoading(false);

        if (foundTerm) {
          fetch(`https://www.googleapis.com/customsearch/v1?q=${foundTerm.name}&cx=${GOOGLE_CSE_CX}&key=${GOOGLE_CSE_API_KEY}&searchType=image&num=1`)
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
  }, [termId]);

  const handlePrev = () => {
    const currentIndex = terms.findIndex(t => t.id.toString() === termId);
    if (currentIndex > 0) {
      const prevTermId = terms[currentIndex - 1].id;
      navigate(`/term/${prevTermId}`);
    }
  };

  const handleNext = () => {
    const currentIndex = terms.findIndex(t => t.id.toString() === termId);
    if (currentIndex < terms.length - 1) {
      const nextTermId = terms[currentIndex + 1].id;
      navigate(`/term/${nextTermId}`);
    }
  };

  const handleEditOpen = () => {
    setIsEditOpen(true);
  };

  const handleEditClose = () => {
    setIsEditOpen(false);
  };

  const updateTermData = (updatedData) => {
    setTerm(updatedData);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!term) {
    return <p>No term found</p>;
  }

  const sections = ['Summary', 'FAQ', 'Technical_Stuff'];

  return (
    <div className="container">
      <div className="navigation-buttons">
        <button onClick={handlePrev} disabled={terms.findIndex(t => t.id.toString() === termId) === 0}>Previous</button>
        <button onClick={handleNext} disabled={terms.findIndex(t => t.id.toString() === termId) === terms.length - 1}>Next</button>
      </div>
      <h1 className="term-title">{term.name}</h1>
      <img src={imageUrl} alt={term.name} className="term-image" />
      <div className="content-section">
        <div className="faq-section">
          <h3>Summary</h3>
          <p>{term.response}</p>
        </div>
        <div className="faq-section">
          <h3>Frequently Asked Questions</h3>
          <div className="faq-item">
            <p className="faq-question">{term.faqQ1}</p>
            <p className="faq-answer">{term.faqA1}</p>
          </div>
          <div className="faq-item">
            <p className="faq-question">{term.faqQ2}</p>
            <p className="faq-answer">{term.faqA2}</p>
          </div>
          <div className="faq-item">
            <p className="faq-question">{term.faqQ3}</p>
            <p className="faq-answer">{term.faqA3}</p>
          </div>
          <div className="faq-item">
            <p className="faq-question">{term.faqQ4}</p>
            <p className="faq-answer">{term.faqA4}</p>
          </div>
          <div className="faq-item">
            <p className="faq-question">{term.faqQ5}</p>
            <p className="faq-answer">{term.faqA5}</p>
          </div>
        </div>
      </div>
      <div className="faq-section">
        <h3>Info</h3>
        <div className="keywords-section">
          <p><strong>Prompt:</strong> {term.prompt}</p>
          <p><strong>High Keywords:</strong> {term.highKeywords}</p>
          <p><strong>Medium Keywords:</strong> {term.mediumKeywords}</p>
          <p><strong>Low Keywords:</strong> {term.lowKeywords}</p>
          <p><strong>FAQ High Keywords:</strong> {term.faqHighKeywords}</p>
          <p><strong>FAQ Medium Keywords:</strong> {term.faqMediumKeywords}</p>
          <p><strong>FAQ Low Keywords:</strong> {term.faqLowKeywords}</p>
        </div>
      </div>
      <ManualEditMenu termId={termId} open={isEditOpen} onClose={handleEditClose} onSave={updateTermData} />
      <AuditPanelWithEdit sections={sections} termId={termId} summary={term.response} />
      <div className="navigation-buttons">
        <button onClick={handlePrev} disabled={terms.findIndex(t => t.id.toString() === termId) === 0}>Previous</button>
        <button onClick={handleNext} disabled={terms.findIndex(t => t.id.toString() === termId) === terms.length - 1}>Next</button>
      </div>
    </div>
  );
}

export default TermDetail;
