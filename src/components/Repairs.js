// src/components/Repairs.js
import React, { useState, useEffect, useCallback } from 'react'; // ADD useCallback here
import axios from 'axios';
import './Repairs.css';

//const API_URL = 'http://192.168.5.185:5000';
// In a central config file (e.g., src/config.js or similar)
const API_URL = process.env.REACT_APP_API_URL;
export { API_URL };

function Repairs({ token, setMessage, setMessageType }) {
    const [repairs, setRepairs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        bike_make: '',
        bike_model: '',
        issue_description: '',
        status: 'Pending',
        estimated_cost: '',
        notes: ''
    });
    const [editingRepairId, setEditingRepairId] = useState(null);

    // Wrap fetchRepairs in useCallback
    const fetchRepairs = useCallback(async () => {
        setLoading(true);
        setMessage('');
        setMessageType('');
        try {
            const res = await axios.get(`${API_URL}/repairs`, {
                headers: { 'x-auth-token': token },
            });
            setRepairs(res.data);
            setMessage('Repairs fetched successfully!');
            setMessageType('success');
        } catch (err) {
            console.error('Fetch repairs error:', err.response?.data || err.message);
            setMessage(err.response?.data?.msg || 'Failed to fetch repairs. Check console for details.');
            setMessageType('error');
            setRepairs([]);
        } finally {
            setLoading(false);
        }
    }, [token, setMessage, setMessageType]); // Add token, setMessage, setMessageType as dependencies for useCallback

    useEffect(() => {
        if (token) {
            fetchRepairs();
        }
    }, [token, fetchRepairs]); // Add fetchRepairs to useEffect's dependency array

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddUpdateRepair = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        try {
            if (editingRepairId) {
                await axios.put(`${API_URL}/repairs/${editingRepairId}`, formData, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Repair updated successfully!');
            } else {
                await axios.post(`${API_URL}/repairs`, formData, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Repair added successfully!');
            }
            setMessageType('success');
            setFormData({
                customer_name: '', customer_email: '', customer_phone: '', bike_make: '',
                bike_model: '', issue_description: '', status: 'Pending', estimated_cost: '', notes: ''
            });
            setEditingRepairId(null);
            fetchRepairs();
        } catch (err) {
            console.error('Repair action error:', err.response?.data || err.message);
            setMessage(err.response?.data?.msg || 'Failed to perform repair action. Check console.');
            setMessageType('error');
        }
    };

    const handleEditClick = (repair) => {
        setFormData({
            customer_name: repair.customer_name || '',
            customer_email: repair.customer_email || '',
            customer_phone: repair.customer_phone || '',
            bike_make: repair.bike_make || '',
            bike_model: repair.bike_model || '',
            issue_description: repair.issue_description || '',
            status: repair.status || 'Pending',
            estimated_cost: repair.estimated_cost || '',
            notes: repair.notes || ''
        });
        setEditingRepairId(repair.id);
    };

    const handleDeleteRepair = async (id) => {
        setMessage('');
        setMessageType('');
        if (window.confirm('Are you sure you want to delete this repair?')) {
            try {
                await axios.delete(`${API_URL}/repairs/${id}`, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Repair deleted successfully!');
                setMessageType('success');
                fetchRepairs();
            } catch (err) {
                console.error('Delete repair error:', err.response?.data || err.message);
                setMessage(err.response?.data?.msg || 'Failed to delete repair. Check console.');
                setMessageType('error');
            }
        }
    };

    if (loading) return <p>Loading repairs...</p>;

    return (
        <div>
            <h2>{editingRepairId ? 'Edit Repair' : 'Add New Repair'}</h2>
            <form onSubmit={handleAddUpdateRepair}>
                <input type="text" name="customer_name" placeholder="Customer Name" value={formData.customer_name} onChange={handleFormChange} required />
                <input type="email" name="customer_email" placeholder="Customer Email" value={formData.customer_email} onChange={handleFormChange} />
                <input type="text" name="customer_phone" placeholder="Customer Phone" value={formData.customer_phone} onChange={handleFormChange} />
                <input type="text" name="bike_make" placeholder="Bike Make" value={formData.bike_make} onChange={handleFormChange} required />
                <input type="text" name="bike_model" placeholder="Bike Model" value={formData.bike_model} onChange={handleFormChange} required />
                <textarea name="issue_description" placeholder="Issue Description" value={formData.issue_description} onChange={handleFormChange} required />
                <select name="status" value={formData.status} onChange={handleFormChange}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <input type="number" name="estimated_cost" placeholder="Estimated Cost" value={formData.estimated_cost} onChange={handleFormChange} step="0.01" />
                <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleFormChange} />
                <button type="submit">{editingRepairId ? 'Update Repair' : 'Add Repair'}</button>
                {editingRepairId && <button type="button" onClick={() => { setEditingRepairId(null); setFormData({}); }}>Cancel Edit</button>}
            </form>

            <h2>Current Repairs</h2>
            <button onClick={fetchRepairs}>Refresh Repairs</button>
            {repairs.length > 0 ? (
                <ul>
                    {repairs.map((repair) => (
                        <li key={repair.id}>
                            <strong>{repair.customer_name}</strong> - {repair.bike_make} {repair.bike_model} ({repair.status}) - Est. Cost: £{repair.estimated_cost}
                            <p>Issue: {repair.issue_description}</p>
                            <button onClick={() => handleEditClick(repair)}>Edit</button>
                            <button onClick={() => handleDeleteRepair(repair.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No repairs to display.</p>
            )}
        </div>
    );
}

export default Repairs;