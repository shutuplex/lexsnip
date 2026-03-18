import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateSnippet from './pages/CreateSnippet';
import SnippetView from './pages/SnippetView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CreateSnippet />} />
        <Route path="/:id" element={<SnippetView />} />
      </Routes>
    </Router>
  );
}

export default App;