import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './LoginPage';
import NotesPage from './NotesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/notes" component={NotesPage} />
        <Route path="/" component={LoginPage} />
      </Routes>
    </Router>
  );
}

export default App;