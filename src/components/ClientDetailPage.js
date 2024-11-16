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

    useEffect(() => {
        const fetchClientDetails = async () => {
            try {
                const response = await axios.get(`${baseUrl}/api/v1/useeClient/${id}`);
                setClient(response.data["returnobject"]);
            } catch (error) {
                console.error('Error fetching client details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClientDetails();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!client) return <div>Client not found</div>;

    return (
        <div className="client-list-page">
            <div className="client-detail-container">
                <h2>{client.name}</h2>
                <p><strong>Type:</strong> {client.type || 'N/A'}</p>
                <p>
                    <strong>Adress:</strong> {client.useeClientLocation?.street + " " + client.useeClientLocation?.number + " " + client.useeClientLocation?.area + " " + client.useeClientLocation?.zip}
                </p>
                {/*<p><strong>ZIP Code:</strong> {client.useeClientLocation?.zip}</p>*/}
                <p><strong>Phone:</strong> {client.phone || 'N/A'}</p>
                <p><strong>Email:</strong> {client.emails && client.emails.length > 0
                    ? client.emails
                    : "N/A"}</p>

                {/*<p><strong>Category:</strong> {client.category || 'N/A'}</p>*/}
                <p><strong>Notes:</strong> {client.notes.note || 'N/A'}</p>
                <p><strong>Approach Details:</strong></p>
                <ul>
                    <li><strong>Approach Way:</strong> {client.approachDetails?.approachWay || 'N/A'}</li>
                    <li><strong>Approached:</strong> {client.approachDetails?.approached ? "Yes": "No"}</li>
                    <li><strong>User ID:</strong> {client.approachDetails?.userID || 'N/A'}</li>
                    <li>
                        <strong>Approach Time:</strong> {formatApproachTime(client.approachDetails?.approachTime)}
                    </li>
                </ul>
                <Link to="/" className="back-link">Back to Client List</Link>
            </div>
        </div>
    );
};

export default ClientDetailPage;
