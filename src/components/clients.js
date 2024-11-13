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
    const [loadingClients, setLoadingClients] = useState(false);
    const [emailFilter, setEmailFilter] = useState('all'); // New state for email filter

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0); // API pages are usually 0-indexed
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(20); // Number of clients per page

    // Fetch municipalities on component mount
    useEffect(() => {
        fetchMunicipalities();
    }, []);

    // Function to fetch municipalities
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

    // Function to fetch clients with pagination
    const fetchClients = async (page = 0) => {
        setLoadingClients(true);
        try {
            const response = await axios.get(`${baseUrl}/api/v1/useeClient`, {
                params: {
                    page,
                    size: pageSize,
                    name: searchName,
                    municipality: selectedMunicipality,
                },
            });
            let data = response.data["returnobject"]["page"]["content"];

            // Filter clients based on email availability
            if (emailFilter === 'withEmail') {
                data = data.filter(client => client.emails && client.emails.length > 0);
            } else if (emailFilter === 'withoutEmail') {
                data = data.filter(client => !client.emails || client.emails.length === 0);
            }

            setClients(data);
            setCurrentPage(response.data["returnobject"]["page"]["number"]);
            setTotalPages(response.data["returnobject"]["page"]["totalPages"]);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoadingClients(false);
        }
    };
// Handle email filter change
    const handleEmailFilterChange = (e) => {
        setEmailFilter(e.target.value);
        setCurrentPage(0); // Reset to first page when filter changes
    };


    // Handle search by name input change
    const handleSearchNameChange = (e) => {
        setSearchName(e.target.value);
        setCurrentPage(0); // Reset to first page
    };

    // Handle municipality dropdown change
    const handleMunicipalityChange = (e) => {
        setSelectedMunicipality(e.target.value);
        setCurrentPage(0); // Reset to first page
    };

    // Fetch clients when searchName or selectedMunicipality changes
    useEffect(() => {
        fetchClients(currentPage);
    }, [searchName, selectedMunicipality, currentPage, emailFilter]);

    // Handle page navigation
    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="client-list-page">
            <div className="client-list-container">
                <h2>Client List</h2>

                {/* Search by name input */}
                <input
                    type="text"
                    placeholder="Search by name"
                    value={searchName}
                    onChange={handleSearchNameChange}
                    className="search-input"
                />

                {/* Municipality dropdown */}
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

                {/* Email Filter Dropdown */}
                <select
                    value={emailFilter}
                    onChange={handleEmailFilterChange}
                    className="email-filter-select"
                >
                    <option value="all">All Shops</option>
                    <option value="withEmail">Shops with Email</option>
                    <option value="withoutEmail">Shops without Email</option>
                </select>

                {/* Client list display */}
                {loadingClients ? (
                    <p>Loading clients...</p>
                ) : (
                    <ul className="client-list">
                        {clients.length > 0 ? (
                            clients.map((client) => (
                                <li key={client.id} className="client-list-item">
                                    <Link to={`/client/${client.id}`}
                                          style={{textDecoration: 'none', color: 'inherit'}}>
                                        <strong style={{
                                            color: '#007bff',
                                            textDecoration: 'underline'
                                        }}>{client.name}</strong>
                                    </Link>
                                    - {client.useeClientLocation?.area}, {client.useeClientLocation?.zip},
                                    {client.emails && client.emails.length > 0 ? "has email" : "no email"}
                                </li>
                            ))
                        ) : (
                            <p>No clients found.</p>
                        )}
                    </ul>
                )}

                {/* Pagination Controls */}
                <div className="pagination-controls">
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 0}
                    >
                        Previous
                    </button>
                    <span>
                Page {currentPage + 1} of {totalPages}
            </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages - 1}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>

    );
};

export default ClientListPage;
