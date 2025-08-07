// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ItemLookup from './pages/itemlookup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ItemLookup />} />
      </Routes>
    </Router>
  );
}

export default App;
