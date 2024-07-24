import React, { useState } from 'react';
import axios from 'axios';

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/bulk_upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'completed_' + file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage('File uploaded and processed successfully.');
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Error uploading file.');
    }
  };

  return (
    <div>
      <h2>Bulk Upload</h2>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default BulkUpload;
