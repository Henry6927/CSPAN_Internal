import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Box, Modal, IconButton } from '@mui/material';
import { FaTimes } from 'react-icons/fa';
import './ManualEditMenu.css';

const ManualEditMenu = ({ termId, open, onClose, onSave }) => {
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

  useEffect(() => {
    if (open) {
      fetch(`http://127.0.0.1:5000/api/terms/${termId}`)
        .then((response) => response.json())
        .then((term) => {
          if (term) {
            setTermData({
              description: term.response,
              faqQ1: term.faqQ1,
              faqA1: term.faqA1,
              faqQ2: term.faqQ2,
              faqA2: term.faqA2,
              faqQ3: term.faqQ3,
              faqA3: term.faqA3,
              faqQ4: term.faqQ4,
              faqA4: term.faqA4,
              faqQ5: term.faqQ5,
              faqA5: term.faqA5
            });
          }
        })
        .catch((error) => console.error('Error fetching term data:', error));
    }
  }, [termId, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTermData({ ...termData, [name]: value });
  };

  const handleSave = () => {
    fetch(`http://127.0.0.1:5000/api/terms/${termId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        response: termData.description,
        faqQ1: termData.faqQ1,
        faqA1: termData.faqA1,
        faqQ2: termData.faqQ2,
        faqA2: termData.faqA2,
        faqQ3: termData.faqQ3,
        faqA3: termData.faqA3,
        faqQ4: termData.faqQ4,
        faqA4: termData.faqA4,
        faqQ5: termData.faqQ5,
        faqA5: termData.faqA5
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Term data saved successfully:', data);
        onSave(data); 
        onClose(); 
        setTimeout(() => {
          window.location.reload(); 
        }, 100);
      })
      .catch((error) => {
        console.error('Error saving term data:', error);
        onClose();
        setTimeout(() => {
          window.location.reload();
        }, 100);
      });
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Container className="manual-edit-menu">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h2" gutterBottom>
            Manual Edits
          </Typography>
          <IconButton onClick={onClose}>
            <FaTimes />
          </IconButton>
        </Box>
        <Box component="form" noValidate autoComplete="off" className="manual-edit-form">
          <TextField
            id="description"
            name="description"
            label="Description"
            multiline
            rows={20} 
            value={termData.description}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            margin="normal"
          />
          {Array.from({ length: 5 }).map((_, index) => (
            <Box key={index} mb={2} className="MuiTextField-root">
              <TextField
                id={`faqQ${index + 1}`}
                name={`faqQ${index + 1}`}
                label={`FAQ Question ${index + 1}`}
                value={termData[`faqQ${index + 1}`]}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                margin="normal"
              />
              <TextField
                id={`faqA${index + 1}`}
                name={`faqA${index + 1}`}
                label={`FAQ Answer ${index + 1}`}
                multiline
                rows={4}
                value={termData[`faqA${index + 1}`]}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                margin="normal"
              />
            </Box>
          ))}
          <Box className="button-container">
            <Button variant="contained" color="secondary" onClick={handleCancel} className="cancel-button">
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave} className="save-button">
              Save Changes
            </Button>
          </Box>
        </Box>
      </Container>
    </Modal>
  );
};

export default ManualEditMenu;
