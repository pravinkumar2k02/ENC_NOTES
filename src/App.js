import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LoginPage from './LoginPage';
import NotesPage from './NotesPage';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/notes" component={NotesPage} />
        <Route path="/" component={LoginPage} />
      </Switch>
    </Router>
  );
}

export default App;