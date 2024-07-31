import React from 'react';
import PropTypes from 'prop-types';
import { Container, Typography, Box, IconButton, Modal } from '@mui/material';
import { FaTimes } from 'react-icons/fa';
import './ModEntireText.css';

const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL;

const ModEntireText = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} className="full-page-modal">
    <Container className="mod-entire-text">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h2" gutterBottom>
          Modify Entire Text
        </Typography>
        <IconButton onClick={onClose}>
          <FaTimes />
        </IconButton>
      </Box>
      <Box>
        <Typography variant="body1" gutterBottom>
          Entire Text content here...
        </Typography>
      </Box>
    </Container>
  </Modal>
);

ModEntireText.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ModEntireText;
