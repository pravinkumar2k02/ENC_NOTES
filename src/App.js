import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './LoginPage';
import NotesPage from './NotesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" component={LoginPage} />
        <Route path="/notes" component={NotesPage} />
      </Routes>
    </Router>
  );
}

export default App;