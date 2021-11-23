import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateSightPage from './pages/CreateSightPage';
import EditSightPage from './pages/EditSightPage';
import { useState } from 'react';

function App() {
  const [SightToEdit, setSightToEdit] = useState();


  return (
    <div className="App">
      <h1 className="Title">See Oregon</h1>
      <Router>
        <div className="App-header">
          <Route path="/" exact>
            <HomePage setSightToEdit={setSightToEdit} />
          </Route>
          <Route path="/show-sights">
            <CreateSightPage />
          </Route>
          <Route path="/edit-sight">
            <EditSightPage SightToEdit={SightToEdit} />
          </Route>
        </div>
      </Router>
    </div>
  );
}

export default App;