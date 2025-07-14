import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen.js';
import AnalyzeScreen from './screens/AnalyzeScreen.js';
import Navbar from './components/Navbar';
function App() {
    return (
        <Router>
          <Navbar />
            <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/analyze" element={<AnalyzeScreen />} />
            </Routes>
        </Router>
    );
}

export default App;
