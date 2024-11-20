import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import ClientListPage from './components/clients';
import ClientList from "./components/ClientList";
import ClientDetailPage from './components/ClientDetailPage';

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<ClientList    />} />
            <Route path="/client/:id" element={<ClientDetailPage />} />
        </Routes>
    </Router>
);

export default App;
