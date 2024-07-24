import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Container, Typography, Box, IconButton, Modal, CircularProgress, TextField, Button, MenuItem, Checkbox, ListItemText, Select, Autocomplete, Chip } from '@mui/material';
import { FaTimes } from 'react-icons/fa';
import './ModSummary.css';

const ModSummary = ({ onClick, onClose, open, termId }) => {
  const [originalText, setOriginalText] = useState('Loading...');
  const [newText, setNewText] = useState(<i>No changes yet</i>);
  const [loading, setLoading] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState('Loading...');
  const [editedPrompt, setEditedPrompt] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [showKeywordInput, setShowKeywordInput] = useState(false);
  const [showEditPromptInput, setShowEditPromptInput] = useState(false);
  const [wordCount, setWordCount] = useState('');
  const [showWordCountInput, setShowWordCountInput] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPromptInput, setShowCustomPromptInput] = useState(false);
  const [activePromptSource, setActivePromptSource] = useState('original');
  const [keywordOptions, setKeywordOptions] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [keywordSuggestion, setKeywordSuggestion] = useState('');




  useEffect(() => {
    const fetchTermData = async (id) => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/terms/${id}`);
        const data = await response.json();
        setOriginalText(data.response);
        setNewText(<i>No changes yet</i>);
        setIsDirty(false);
      } catch (error) {
        console.error('Error fetching term data:', error);
      }
    };
  
    const fetchKeywordOptions = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/terms');
        const data = await response.json();
        const terms = data.map(term => term.name);
        setKeywordOptions(terms);
      } catch (error) {
        console.error('Error fetching keyword options:', error);
      }
    };
  
    fetchTermData(termId);
    fetchKeywordOptions();
  }, [termId]);
  

  const regenerateText = async () => {
    setLoading(true);
    setActivePromptSource('original');  
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/terms/${termId}`);
      const data = await response.json();
      const prompt = data.prompt;

      const regenerateResponse = await fetch('http://127.0.0.1:5000/api/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      const regenerateData = await regenerateResponse.json();
      if (regenerateData.error) {
        throw new Error(regenerateData.error);
      }
      setNewText(regenerateData.generated_text);
      setLoading(false);
      setIsDirty(true);
    } catch (error) {
      console.error('Error regenerating text:', error);
      setNewText('Error regenerating text.');
      setLoading(false);
    }
  };

  const regenerateTextWithKeywords = async () => {
    setLoading(true);
    try {
      const combinedKeywords = keywords + ', ' + selectedKeywords.join(', ');
      const prompt = `This is an existing summary that has been created by an unbiased CSPAN news reporter: ${originalText}\nYou must try to rewrite this text as an unbiased CSPAN news reporter, while also including these keywords in the text: ${combinedKeywords}. Please do not question what is asked of you and try your best to incorporate said keywords.`;
  
      const response = await fetch('http://127.0.0.1:5000/api/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setNewText(data.generated_text);
      setLoading(false);
      setIsDirty(true);
    } catch (error) {
      console.error('Error regenerating text:', error);
      setNewText('Error regenerating text.');
      setLoading(false);
    }
  };
  

  const regenerateTextWithEditedPrompt = async () => {
    setLoading(true);
    setActivePromptSource('edited');
    try {
      const prompt = editedPrompt;

      const response = await fetch('http://127.0.0.1:5000/api/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setNewText(data.generated_text);
      setLoading(false);
      setIsDirty(true);
    } catch (error) {
      console.error('Error regenerating text:', error);
      setNewText('Error regenerating text.');
      setLoading(false);
    }
  };

  const regenerateTextUnbiased = async () => {
    setLoading(true);
    try {
      const prompt = `This is an existing summary that has been created by an unbiased CSPAN news reporter: ${originalText}\nYou must rewrite this text to be more unbiased and apolitical, coming from the perspective of an unbiased CSPAN journalist, who is writing a summary of said topic for the website to inform users on the topic. Please do not try to depict any subject, country, person, or idea as positive or negative, purely try to inform the reader.`;

      const response = await fetch('http://127.0.0.1:5000/api/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setNewText(data.generated_text);
      setLoading(false);
      setIsDirty(true);
    } catch (error) {
      console.error('Error regenerating text:', error);
      setNewText('Error regenerating text.');
      setLoading(false);
    }
  };

  
  const handleWordCountChange = (event) => {
    setWordCount(event.target.value);
  };
  
  const toggleWordCountInput = () => {
    setShowWordCountInput(!showWordCountInput);
  };
  
  const regenerateTextWithWordCount = async () => {
    setLoading(true);
    try {
      const prompt = `This is an existing summary that has been created by an unbiased CSPAN news reporter: ${originalText}\nYou must rewrite this text to have approximately ${wordCount} words. Ensure the summary is unbiased and apolitical, coming from the perspective of an unbiased CSPAN journalist. Please do not try to depict any subject, country, person, or idea as positive or negative, purely try to inform the reader.`;
  
      const response = await fetch('http://127.0.0.1:5000/api/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setNewText(data.generated_text);
      setLoading(false);
      setIsDirty(true);
    } catch (error) {
      console.error('Error regenerating text:', error);
      setNewText('Error regenerating text.');
      setLoading(false);
    }
  };
  
  const saveNewText = async () => {
    setLoading(true);
    try {
      let promptToSave = originalPrompt;
      if (activePromptSource === 'edited') {
        promptToSave = editedPrompt;
      } else if (activePromptSource === 'custom') {
        promptToSave = customPrompt;
      }
  
      const response = await fetch(`http://127.0.0.1:5000/api/terms/${termId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: newText, prompt: promptToSave }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setLoading(false);
      setIsDirty(false);
      onClose();
    } catch (error) {
      console.error('Error saving new text:', error);
      setLoading(false);
    }
  };
  

  const cancelChanges = () => {
    setNewText('Placeholder text');
    setIsDirty(false);
    onClose();
  };

  const handleKeywordChange = (event) => {
    const inputValue = event.target.value;
    setKeywords(inputValue);
  
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
      const currentKeywords = keywords.split(',');
      currentKeywords.pop();
      currentKeywords.push(keywordSuggestion);
      setKeywords(currentKeywords.join(', ') + ', ');
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

  const handleEditedPromptChange = (event) => {
    setEditedPrompt(event.target.value);
  };

  const toggleKeywordInput = () => {
    setShowKeywordInput(!showKeywordInput);
  };
  const handleCustomPromptChange = (event) => {
    setCustomPrompt(event.target.value);
  };
  
  const regenerateTextWithCustomPrompt = async () => {
    setLoading(true);
    setActivePromptSource('custom');
    try {
      const prompt = customPrompt;
  
      const response = await fetch('http://127.0.0.1:5000/api/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setNewText(data.generated_text);
      setLoading(false);
      setIsDirty(true);
    } catch (error) {
      console.error('Error regenerating text:', error);
      setNewText('Error regenerating text.');
      setLoading(false);
    }
  };
  

  const toggleEditPromptInput = async () => {
    setShowEditPromptInput(!showEditPromptInput);
    if (!showEditPromptInput) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/terms/${termId}`);
        const data = await response.json();
        const prompt = data.prompt;
        setOriginalPrompt(prompt);
        setEditedPrompt(prompt);
      } catch (error) {
        console.error('Error fetching term data:', error);
      }
    }
  };

  return (
    <Modal open={open} onClose={onClose} className="full-page-modal">
      <Container className="mod-summary">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h2" gutterBottom>
            Modify Summary
          </Typography>
          <IconButton onClick={onClose}>
            <FaTimes />
          </IconButton>
        </Box>
        <Box className="layout">
          <Box className="left-section">
            <Typography variant="h6">Original Text</Typography>
            <Typography variant="body1" className="new-text">
              {originalText}
            </Typography>
            <Typography variant="h6">New Text</Typography>
            <Typography variant="body1" className="new-text">
              {loading ? <CircularProgress size={24} /> : newText}
            </Typography>
          </Box>
          <Box className="right-section">
            <Box className="button-container">
              <button className="button" onClick={regenerateText} disabled={loading}>
                Regenerate Text
              </button>
              <button className="button" onClick={toggleKeywordInput}>
                Add Key Word(s)
              </button>
              {showKeywordInput && (
                <Box className="keyword-input-box">
                  <TextField
                    label="Enter keywords"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    value={keywords}
                    onChange={handleKeywordChange}
                    onKeyDown={handleKeywordKeyDown}
                    onBlur={handleKeywordBlur}
                    InputProps={{
                      style: {
                        paddingBottom: keywordSuggestion ? '40px' : '10px',
                      },
                      endAdornment: (
                        <span style={{ color: 'gray', position: 'absolute', right: '10px', bottom: '10px' }}>
                          {keywordSuggestion && keywordSuggestion.toLowerCase().startsWith(keywords.split(',').pop().trim().toLowerCase()) ? truncateSuggestion(keywordSuggestion) : ''}
                        </span>
                      ),
                    }}
/>



<Button onClick={regenerateTextWithKeywords} variant="contained" color="primary" disabled={loading} style={{ marginTop: '10px' }}>
  Go!
</Button>
                </Box>
              )}
              <button className="button" onClick={toggleEditPromptInput}>
                Edit Existing Prompt & Regenerate
              </button>
              {showEditPromptInput && (
                <Box className="edit-prompt-input-box">
                  <TextField
                    label="Edit the existing prompt"
                    variant="outlined"
                    multiline
                    rows={7}
                    fullWidth
                    value={editedPrompt}
                    onChange={handleEditedPromptChange}
                    className="expandable-textarea"
                  />
                  <Button onClick={regenerateTextWithEditedPrompt} variant="contained" color="primary" disabled={loading} style={{ marginTop: '10px' }}>
                    Go!
                  </Button>
                </Box>
              )}
              <button className="button" onClick={toggleWordCountInput}>
                Change Word Count
              </button>
              {showWordCountInput && (
                <Box className="word-count-input-box">
                  <TextField
                    label="Enter desired word count"
                    variant="outlined"
                    fullWidth
                    value={wordCount}
                    onChange={handleWordCountChange}
                  />
                  <Button onClick={regenerateTextWithWordCount} variant="contained" color="primary" disabled={loading} style={{ marginTop: '10px' }}>
                    Go!
                  </Button>
                </Box>
              )}
              <button className="button" onClick={() => setShowCustomPromptInput(!showCustomPromptInput)}>
                Custom Prompt
              </button>
              {showCustomPromptInput && (
                <Box className="custom-prompt-input-box">
                  <TextField
                    label="Enter your custom prompt"
                    variant="outlined"
                    multiline
                    rows={7}
                    fullWidth
                    value={customPrompt}
                    onChange={handleCustomPromptChange}
                    className="expandable-textarea"
                  />
                  <Button onClick={regenerateTextWithCustomPrompt} variant="contained" color="primary" disabled={loading} style={{ marginTop: '10px' }}>
                    Go!
                  </Button>
                </Box>
              )}
              <button className="button" onClick={regenerateTextUnbiased}>Unbias & Regenerate</button>
            </Box>
            <Box className="save-cancel-section">
              <button className="save-cancel-button" onClick={cancelChanges} disabled={loading}>
                Cancel
              </button>
              <button className="save-cancel-button" onClick={saveNewText} disabled={loading || !isDirty}>
                Save New Text
              </button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Modal>
  );
};  

ModSummary.propTypes = {
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  termId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default ModSummary;
