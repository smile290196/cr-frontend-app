// src/components/CustomBuilds.js
import React, { useState, useEffect, useCallback } from 'react'; // ADD useCallback here
import axios from 'axios';
import './CustomBuilds.css';

const API_URL = 'http://192.168.5.185:5000';

function CustomBuilds({ token, setMessage, setMessageType }) {
    const [customBuilds, setCustomBuilds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customer_id: '',
        bike_id: '',
        build_name: '',
        description: '',
        estimated_cost: '',
        final_cost: '',
        status: 'Pending',
        start_date: '',
        completion_date: '',
        notes: ''
    });
    const [editingBuildId, setEditingBuildId] = useState(null);

    // Wrap fetchCustomBuilds in useCallback
    const fetchCustomBuilds = useCallback(async () => {
        setLoading(true);
        setMessage('');
        setMessageType('');
        try {
            const res = await axios.get(`${API_URL}/custom_builds`, {
                headers: { 'x-auth-token': token },
            });
            setCustomBuilds(res.data);
            setMessage('Custom builds fetched successfully!');
            setMessageType('success');
        } catch (err) {
            console.error('Fetch custom builds error:', err.response?.data || err.message);
            setMessage(err.response?.data?.msg || 'Failed to fetch custom builds. Check console for details.');
            setMessageType('error');
            setCustomBuilds([]);
        } finally {
            setLoading(false);
        }
    }, [token, setMessage, setMessageType]); // Add token, setMessage, setMessageType as dependencies for useCallback

    useEffect(() => {
        if (token) {
            fetchCustomBuilds();
        }
    }, [token, fetchCustomBuilds]); // Add fetchCustomBuilds to useEffect's dependency array

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddUpdateBuild = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        try {
            const dataToSend = { ...formData };
            dataToSend.start_date = dataToSend.start_date ? new Date(dataToSend.start_date).toISOString() : null;
            dataToSend.completion_date = dataToSend.completion_date ? new Date(dataToSend.completion_date).toISOString() : null;

            if (editingBuildId) {
                await axios.put(`${API_URL}/custom_builds/${editingBuildId}`, dataToSend, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Custom build updated successfully!');
            } else {
                await axios.post(`${API_URL}/custom_builds`, dataToSend, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Custom build added successfully!');
            }
            setMessageType('success');
            setFormData({
                customer_id: '', bike_id: '', build_name: '', description: '', estimated_cost: '',
                final_cost: '', status: 'Pending', start_date: '', completion_date: '', notes: ''
            });
            setEditingBuildId(null);
            fetchCustomBuilds();
        } catch (err) {
            console.error('Custom build action error:', err.response?.data || err.message);
            setMessage(err.response?.data?.msg || 'Failed to perform custom build action. Check console.');
            setMessageType('error');
        }
    };

    const handleEditClick = (build) => {
        setFormData({
            customer_id: build.customer_id || '',
            bike_id: build.bike_id || '',
            build_name: build.build_name || '',
            description: build.description || '',
            estimated_cost: build.estimated_cost || '',
            final_cost: build.final_cost || '',
            status: build.status || 'Pending',
            start_date: build.start_date ? new Date(build.start_date).toISOString().split('T')[0] : '',
            completion_date: build.completion_date ? new Date(build.completion_date).toISOString().split('T')[0] : '',
            notes: build.notes || ''
        });
        setEditingBuildId(build.id);
    };

    const handleDeleteBuild = async (id) => {
        setMessage('');
        setMessageType('');
        if (window.confirm('Are you sure you want to delete this custom build?')) {
            try {
                await axios.delete(`${API_URL}/custom_builds/${id}`, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Custom build deleted successfully!');
                setMessageType('success');
                fetchCustomBuilds();
            } catch (err) {
                console.error('Delete custom build error:', err.response?.data || err.message);
                setMessage(err.response?.data?.msg || 'Failed to delete custom build. Check console.');
                setMessageType('error');
            }
        }
    };

    if (loading) return <p>Loading custom builds...</p>;

    return (
        <div>
            <h2>{editingBuildId ? 'Edit Custom Build' : 'Add New Custom Build'}</h2>
            <form onSubmit={handleAddUpdateBuild}>
                <input type="number" name="customer_id" placeholder="Customer ID" value={formData.customer_id} onChange={handleFormChange} required />
                <input type="number" name="bike_id" placeholder="Bike ID" value={formData.bike_id} onChange={handleFormChange} required />
                <input type="text" name="build_name" placeholder="Build Name" value={formData.build_name} onChange={handleFormChange} required />
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleFormChange} />
                <input type="number" name="estimated_cost" placeholder="Estimated Cost" value={formData.estimated_cost} onChange={handleFormChange} step="0.01" />
                <input type="number" name="final_cost" placeholder="Final Cost" value={formData.final_cost} onChange={handleFormChange} step="0.01" />
                <select name="status" value={formData.status} onChange={handleFormChange}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <label>Start Date: <input type="date" name="start_date" value={formData.start_date} onChange={handleFormChange} /></label>
                <label>Completion Date: <input type="date" name="completion_date" value={formData.completion_date} onChange={handleFormChange} /></label>
                <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleFormChange} />
                <button type="submit">{editingBuildId ? 'Update Custom Build' : 'Add Custom Build'}</button>
                {editingBuildId && <button type="button" onClick={() => { setEditingBuildId(null); setFormData({}); }}>Cancel Edit</button>}
            </form>

            <h2>Current Custom Builds</h2>
            <button onClick={fetchCustomBuilds}>Refresh Custom Builds</button>
            {customBuilds.length > 0 ? (
                <ul>
                    {customBuilds.map((build) => (
                        <li key={build.id}>
                            <strong>{build.build_name}</strong> (ID: {build.id}) - Customer ID: {build.customer_id}, Bike ID: {build.bike_id} - Status: {build.status}
                            <p>Est. Cost: £{build.estimated_cost} | Final Cost: £{build.final_cost}</p>
                            <button onClick={() => handleEditClick(build)}>Edit</button>
                            <button onClick={() => handleDeleteBuild(build.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No custom builds to display.</p>
            )}
        </div>
    );
}

export default CustomBuilds;