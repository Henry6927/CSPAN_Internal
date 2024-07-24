import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Container, Typography, Box, IconButton, Modal } from '@mui/material';
import { FaTimes } from 'react-icons/fa';
import './EditMenu.css';

const TextPopup = ({ open, text, onClose }) => (
  <Modal open={open} onClose={onClose}>
    <Box className="text-popup">
      <Typography variant="body1">{text}</Typography>
      <IconButton onClick={onClose}>
        <FaTimes />
      </IconButton>
    </Box>
  </Modal>
);

const EditMenu = ({ termId, open, onClose }) => {
  const [termData, setTermData] = useState({
    description: '',
    faqQ1: '',
    faqA1: '',
    faqQ2: '',
    faqA2: '',
    faqQ3: '',
    faqA3: '',
    faqQ4: '',
    faqA4: '',
    faqQ5: '',
    faqA5: ''
  });
  const [selectedText, setSelectedText] = useState(null);

  useEffect(() => {
    if (open) {
      fetch(`http://127.0.0.1:5000/api/terms/${termId}`)
        .then((response) => response.json())
        .then((term) => {
          if (term) {
            setTermData({
              description: term.response || '',
              faqQ1: term.faqQ1 || '',
              faqA1: term.faqA1 || '',
              faqQ2: term.faqQ2 || '',
              faqA2: term.faqA2 || '',
              faqQ3: term.faqQ3 || '',
              faqA3: term.faqA3 || '',
              faqQ4: term.faqQ4 || '',
              faqA4: term.faqA4 || '',
              faqQ5: term.faqQ5 || '',
              faqA5: term.faqA5 || ''
            });
          }
        })
        .catch((error) => console.error('Error fetching term data:', error));
    }
  }, [termId, open]);

  const handleTextClick = (text) => {
    setSelectedText(text);
  };

  const handlePopupClose = () => {
    setSelectedText(null);
  };

  return (
    <Modal open={open} onClose={onClose} className="full-page-modal">
      <Container className="manual-edit-menu">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h2" gutterBottom>
            Automated Edits
          </Typography>
          <IconButton onClick={onClose}>
            <FaTimes />
          </IconButton>
        </Box>
        <Typography variant="body1" gutterBottom>
          Click on any text to edit.
        </Typography>
        <Box className="manual-edit-form text-content">
          <Typography variant="body1" gutterBottom onClick={() => handleTextClick(termData.description)} className="clickable-text">
            {termData.description}
          </Typography>
          {Array.from({ length: 5 }).map((_, index) => (
            <Box key={index} mb={2}>
              <Typography variant="body2" gutterBottom onClick={() => handleTextClick(termData[`faqQ${index + 1}`])} className="clickable-text">
                {`FAQ Question ${index + 1}: ${termData[`faqQ${index + 1}`]}`}
              </Typography>
              <Typography variant="body2" gutterBottom onClick={() => handleTextClick(termData[`faqA${index + 1}`])} className="clickable-text">
                {`FAQ Answer ${index + 1}: ${termData[`faqA${index + 1}`]}`}
              </Typography>
            </Box>
          ))}
        </Box>
        {selectedText && (
          <TextPopup open={!!selectedText} text={selectedText} onClose={handlePopupClose} />
        )}
      </Container>
    </Modal>
  );
};

EditMenu.propTypes = {
  termId: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditMenu;
