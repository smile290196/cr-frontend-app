// src/components/CustomBuildComponents.js
import React, { useState, useEffect, useCallback } from 'react'; // ADD useCallback here
import axios from 'axios';
import './CustomBuildComponents.css';

//const API_URL = 'http://192.168.5.185:5000';
// In a central config file (e.g., src/config.js or similar)
const API_URL = process.env.REACT_APP_API_URL;
export { API_URL };

function CustomBuildComponents({ token, setMessage, setMessageType }) {
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        custom_build_id: '',
        part_id: '',
        component_name: '',
        chosen_part_name: '',
        quantity: '',
        unit_price: ''
    });
    const [editingComponentId, setEditingComponentId] = useState(null);

    // Wrap fetchComponents in useCallback
    const fetchComponents = useCallback(async () => {
        setLoading(true);
        setMessage('');
        setMessageType('');
        try {
            const res = await axios.get(`${API_URL}/custom_build_components`, {
                headers: { 'x-auth-token': token },
            });
            setComponents(res.data);
            setMessage('Custom build components fetched successfully!');
            setMessageType('success');
        } catch (err) {
            console.error('Fetch custom build components error:', err.response?.data || err.message);
            setMessage(err.response?.data?.msg || 'Failed to fetch custom build components. Check console for details.');
            setMessageType('error');
            setComponents([]);
        } finally {
            setLoading(false);
        }
    }, [token, setMessage, setMessageType]); // Add token, setMessage, setMessageType as dependencies for useCallback

    useEffect(() => {
        if (token) {
            fetchComponents();
        }
    }, [token, fetchComponents]); // Add fetchComponents to useEffect's dependency array

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddUpdateComponent = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        try {
            if (editingComponentId) {
                await axios.put(`${API_URL}/custom_build_components/${editingComponentId}`, formData, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Custom build component updated successfully!');
            } else {
                await axios.post(`${API_URL}/custom_build_components`, formData, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Custom build component added successfully!');
            }
            setMessageType('success');
            setFormData({
                custom_build_id: '', part_id: '', component_name: '', chosen_part_name: '',
                quantity: '', unit_price: ''
            });
            setEditingComponentId(null);
            fetchComponents();
        } catch (err) {
            console.error('Custom build component action error:', err.response?.data || err.message);
            setMessage(err.response?.data?.msg || 'Failed to perform custom build component action. Check console.');
            setMessageType('error');
        }
    };

    const handleEditClick = (component) => {
        setFormData({
            custom_build_id: component.custom_build_id || '',
            part_id: component.part_id || '',
            component_name: component.component_name || '',
            chosen_part_name: component.chosen_part_name || '',
            quantity: component.quantity || '',
            unit_price: component.unit_price || ''
        });
        setEditingComponentId(component.id);
    };

    const handleDeleteComponent = async (id) => {
        setMessage('');
        setMessageType('');
        if (window.confirm('Are you sure you want to delete this custom build component?')) {
            try {
                await axios.delete(`${API_URL}/custom_build_components/${id}`, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Custom build component deleted successfully!');
                setMessageType('success');
                fetchComponents();
            } catch (err) {
                console.error('Delete custom build component error:', err.response?.data || err.message);
                setMessage(err.response?.data?.msg || 'Failed to delete custom build component. Check console.');
                setMessageType('error');
            }
        }
    };

    if (loading) return <p>Loading custom build components...</p>;

    return (
        <div>
            <h2>{editingComponentId ? 'Edit Custom Build Component' : 'Add New Custom Build Component'}</h2>
            <form onSubmit={handleAddUpdateComponent}>
                <input type="number" name="custom_build_id" placeholder="Custom Build ID" value={formData.custom_build_id} onChange={handleFormChange} required />
                <input type="number" name="part_id" placeholder="Part ID (optional)" value={formData.part_id} onChange={handleFormChange} />
                <input type="text" name="component_name" placeholder="Component Name (e.g., 'Frame', 'Wheelset')" value={formData.component_name} onChange={handleFormChange} required />
                <input type="text" name="chosen_part_name" placeholder="Chosen Part Name (e.g., 'Shimano 105')" value={formData.chosen_part_name} onChange={handleFormChange} />
                <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleFormChange} required />
                <input type="number" name="unit_price" placeholder="Unit Price" value={formData.unit_price} onChange={handleFormChange} step="0.01" required />
                <button type="submit">{editingComponentId ? 'Update Component' : 'Add Component'}</button>
                {editingComponentId && <button type="button" onClick={() => { setEditingComponentId(null); setFormData({}); }}>Cancel Edit</button>}
            </form>

            <h2>Current Custom Build Components</h2>
            <button onClick={fetchComponents}>Refresh Components</button>
            {components.length > 0 ? (
                <ul>
                    {components.map((component) => (
                        <li key={component.id}>
                            <strong>{component.component_name}</strong> - Build ID: {component.custom_build_id}, Part ID: {component.part_id}
                            <p>Chosen: {component.chosen_part_name} | Qty: {component.quantity} | Unit Price: £{component.unit_price}</p>
                            <button onClick={() => handleEditClick(component)}>Edit</button>
                            <button onClick={() => handleDeleteComponent(component.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No custom build components to display.</p>
            )}
        </div>
    );
}

export default CustomBuildComponents;