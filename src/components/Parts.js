// src/components/Parts.js
import React, { useState, useEffect, useCallback } from 'react'; // ADD useCallback here
import axios from 'axios';
import './Parts.css';

const API_URL = 'http://192.168.5.185:5000'; // Your backend URL

function Parts({ token, setMessage, setMessageType }) {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        manufacturer: '',
        part_number: '',
        price: '',
        stock_quantity: '',
        supplier: '',
        category: '',
        compatible_bike_types: ''
    });
    const [editingPartId, setEditingPartId] = useState(null);

    // Wrap fetchParts in useCallback
    const fetchParts = useCallback(async () => {
        setLoading(true);
        setMessage('');
        setMessageType('');
        try {
            const res = await axios.get(`${API_URL}/parts`, {
                headers: { 'x-auth-token': token },
            });
            setParts(res.data);
            setMessage('Parts fetched successfully!');
            setMessageType('success');
        } catch (err) {
            console.error('Fetch parts error:', err.response?.data || err.message);
            setMessage(err.response?.data?.msg || 'Failed to fetch parts. Check console for details.');
            setMessageType('error');
            setParts([]);
        } finally {
            setLoading(false);
        }
    }, [token, setMessage, setMessageType]); // Add token, setMessage, setMessageType as dependencies for useCallback

    useEffect(() => {
        if (token) {
            fetchParts();
        }
    }, [token, fetchParts]); // Add fetchParts to useEffect's dependency array

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddUpdatePart = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        const dataToSend = { ...formData };
        if (typeof dataToSend.compatible_bike_types === 'string') {
            dataToSend.compatible_bike_types = dataToSend.compatible_bike_types.split(',').map(item => item.trim());
        }

        try {
            if (editingPartId) {
                await axios.put(`${API_URL}/parts/${editingPartId}`, dataToSend, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Part updated successfully!');
            } else {
                await axios.post(`${API_URL}/parts`, dataToSend, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Part added successfully!');
            }
            setMessageType('success');
            setFormData({
                name: '', description: '', manufacturer: '', part_number: '', price: '',
                stock_quantity: '', supplier: '', category: '', compatible_bike_types: ''
            });
            setEditingPartId(null);
            fetchParts();
        } catch (err) {
            console.error('Part action error:', err.response?.data || err.message);
            setMessage(err.response?.data?.msg || 'Failed to perform part action. Check console.');
            setMessageType('error');
        }
    };

    const handleEditClick = (part) => {
        setFormData({
            name: part.name || '',
            description: part.description || '',
            manufacturer: part.manufacturer || '',
            part_number: part.part_number || '',
            price: part.price || '',
            stock_quantity: part.stock_quantity || '',
            supplier: part.supplier || '',
            category: part.category || '',
            compatible_bike_types: Array.isArray(part.compatible_bike_types) ? part.compatible_bike_types.join(', ') : part.compatible_bike_types || ''
        });
        setEditingPartId(part.id);
    };

    const handleDeletePart = async (id) => {
        setMessage('');
        setMessageType('');
        if (window.confirm('Are you sure you want to delete this part?')) {
            try {
                await axios.delete(`${API_URL}/parts/${id}`, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Part deleted successfully!');
                setMessageType('success');
                fetchParts();
            } catch (err) {
                console.error('Delete part error:', err.response?.data || err.message);
                setMessage(err.response?.data?.msg || 'Failed to delete part. Check console.');
                setMessageType('error');
            }
        }
    };

    if (loading) return <p>Loading parts...</p>;

    return (
        <div>
            <h2>{editingPartId ? 'Edit Part' : 'Add New Part'}</h2>
            <form onSubmit={handleAddUpdatePart}>
                <input type="text" name="name" placeholder="Part Name" value={formData.name} onChange={handleFormChange} required />
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleFormChange} />
                <input type="text" name="manufacturer" placeholder="Manufacturer" value={formData.manufacturer} onChange={handleFormChange} />
                <input type="text" name="part_number" placeholder="Part Number" value={formData.part_number} onChange={handleFormChange} />
                <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleFormChange} step="0.01" required />
                <input type="number" name="stock_quantity" placeholder="Stock Quantity" value={formData.stock_quantity} onChange={handleFormChange} required />
                <input type="text" name="supplier" placeholder="Supplier" value={formData.supplier} onChange={handleFormChange} />
                <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleFormChange} />
                <input type="text" name="compatible_bike_types" placeholder="Compatible Bike Types (comma-separated)" value={formData.compatible_bike_types} onChange={handleFormChange} />
                <button type="submit">{editingPartId ? 'Update Part' : 'Add Part'}</button>
                {editingPartId && <button type="button" onClick={() => { setEditingPartId(null); setFormData({}); }}>Cancel Edit</button>}
            </form>

            <h2>Current Parts</h2>
            <button onClick={fetchParts}>Refresh Parts</button>
            {parts.length > 0 ? (
                <ul>
                    {parts.map((part) => (
                        <li key={part.id}>
                            <strong>{part.name}</strong> ({part.manufacturer}, P/N: {part.part_number}) - Price: £{part.price} - Stock: {part.stock_quantity}
                            <p>Category: {part.category} - Compatible: {Array.isArray(part.compatible_bike_types) ? part.compatible_bike_types.join(', ') : part.compatible_bike_types}</p>
                            <button onClick={() => handleEditClick(part)}>Edit</button>
                            <button onClick={() => handleDeletePart(part.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No parts to display.</p>
            )}
        </div>
    );
}

export default Parts;