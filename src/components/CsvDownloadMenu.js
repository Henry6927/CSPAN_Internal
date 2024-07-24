import React from 'react';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import './CsvDownloadMenu.css';

const CsvDownloadMenu = ({ termId, onClose }) => {
  const fetchTermData = (id) => {
    return fetch(`http://127.0.0.1:5000/api/terms/${id}`)
      .then(response => response.json())
      .catch(error => {
        console.error(`Error fetching term data for termId ${id}:`, error);
        return null;
      });
  };

  const fetchAuditData = (id) => {
    return fetch(`http://127.0.0.1:5000/api/audit/${id}`)
      .then(response => response.json())
      .catch(error => {
        console.error(`Error fetching audit data for termId ${id}:`, error);
        return null;
      });
  };

  const fetchAllTermIds = () => {
    return fetch('http://127.0.0.1:5000/api/terms')
      .then(response => response.json())
      .then(data => data.map(term => term.id))
      .catch(error => {
        console.error('Error fetching all term ids:', error);
        return [];
      });
  };

  const mergeTermAndAuditData = async (id) => {
    const termData = await fetchTermData(id);
    const auditData = await fetchAuditData(id);
    return {
      ...termData,
      auditData: auditData ? auditData.auditData : null,
      auditNotes: auditData ? auditData.notes : ''
    };
  };

  const downloadCsv = async (all = false, includeAudit = false) => {
    if (all) {
      const termIds = await fetchAllTermIds();
      const termPromises = termIds.map(id => includeAudit ? mergeTermAndAuditData(id) : fetchTermData(id));
      const allTermsData = await Promise.all(termPromises);
      const csvData = allTermsData.filter(termData => termData !== null).map(termData => ({
        id: termData.id,
        name: termData.name,
        prompt: termData.prompt,
        response: termData.response,
        faqQ1: termData.faqQ1,
        faqA1: termData.faqA1,
        faqQ2: termData.faqQ2,
        faqA2: termData.faqA2,
        faqQ3: termData.faqQ3,
        faqA3: termData.faqA3,
        faqQ4: termData.faqQ4,
        faqA4: termData.faqA4,
        faqQ5: termData.faqQ5,
        faqA5: termData.faqA5,
        highKeywords: termData.highKeywords,
        mediumKeywords: termData.mediumKeywords,
        lowKeywords: termData.lowKeywords,
        faqHighKeywords: termData.faqHighKeywords,
        faqMediumKeywords: termData.faqMediumKeywords,
        faqLowKeywords: termData.faqLowKeywords,
        auditData: includeAudit ? JSON.stringify(termData.auditData) : undefined,
        auditNotes: includeAudit ? termData.auditNotes : undefined
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, includeAudit ? 'all_terms_with_audit.csv' : 'all_terms.csv');
    } else {
      const termData = includeAudit ? await mergeTermAndAuditData(termId) : await fetchTermData(termId);
      if (termData) {
        const csvData = {
          id: termData.id,
          name: termData.name,
          prompt: termData.prompt,
          response: termData.response,
          faqQ1: termData.faqQ1,
          faqA1: termData.faqA1,
          faqQ2: termData.faqQ2,
          faqA2: termData.faqA2,
          faqQ3: termData.faqQ3,
          faqA3: termData.faqA3,
          faqQ4: termData.faqQ4,
          faqA4: termData.faqA4,
          faqQ5: termData.faqQ5,
          faqA5: termData.faqA5,
          highKeywords: termData.highKeywords,
          mediumKeywords: termData.mediumKeywords,
          lowKeywords: termData.lowKeywords,
          faqHighKeywords: termData.faqHighKeywords,
          faqMediumKeywords: termData.faqMediumKeywords,
          faqLowKeywords: termData.faqLowKeywords,
          auditData: includeAudit ? JSON.stringify(termData.auditData) : undefined,
          auditNotes: includeAudit ? termData.auditNotes : undefined
        };
        const csv = Papa.unparse([csvData]);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, includeAudit ? `${termData.name}_with_audit.csv` : `${termData.name}.csv`);
      } else {
        console.error('Term data not found');
      }
    }
  };

  const sendAllToAirtable = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/terms/send_to_airtable', {
        method: 'POST'
      });
      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error('Error sending all terms to Airtable:', error);
    }
  };

  const fetchFromAirtableAndUpdateDatabase = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/terms/fetch_from_airtable', {
        method: 'GET'
      });
      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error('Error fetching data from Airtable and updating database:', error);
    }
  };

  return (
    <div className="csv-download-menu">
      <h2>CSV Download Menu</h2>
      <button class="greyButton" onClick={() => downloadCsv(false)}>Download CSV for Term</button>
      <button class="greyButton" onClick={() => downloadCsv(true)}>Download CSV for All Terms</button>
      <button class="greyButton" onClick={() => downloadCsv(false, true)}>Download CSV for Term with Audit Data</button>
      <button class="greyButton" onClick={() => downloadCsv(true, true)}>Download CSV for All Terms with Audit Data</button>
      <button class="redButton" onClick={sendAllToAirtable}>Send All data to Airtable (3 mins)</button>
      <button class="redButton" onClick={fetchFromAirtableAndUpdateDatabase}>Fetch data from Airtable (3 mins) </button>
    </div>
  );
};

export default CsvDownloadMenu;
