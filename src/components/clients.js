import React, { useState, useEffect } from 'react';
import axios, {options} from 'axios';
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
    const [selectedOptions, setSelectedOptions] = useState({}); // Track selected options per client
    const [clientNotes, setClientNotes] = useState({}); // Track notes for each client
    const [editingNotes, setEditingNotes] = useState({}); // Track editing notes state

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0); // API pages are usually 0-indexed
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(10); // Number of clients per page

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
            // const myHeaders = new Headers();
            // myHeaders.append("Content-Type", "application/json");
            // // myHeaders.append("Cookie", "auth_token=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkZXYiLCJyb2xlIjoiUk9MRV9BRE1JTiIsImlzcyI6InVzZWUtYXBwIiwiZXhwIjoxNzMyNjQzODE0LCJpYXQiOjE3MzE3Nzk4MTQsImp0aSI6ImVkNzdlNTYyLTk2OWItNDA2OC05ZGYyLWEyYTg3MWQ4MDlkNCJ9.tXOdObOPw3OuJZabgRlpLMplq_9N_bDhnIcHR4Kbu8E");
            //
            // const raw = JSON.stringify({
            //     "username": "dev",
            //     "password": "1234"
            // });
            //
            // const requestOptions = {
            //     method: "POST",
            //     headers: myHeaders,
            //     body: raw,
            //     redirect: "follow",
            //     withCredentials: true,  // Ensure cookies are sent with the request
            // };
            //
            // fetch("http://localhost:8080/api/v1/auth/login", requestOptions)
            //     .then((response) => response.text())
            //     .then((result) => console.log(result))
            //     .catch((error) => console.error(error));
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
            // Initialize selectedOptions based on fetched data
            const initialSelectedOptions = data.reduce((acc, client) => {
                acc[client.id] = client?.approachDetails?.approachWay || null; // Use the client's pre-selected method or null
                return acc;
            }, {});
            const initialNotes = data.reduce((acc, client) => {
                acc[client.id] = client?.notes?.note || ''; // Initialize with existing notes or an empty string
                return acc;
            }, {});
            setClients(data);
            setSelectedOptions(initialSelectedOptions);
            setClientNotes(initialNotes);
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
    // Handle radio button click
    const handleOptionChange = (clientId, option) => {
        setSelectedOptions((prevSelectedOptions) => {
            // If the same option is clicked, unselect it
            if (prevSelectedOptions[clientId] === option) {
                updateOptionInDB(clientId, null); // Send null to clear the selection in the database
                return { ...prevSelectedOptions, [clientId]: null };
            }

            // Otherwise, select the new option
            updateOptionInDB(clientId, option); // Update the database with the new selection
            return { ...prevSelectedOptions, [clientId]: option };
        });
    };

    // Function to update the database
    const updateOptionInDB = async (clientId, option) => {
        try {
            const clientToUpdate = clients.find((client) => client.id === clientId);
            clientToUpdate.approachDetails ={
                approachWay: option,
                approached: option==null ? "False" : "True",
            }
            let data = JSON.stringify(clientToUpdate);
            // Axios PUT request configuration
            let config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: 'http://localhost:8080/api/v1/useeClient/',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: data,
            };

            // Make the request
            const response = await axios.request(config);
            console.log('Response from server:', response.data);
            // Update the clients state correctly
            setClients((prevClients) => {
                const updatedClients = prevClients.map((client) =>
                    client.id === clientId ? { ...client, approachDetails: clientToUpdate.approachDetails } : client
                );
                return updatedClients;
            });
        } catch (error) {
            console.error('Error updating contact method in the database:', error);
        }
    };
    // Handle local notes change
    const handleNotesChange = (clientId, note) => {
        setClientNotes((prevNotes) => ({ ...prevNotes, [clientId]: note }));
    };

// Save notes to the database
    const updateNotesInDB = async (clientId) => {
        try {
            const updatedClient = clients.find((client) => client.id === clientId);
            updatedClient.notes ={
                note:clientNotes[clientId]
            };  // Update notes in the client object
            let data = JSON.stringify(updatedClient);
            // Axios PUT request configuration
            let config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: 'http://localhost:8080/api/v1/useeClient/',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: data,
            };

            // Make the request
            const response = await axios.request(config);
            console.log('Response from server:', response.data);
            // Update the clients state correctly
            setClients((prevClients) => {
                const updatedClients = prevClients.map((client) =>
                    client.id === clientId ? { ...client, approachDetails: updatedClient.approachDetails } : client
                );
                return updatedClients;
            });
        } catch (error) {
            console.error('Error updating notes in the database:', error);
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
                                    {/* Client info */}
                                    <div className="client-info">
                                        <Link to={`/client/${client.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <strong style={{ color: '#007bff', textDecoration: 'underline' }}>{client.name}</strong>
                                        </Link>
                                        <span>
                                    - {client.useeClientLocation?.area}, {client.useeClientLocation?.zip}
                                </span>
                                    </div>

                                    {/* Radio buttons */}
                                    <div className="contact-options">
                                        <label>
                                            <input
                                                type="radio"
                                                name={`contact-${client.id}`}
                                                checked={selectedOptions[client.id] === 'DOOR2DOOR'}
                                                onClick={() => handleOptionChange(client.id, 'DOOR2DOOR')}
                                            />
                                            Door2Door
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`contact-${client.id}`}
                                                checked={selectedOptions[client.id] === 'EMAIL'}
                                                onClick={() => handleOptionChange(client.id, 'EMAIL')}
                                            />
                                            Email
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`contact-${client.id}`}
                                                checked={selectedOptions[client.id] === 'PHONE'}
                                                onClick={() => handleOptionChange(client.id, 'PHONE')}
                                            />
                                            Phone
                                        </label>
                                    </div>
                                    {/* Notes Section */}
                                    <div className="notes-section">
                                        <textarea
                                            value={clientNotes[client.id] || ''}
                                            onChange={(e) => handleNotesChange(client.id, e.target.value)}
                                            placeholder="Add notes here..."
                                        />
                                        <button
                                            onClick={() => updateNotesInDB(client.id)}
                                        >
                                            Save Notes
                                        </button>
                                    </div>
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
