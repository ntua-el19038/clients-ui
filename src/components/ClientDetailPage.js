import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './ClientDetailPage.css';
import { format } from 'date-fns';

const baseUrl = 'http://localhost:8080';
// Format approach time in a readable format
const formatApproachTime = (approachTime) => {
    if (!approachTime) return 'N/A';

    try {
        // Assuming approachTime is a string in ISO 8601 format (e.g., '2024-11-16T13:45:00.000Z')
        const date = new Date(approachTime);
        // Format it as 'MMMM dd, yyyy hh:mm a' (e.g., 'November 16, 2024 01:45 PM')
        return format(date, 'MMMM dd, yyyy hh:mm a');
    } catch (error) {
        console.error('Invalid approach time format', error);
        return 'N/A';
    }
};
const ClientDetailPage = () => {
    const { id } = useParams();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedApproachWay, setSelectedApproachWay] = useState(null);
    const [clientNotes, setClientNotes] = useState({}); // Track notes for each client

    useEffect(() => {
        const fetchClientDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${baseUrl}/api/v1/useeClient/${id}`);
                const clientData = response.data["returnobject"];
                const initialNotes = response.data["returnobject"]?.notes?.note;
                setClientNotes(initialNotes);
                setClient(clientData);
                setSelectedApproachWay(clientData?.approachDetails?.approachWay || null);
            } catch (error) {
                console.error('Error fetching client details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchClientDetails();
    }, [id]);

    // Handle change in approach way selection
    const handleApproachWayChange = async (newApproachWay) => {
        setSelectedApproachWay((prevSelectedOptions) => {
            // If the same option is clicked, unselect it
            if (prevSelectedOptions === newApproachWay) {
                updateOptionInDB(null);
                return null;
            }

            // Otherwise, select the new option
            updateOptionInDB(newApproachWay);
            return newApproachWay;
        });

    };
    // Function to update the database
    const updateOptionInDB = async (option) => {
        try {
            const clientToUpdate = client
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
            console.log('Response from server:', response.data["returnobject"]);
            // clientToUpdate.approachDetails =response.data["returnobject"]?.approachDetails;
            setClient(response.data["returnobject"]);
            // Re-fetch client details to update the UI
            // Reset the client state to force fetching fresh data
        } catch (error) {
            console.error('Error updating approach way:', error);
        }
    };
    // Handle local notes change
    const handleNotesChange = (note) => {
        setClientNotes((prevNotes) => note );
    };

// Save notes to the database
    const updateNotesInDB = async (id) => {
        try {
            const updatedClient = client
            updatedClient.notes ={
                note:clientNotes
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
            setClient(response.data["returnobject"]);
        } catch (error) {
            console.error('Error updating notes in the database:', error);
        }
    };
    if (loading) return <div>Loading...</div>;
    if (!client) return <div>Client not found</div>;

    return (
        <div className="client-list-page">
            <div className="client-detail-container">
                <h2>{client?.name}</h2>
                <p><strong>Type:</strong> {client?.type || 'None'}</p>
                <p>
                    <strong>Address:</strong> {client.useeClientLocation?.street + " " + client.useeClientLocation?.number + " " + client.useeClientLocation?.area + " " + client.useeClientLocation?.zip}
                </p>
                <p><strong>Phone:</strong> {client?.phone || 'N/A'}</p>
                <p><strong>Email:</strong> {client?.emails?.length > 0 ? client.emails.join(', ') : "N/A"}</p>
                <p>{/* Notes Section */}
                    <strong>Notes:</strong>
                    <div className="notes-section">
                                        <textarea
                                            value={clientNotes || ''}
                                            onChange={(e) => handleNotesChange(e.target.value)}
                                            placeholder="Add notes here..."
                                        />
                        <button
                            onClick={() => updateNotesInDB(client.id)}
                        >
                            Save Notes
                        </button>
                    </div></p>

                <p><strong>Approach Details:</strong></p>
                <ul>
                    <li>
                        <strong>Approach Way:</strong>
                        <div className="contact-options">
                            <label>
                                <input
                                    type="radio"
                                    name="approachWay"
                                    value="DOOR2DOOR"
                                    checked={selectedApproachWay === 'DOOR2DOOR'}
                                    onClick={() => handleApproachWayChange('DOOR2DOOR')}
                                />
                                Door2Door
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="approachWay"
                                    value="EMAIL"
                                    checked={selectedApproachWay === 'EMAIL'}
                                    onClick={() => handleApproachWayChange('EMAIL')}
                                />
                                Email
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="approachWay"
                                    value="PHONE"
                                    checked={selectedApproachWay === 'PHONE'}
                                    onClick={() => handleApproachWayChange('PHONE')}
                                />
                                Phone
                            </label>
                        </div>
                    </li>
                    <li><strong>Approached:</strong> {client.approachDetails?.approached===true ? "Yes" : "No"}</li>
                    <li><strong>User ID:</strong> {client.approachDetails?.userID || 'None'}</li>
                    <li><strong>Approach Time:</strong> {formatApproachTime(client.approachDetails?.approachTime) || 'None'}</li>
                </ul>
                <Link to="/" className="back-link">Back to Client List</Link>
            </div>
        </div>
    );

};

export default ClientDetailPage;
