import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './ClientDetailPage.css';

const baseUrl = 'http://localhost:8080';

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
            <p><strong>Area:</strong> {client.useeClientLocation?.area}</p>
            <p><strong>ZIP Code:</strong> {client.useeClientLocation?.zip}</p>
            <p><strong>Email:</strong> {client.emails && client.emails.length > 0
                ? client.emails
                : "N/A"}</p>
            <p><strong>Phone:</strong> {client.phone || 'N/A'}</p>
            <p><strong>Type:</strong> {client.type || 'N/A'}</p>
            <p><strong>Category:</strong> {client.category || 'N/A'}</p>
            <p><strong>Notes:</strong> {client.notes || 'N/A'}</p>
            <p><strong>Approach Details:</strong> {client.approachDetails || 'N/A'}</p>
            <Link to="/" className="back-link">Back to Client List</Link>
        </div>
        </div>
    );
};

export default ClientDetailPage;
