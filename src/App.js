import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import TermList from './components/TermList';
import TermDetail from './components/TermDetail';
import ModSummary from './components/ModSummary';
import AddTerm from './components/AddTerm';
import LegislationList from './components/LegislationList'; // Import the legislation components
import AddLegislation from './components/AddLegislation'; // Import the AddLegislation component
import EditLegislation from './components/EditLegislation'; // Import the EditLegislation component
import './App.css';
import subtitleview from './components/subtitleview';

function App() {
  return (
    <Router>
      <div className="App">
        <NavigationBar />
        <Routes>
          <Route exact path="/" element={<TermList />} />
          <Route path="/term/new" element={<AddTerm />} />
          <Route path="/term/:termId" element={<TermDetail />} />
          <Route path="/term/:termId/modify-summary" element={<ModSummary />} />
          <Route path="/subtitleview" element={<subtitleview />} />
          <Route path="/legislation" element={<LegislationList />} /> {/* Route for viewing all legislation */}
          <Route path="/legislation/new" element={<AddLegislation />} /> {/* Route for adding new legislation */}
          <Route path="/legislation/:congress_id/:legislative_id" element={<EditLegislation />} /> {/* Route for editing legislation */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
