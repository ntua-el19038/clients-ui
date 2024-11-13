import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ClientListPage.css';

const baseUrl = 'http://localhost:8080';

const ClientListPage = () => {
    const [clients, setClients] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [selectedMunicipality, setSelectedMunicipality] = useState('');
    const [searchName, setSearchName] = useState('');
    const [loadingMunicipalities, setLoadingMunicipalities] = useState(true);

    useEffect(() => {
        fetchMunicipalities();
    }, []);

    const fetchMunicipalities = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/v1/useeClient/municipality`);
            const municipalityData = response.data["returnobject"];
            if (Array.isArray(municipalityData)) {
                setMunicipalities(municipalityData);
            }
        } catch (error) {
            console.error('Error fetching municipalities:', error);
        } finally {
            setLoadingMunicipalities(false);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/v1/useeClient`, {
                params: {
                    size: 10000,
                    name: searchName,
                    municipality: selectedMunicipality,
                },
            });
            setClients(response.data["returnobject"]["page"]["content"]);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const handleSearchNameChange = (e) => {
        setSearchName(e.target.value);
    };

    const handleMunicipalityChange = (e) => {
        setSelectedMunicipality(e.target.value);
    };

    useEffect(() => {
        fetchClients();
    }, [searchName, selectedMunicipality]);

    return (
        <div className="client-list-page">
        <div className="client-list-container">
            <h2>Client List</h2>

            <input
                type="text"
                placeholder="Search by name"
                value={searchName}
                onChange={handleSearchNameChange}
                className="search-input"
            />

            <select
                value={selectedMunicipality}
                onChange={handleMunicipalityChange}
                disabled={loadingMunicipalities}
                className="municipality-select"
            >
                <option value="">Select Municipality</option>
                {municipalities.map((municipality) => (
                    <option key={municipality} value={municipality}>
                        {municipality}
                    </option>
                ))}
            </select>

            <ul className="client-list">
                {clients.map((client) => (
                    <li key={client.id} className="client-list-item">
                        <Link to={`/client/${client.id}`}>
                            <strong>{client.name}</strong> - {client.useeClientLocation?.area}, {client.useeClientLocation?.zip}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
        </div>
    );
};

export default ClientListPage;
