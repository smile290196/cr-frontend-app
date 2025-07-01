// src/components/Quotes.js
import React, { useState, useEffect, useCallback } from 'react'; // ADD useCallback here
import axios from 'axios';
import './Quotes.css';

const API_URL = 'http://192.168.5.185:5000'; // Your backend URL

function Quotes({ token, setMessage, setMessageType }) {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customer_id: '',
        bike_id: '',
        description: '',
        estimated_cost: '',
        status: 'Pending',
        created_date: '',
        expiry_date: '',
        notes: ''
    });
    const [editingQuoteId, setEditingQuoteId] = useState(null);

    // Wrap fetchQuotes in useCallback
    const fetchQuotes = useCallback(async () => {
        setLoading(true);
        setMessage('');
        setMessageType('');
        try {
            const res = await axios.get(`${API_URL}/quotes`, {
                headers: { 'x-auth-token': token },
            });
            setQuotes(res.data);
            setMessage('Quotes fetched successfully!');
            setMessageType('success');
        } catch (err) {
            console.error('Fetch quotes error:', err.response?.data || err.message);
            setMessage(err.response?.data?.msg || 'Failed to fetch quotes. Check console for details.');
            setMessageType('error');
            setQuotes([]);
        } finally {
            setLoading(false);
        }
    }, [token, setMessage, setMessageType]); // Add token, setMessage, setMessageType as dependencies for useCallback

    useEffect(() => {
        if (token) {
            fetchQuotes();
        }
    }, [token, fetchQuotes]); // Add fetchQuotes to useEffect's dependency array

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddUpdateQuote = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        try {
            const dataToSend = { ...formData };
            dataToSend.created_date = dataToSend.created_date ? new Date(dataToSend.created_date).toISOString() : null;
            dataToSend.expiry_date = dataToSend.expiry_date ? new Date(dataToSend.expiry_date).toISOString() : null;

            if (editingQuoteId) {
                await axios.put(`${API_URL}/quotes/${editingQuoteId}`, dataToSend, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Quote updated successfully!');
            } else {
                await axios.post(`${API_URL}/quotes`, dataToSend, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Quote added successfully!');
            }
            setMessageType('success');
            setFormData({
                customer_id: '', bike_id: '', description: '', estimated_cost: '',
                status: 'Pending', created_date: '', expiry_date: '', notes: ''
            });
            setEditingQuoteId(null);
            fetchQuotes();
        } catch (err) {
            console.error('Quote action error:', err.response?.data || err.message);
            setMessage(err.response?.data?.msg || 'Failed to perform quote action. Check console.');
            setMessageType('error');
        }
    };

    const handleEditClick = (quote) => {
        setFormData({
            customer_id: quote.customer_id || '',
            bike_id: quote.bike_id || '',
            description: quote.description || '',
            estimated_cost: quote.estimated_cost || '',
            status: quote.status || 'Pending',
            created_date: quote.created_date ? new Date(quote.created_date).toISOString().split('T')[0] : '',
            expiry_date: quote.expiry_date ? new Date(quote.expiry_date).toISOString().split('T')[0] : '',
            notes: quote.notes || ''
        });
        setEditingQuoteId(quote.id);
    };

    const handleDeleteQuote = async (id) => {
        setMessage('');
        setMessageType('');
        if (window.confirm('Are you sure you want to delete this quote?')) {
            try {
                await axios.delete(`${API_URL}/quotes/${id}`, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Quote deleted successfully!');
                setMessageType('success');
                fetchQuotes();
            } catch (err) {
                console.error('Delete quote error:', err.response?.data || err.message);
                setMessage(err.response?.data?.msg || 'Failed to delete quote. Check console.');
                setMessageType('error');
            }
        }
    };

    if (loading) return <p>Loading quotes...</p>;

    return (
        <div>
            <h2>{editingQuoteId ? 'Edit Quote' : 'Add New Quote'}</h2>
            <form onSubmit={handleAddUpdateQuote}>
                <input type="number" name="customer_id" placeholder="Customer ID" value={formData.customer_id} onChange={handleFormChange} required />
                <input type="number" name="bike_id" placeholder="Bike ID" value={formData.bike_id} onChange={handleFormChange} required />
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleFormChange} required />
                <input type="number" name="estimated_cost" placeholder="Estimated Cost" value={formData.estimated_cost} onChange={handleFormChange} step="0.01" required />
                <select name="status" value={formData.status} onChange={handleFormChange}>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Converted to Build/Repair">Converted to Build/Repair</option>
                </select>
                <label>Created Date: <input type="date" name="created_date" value={formData.created_date} onChange={handleFormChange} /></label>
                <label>Expiry Date: <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleFormChange} /></label>
                <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleFormChange} />
                <button type="submit">{editingQuoteId ? 'Update Quote' : 'Add Quote'}</button>
                {editingQuoteId && <button type="button" onClick={() => { setEditingQuoteId(null); setFormData({}); }}>Cancel Edit</button>}
            </form>

            <h2>Current Quotes</h2>
            <button onClick={fetchQuotes}>Refresh Quotes</button>
            {quotes.length > 0 ? (
                <ul>
                    {quotes.map((quote) => (
                        <li key={quote.id}>
                            <strong>Quote ID: {quote.id}</strong> - Customer ID: {quote.customer_id}, Bike ID: {quote.bike_id} - Est. Cost: £{quote.estimated_cost} - Status: {quote.status}
                            <p>Description: {quote.description}</p>
                            <button onClick={() => handleEditClick(quote)}>Edit</button>
                            <button onClick={() => handleDeleteQuote(quote.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No quotes to display.</p>
            )}
        </div>
    );
}

export default Quotes;