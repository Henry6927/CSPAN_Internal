import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SettingsMenu.css';

const SettingsMenu = ({ termId }) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showSyncKeywordsConfirm, setShowSyncKeywordsConfirm] = useState(false);
  const [showClearKeywordsConfirm, setShowClearKeywordsConfirm] = useState(false);
  const [showDeleteAboveConfirm, setShowDeleteAboveConfirm] = useState(false);
  const [deleteAboveValue, setDeleteAboveValue] = useState(''); 

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/terms/${termId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      navigate('/'); 
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/terms/delete_all', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      navigate('/pageview');  
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSyncKeywords = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/terms/sync_keywords', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      alert('Keywords synced successfully');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleClearKeywords = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/terms/clear_keywords', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      alert('Keywords cleared successfully');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteAbove = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/terms/delete_terms_above/${deleteAboveValue}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      navigate('/pageview');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="settings-menu">
      <h2>Settings Menu</h2>
      <button className="greyButton" onClick={() => setShowDeleteConfirm(true)}>Delete Term</button>
      <button className="greyButton" onClick={() => setShowDeleteAllConfirm(true)}>Delete All Terms</button>
      <button className="greyButton" onClick={() => setShowSyncKeywordsConfirm(true)}>Sync Keywords (3 mins)</button>
      <button className="greyButton" onClick={() => setShowClearKeywordsConfirm(true)}>Clear Keywords</button>
      <div>
        <input
          type="number"
          value={deleteAboveValue}
          onChange={(e) => setDeleteAboveValue(e.target.value)}
          placeholder="num"
        />
        <button className="greyButton" onClick={() => setShowDeleteAboveConfirm(true)}>Delete Terms ID's greater than num</button>
      </div>

      {showDeleteConfirm && (
        <div className="confirm-dialog">
          <p>Are you sure you want to delete this term?</p>
          <button className="greyButton" onClick={handleDelete}>Yes</button>
          <button className="greyButton" onClick={() => setShowDeleteConfirm(false)}>No</button>
        </div>
      )}

      {showDeleteAllConfirm && (
        <div className="confirm-dialog">
          <p>Are you sure you want to delete all terms?</p>
          <button className="greyButton" onClick={handleDeleteAll}>Yes</button>
          <button className="greyButton" onClick={() => setShowDeleteAllConfirm(false)}>No</button>
        </div>
      )}

      {showSyncKeywordsConfirm && (
        <div className="confirm-dialog">
          <p>Are you sure you want to sync keywords?</p>
          <button className="greyButton" onClick={handleSyncKeywords}>Yes</button>
          <button className="greyButton" onClick={() => setShowSyncKeywordsConfirm(false)}>No</button>
        </div>
      )}

      {showClearKeywordsConfirm && (
        <div className="confirm-dialog">
          <p>Are you sure you want to clear all keywords?</p>
          <button className="greyButton" onClick={handleClearKeywords}>Yes</button>
          <button className="greyButton" onClick={() => setShowClearKeywordsConfirm(false)}>No</button>
        </div>
      )}

      {showDeleteAboveConfirm && (
        <div className="confirm-dialog">
          <p>Are you sure you want to delete terms with IDs greater than {deleteAboveValue}?</p>
          <button className="greyButton" onClick={handleDeleteAbove}>Yes</button>
          <button className="greyButton" onClick={() => setShowDeleteAboveConfirm(false)}>No</button>
        </div>
      )}
    </div>
  );
};

export default SettingsMenu;
