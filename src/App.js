import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientListPage from './components/clients';
import ClientDetailPage from './components/ClientDetailPage';

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<ClientListPage />} />
            <Route path="/client/:id" element={<ClientDetailPage />} />
        </Routes>
    </Router>
);

export default App;
