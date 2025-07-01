// src/components/Bikes.js
import React, { useState, useEffect, useCallback } from 'react'; // ADD useCallback here
import axios from 'axios';
import './Bikes.css';

const API_URL = 'http://192.168.5.185:5000';

function Bikes({ token, setMessage, setMessageType }) {
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        user_id: '',
        make: '',
        model: '',
        year: '',
        frame_number: '',
        color: '',
        bike_type: '',
        notes: ''
    });
    const [editingBikeId, setEditingBikeId] = useState(null);

    // Wrap fetchBikes in useCallback
    const fetchBikes = useCallback(async () => {
        setLoading(true);
        setMessage('');
        setMessageType('');
        try {
            const res = await axios.get(`${API_URL}/bikes`, {
                headers: { 'x-auth-token': token },
            });
            setBikes(res.data);
            setMessage('Bikes fetched successfully!');
            setMessageType('success');
        } catch (err) {
            console.error('Fetch bikes error:', err.response?.data || err.message);
            setMessage(err.response?.data?.msg || 'Failed to fetch bikes.');
            setMessageType('error');
            setBikes([]);
        } finally {
            setLoading(false);
        }
    }, [token, setMessage, setMessageType]); // Add token, setMessage, setMessageType as dependencies for useCallback

    useEffect(() => {
        if (token) {
            fetchBikes();
        }
    }, [token, fetchBikes]); // Add fetchBikes to useEffect's dependency array

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddUpdateBike = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');
        try {
            if (editingBikeId) {
                await axios.put(`${API_URL}/bikes/${editingBikeId}`, formData, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Bike updated successfully!');
            } else {
                await axios.post(`${API_URL}/bikes`, formData, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Bike added successfully!');
            }
            setMessageType('success');
            setFormData({ user_id: '', make: '', model: '', year: '', frame_number: '', color: '', bike_type: '', notes: '' });
            setEditingBikeId(null);
            fetchBikes();
        } catch (err) {
            console.error('Bike action error:', err.response?.data || err.message);
            setMessage(err.response?.data?.msg || 'Failed to perform bike action.');
            setMessageType('error');
        }
    };

    const handleEditClick = (bike) => {
        setFormData({
            user_id: bike.user_id || '',
            make: bike.make || '',
            model: bike.model || '',
            year: bike.year || '',
            frame_number: bike.frame_number || '',
            color: bike.color || '',
            bike_type: bike.bike_type || '',
            notes: bike.notes || ''
        });
        setEditingBikeId(bike.id);
    };

    const handleDeleteBike = async (id) => {
        setMessage('');
        setMessageType('');
        if (window.confirm('Are you sure you want to delete this bike?')) {
            try {
                await axios.delete(`${API_URL}/bikes/${id}`, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Bike deleted successfully!');
                setMessageType('success');
                fetchBikes();
            } catch (err) {
                console.error('Delete bike error:', err.response?.data || err.message);
                setMessage(err.response?.data?.msg || 'Failed to delete bike.');
                setMessageType('error');
            }
        }
    };

    if (loading) return <p>Loading bikes...</p>;

    return (
        <div>
            <h2>{editingBikeId ? 'Edit Bike' : 'Add New Bike'}</h2>
            <form onSubmit={handleAddUpdateBike}>
                <input type="number" name="user_id" placeholder="User ID" value={formData.user_id} onChange={handleFormChange} required />
                <input type="text" name="make" placeholder="Make" value={formData.make} onChange={handleFormChange} required />
                <input type="text" name="model" placeholder="Model" value={formData.model} onChange={handleFormChange} required />
                <input type="number" name="year" placeholder="Year" value={formData.year} onChange={handleFormChange} />
                <input type="text" name="frame_number" placeholder="Frame Number" value={formData.frame_number} onChange={handleFormChange} required />
                <input type="text" name="color" placeholder="Color" value={formData.color} onChange={handleFormChange} />
                <input type="text" name="bike_type" placeholder="Bike Type" value={formData.bike_type} onChange={handleFormChange} />
                <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleFormChange} />
                <button type="submit">{editingBikeId ? 'Update Bike' : 'Add Bike'}</button>
                {editingBikeId && <button type="button" onClick={() => { setEditingBikeId(null); setFormData({}); }}>Cancel Edit</button>}
            </form>

            <h2>Current Bikes</h2>
            <button onClick={fetchBikes}>Refresh Bikes</button>
            {bikes.length > 0 ? (
                <ul>
                    {bikes.map((bike) => (
                        <li key={bike.id}>
                            <strong>{bike.make} {bike.model}</strong> (Frame: {bike.frame_number}) - User ID: {bike.user_id}
                            <button onClick={() => handleEditClick(bike)}>Edit</button>
                            <button onClick={() => handleDeleteBike(bike.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No bikes to display.</p>
            )}
        </div>
    );
}

export default Bikes;