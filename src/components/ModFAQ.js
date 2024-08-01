import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Container, Typography, Box, IconButton, Modal, CircularProgress, TextField, Button } from '@mui/material';
import { FaTimes } from 'react-icons/fa';
import './ModFAQ.css';

const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL;

const ModFaq = ({ onClose, open, termId }) => {
  const [faqData, setFaqData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customQuestion, setCustomQuestion] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [newFaq, setNewFaq] = useState([]);
  const [showNewFaqModal, setShowNewFaqModal] = useState(false);
  const [generatingNewFaq, setGeneratingNewFaq] = useState(false);
  const [selectedFaqIndex, setSelectedFaqIndex] = useState(null);
  const [customFaqIndex, setCustomFaqIndex] = useState(null);

  useEffect(() => {
    fetchFaqData(termId);
  }, [termId]);

  const fetchFaqData = async (id) => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/terms/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFaqData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching FAQ data:', error);
      setLoading(false);
    }
  };

  const reloadFaqData = async () => {
    setLoading(true);
    await fetchFaqData(termId);
    setLoading(false);
  };

  const handleSaveToDatabase = async () => {
    setLoading(true);
    try {
      const updatedFaqData = { ...faqData };

      if (selectedFaqIndex !== null && newFaq && newFaq.length > 0) {
        const [newQuestion, newAnswer] = newFaq[0].split('@');
        updatedFaqData[`faqQ${selectedFaqIndex + 1}`] = newQuestion;
        updatedFaqData[`faqA${selectedFaqIndex + 1}`] = newAnswer;
      }

      const response = await fetch(`${BACKEND_API_URL}/api/terms/${termId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFaqData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchFaqData(termId);
      setLoading(false);
      setShowNewFaqModal(false);
      reloadFaqData(); 
    } catch (error) {
      console.error('Error saving FAQ data:', error);
      setLoading(false);
    }
  };

  const handleCustomSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/terms/process_custom_question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customQuestion }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const customAnswer = data.response;

      const updatedFaqData = { ...faqData };
      if (customFaqIndex !== null) {
        updatedFaqData[`faqQ${customFaqIndex + 1}`] = customQuestion;
        updatedFaqData[`faqA${customFaqIndex + 1}`] = customAnswer;
      }

      const saveResponse = await fetch(`${BACKEND_API_URL}/api/terms/${termId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFaqData),
      });
      if (!saveResponse.ok) {
        throw new Error(`HTTP error! status: ${saveResponse.status}`);
      }
      await fetchFaqData(termId);
      setLoading(false);
      setShowCustomInput(false);
    } catch (error) {
      console.error('Error processing custom question:', error);
      setLoading(false);
    }
  };

  const handleCloseNewFaqModal = () => {
    setShowNewFaqModal(false);
    setSelectedFaqIndex(null);
    setNewFaq(null);
    reloadFaqData();
  };

  const generateNewFaq = async (index) => {
    setGeneratingNewFaq(true);
    setSelectedFaqIndex(index);
    try {
      const allFaqs = {
        faqQ1: faqData.faqQ1,
        faqA1: faqData.faqA1,
        faqQ2: faqData.faqQ2,
        faqA2: faqData.faqA2,
        faqQ3: faqData.faqQ3,
        faqA3: faqData.faqA3,
        faqQ4: faqData.faqQ4,
        faqA4: faqData.faqA4,
        faqQ5: faqData.faqQ5,
        faqA5: faqData.faqA5,
        description: faqData.description,
      };

      const response = await fetch(`${BACKEND_API_URL}/api/generate-new-faq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ existingFaq: allFaqs }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNewFaq(data.newFaq ? [data.newFaq] : []);
      setGeneratingNewFaq(false);
      setShowNewFaqModal(true);
    } catch (error) {
      console.error('Error generating new FAQ:', error);
      setGeneratingNewFaq(false);
    }
  };

  const handleDone = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <Modal open={open} onClose={onClose} className="full-page-modal">
        <Container className="mod-summary">
          <CircularProgress />
        </Container>
      </Modal>
    );
  }

  if (!faqData) {
    return null;
  }

  const faqs = [
    { question: faqData.faqQ1, answer: faqData.faqA1 },
    { question: faqData.faqQ2, answer: faqData.faqA2 },
    { question: faqData.faqQ3, answer: faqData.faqA3 },
    { question: faqData.faqQ4, answer: faqData.faqA4 },
    { question: faqData.faqQ5, answer: faqData.faqA5 }
  ];

  return (
    <Modal open={open} onClose={onClose} className="full-page-modal">
      <Container className="containerfaq">
        <Box>
          <Typography variant="h4" component="h2" className="term-title" gutterBottom>
            {faqData.faqTitle}
          </Typography>
          <IconButton onClick={onClose}>
            <FaTimes />
          </IconButton>
        </Box>
        <Box className="content-section">
          <Box className="faq-section">
            {faqs.map((faq, index) => (
              <Box key={index} className="faq-item-faq">
                <Box className="faqstuff">
                  <Typography variant="h6" className="faq-question">{faq.question}</Typography>
                  <Typography variant="body1" className="faq-answer">{faq.answer}</Typography>
                </Box>
                <Box className="navigation-buttons-faq">
                  <Button 
                    variant="contained"
                    onClick={() => generateNewFaq(index)} 
                    disabled={generatingNewFaq}
                  >
                    Generate New FAQ
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={() => {
                      setShowCustomInput(true);
                      setCustomFaqIndex(index);
                    }}
                  >
                    Custom Question
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
        {showCustomInput && (
          <Box className="custom-input-box">
            <TextField
              label="Enter your custom question and answer"
              variant="outlined"
              multiline
              rows={8}
              fullWidth
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              className="expandable-textarea"
            />
            <Button
              onClick={handleCustomSubmit}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              Submit
            </Button>
          </Box>
        )}
        <Box className="full-width-buttons">
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleDone}
          >
            Done
          </Button>
        </Box>
        <Modal open={showNewFaqModal} onClose={handleCloseNewFaqModal} className="full-page-modal">
          <Container className="containerfaq">
            <Box>
              <Typography variant="h4" component="h2" className="term-title" gutterBottom>
                Compare FAQs
              </Typography>
              <IconButton onClick={handleCloseNewFaqModal}>
                <FaTimes />
              </IconButton>
            </Box>
            <Box className="content-section">
              <Typography variant="h6" className="faq-question">Old FAQ:</Typography>
              {selectedFaqIndex !== null && (
                <Box key={selectedFaqIndex} className="faq-item-faq">
                  <Typography variant="body1" className="faq-answer">
                    <strong>{faqData[`faqQ${selectedFaqIndex + 1}`]}</strong> <br /> {faqData[`faqA${selectedFaqIndex + 1}`]}
                  </Typography>
                </Box>
              )}
              <Typography variant="h6" className="faq-question">New FAQ:</Typography>
              {Array.isArray(newFaq) && newFaq.length > 0 && (
                <Box className="faq-item-faq">
                  <Typography variant="body1" className="faq-answer">
                    {newFaq.map((faq, index) => {
                      const [question, answer] = faq.split('@');
                      return (
                        <Box key={index}>
                          <Typography variant="body1" className="faq-answer">
                            <strong>{question}</strong>
                            <br />
                            {answer}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Typography>
                </Box>
              )}
            </Box>
            <Box className="full-width-buttons-half">
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={handleCloseNewFaqModal}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSaveToDatabase}
              >
                Save
              </Button>
            </Box>
          </Container>
        </Modal>
      </Container>
    </Modal>
  );
};

ModFaq.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  termId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default ModFaq;
