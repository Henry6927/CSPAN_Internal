import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import TermList from './components/TermList';
import TermDetail from './components/TermDetail';
import ModSummary from './components/ModSummary';
import AddTerm from './components/AddTerm';
import LegislationList from './components/LegislationList';
import AddLegislation from './components/AddLegislation';
import EditLegislation from './components/EditLegislation';
import LegislationDetail from './components/LegislationDetail';
import SubtitleView from './components/subtitleview';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <NavigationBar />
        <Routes>
          <Route exact path="/" element={<TermList />} />
          <Route path="/term/new" element={<AddTerm />} />
          <Route path="/term/:termId" element={<TermDetail />} />
          <Route path="/term/:termId/modify-summary" element={<ModSummary onClick={() => console.log('Modify clicked')} />} />
          <Route path="/subtitleview" element={<SubtitleView />} />
          <Route path="/LegislationList" element={<LegislationList />} />
          <Route path="/legislation/new" element={<AddLegislation />} />
          <Route path="/legislation/:congressId/:legislativeId" element={<LegislationDetail />} />
          <Route path="/legislation/edit/:congressId/:legislativeId" element={<EditLegislation />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
