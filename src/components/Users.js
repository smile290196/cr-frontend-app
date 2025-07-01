// src/components/Users.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Users.css';

const API_URL = 'http://192.168.5.185:5000'; // Your backend URL

function Users({ token, setMessage, setMessageType }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '', // Only for new user creation
        first_name: '',
        last_name: '',
        role: 'customer' // Default role
    });
    const [editingUserId, setEditingUserId] = useState(null);

    // useCallback for fetchUsers to prevent re-creation on every render
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setMessage('');
        setMessageType('');
        try {
            const res = await axios.get(`${API_URL}/users`, {
                headers: { 'x-auth-token': token },
            });
            setUsers(res.data);
            setMessage('Users fetched successfully!');
            setMessageType('success');
        } catch (err) {
            console.error('Fetch users error:', err.response?.data || err.message);
            setMessage(err.response?.data?.msg || 'Failed to fetch users.');
            setMessageType('error');
            setUsers([]); // Clear users on error
        } finally {
            setLoading(false);
        }
    }, [token, setMessage, setMessageType]); // Dependencies for useCallback

    // useEffect to call fetchUsers when component mounts or token changes
    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token, fetchUsers]); // Dependencies for useEffect

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddUpdateUser = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');
        try {
            if (editingUserId) {
                // For update, password should not be sent if not changed
                const updateData = { ...formData };
                if (!updateData.password) {
                    delete updateData.password; // Don't send empty password
                }
                await axios.put(`${API_URL}/users/${editingUserId}`, updateData, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('User updated successfully!');
            } else {
                await axios.post(`${API_URL}/users`, formData, { // For new user, password is required
                    headers: { 'x-auth-token': token }, // Admin can create users
                });
                setMessage('User added successfully!');
            }
            setMessageType('success');
            // Reset form and editing state
            setFormData({ username: '', email: '', password: '', first_name: '', last_name: '', role: 'customer' });
            setEditingUserId(null);
            fetchUsers(); // Re-fetch users to update the list
        } catch (err) {
            console.error('User action error:', err.response?.data || err.message);
            setMessage(err.response?.data?.msg || 'Failed to perform user action.');
            setMessageType('error');
        }
    };

    const handleEditClick = (user) => {
        setFormData({
            username: user.username || '',
            email: user.email || '',
            password: '', // Do NOT pre-fill password for security
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            role: user.role || 'customer'
        });
        setEditingUserId(user.id);
    };

    const handleDeleteUser = async (id) => {
        setMessage('');
        setMessageType('');
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`${API_URL}/users/${id}`, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('User deleted successfully!');
                setMessageType('success');
                fetchUsers(); // Re-fetch users to update the list
            } catch (err) {
                console.error('Delete user error:', err.response?.data || err.message);
                setMessage(err.response?.data?.msg || 'Failed to delete user.');
                setMessageType('error');
            }
        }
    };

    if (loading) return <p>Loading users...</p>;

    return (
        <div>
            <h2>{editingUserId ? 'Edit User' : 'Add New User'}</h2>
            <form onSubmit={handleAddUpdateUser}>
                <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleFormChange} required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleFormChange} required />
                {!editingUserId && ( // Only show password field for new user creation
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleFormChange} required />
                )}
                {editingUserId && ( // Optional: if editing, allow changing password
                    <input type="password" name="password" placeholder="New Password (leave blank to keep current)" value={formData.password} onChange={handleFormChange} />
                )}
                <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleFormChange} />
                <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleFormChange} />
                <select name="role" value={formData.role} onChange={handleFormChange}>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="submit">{editingUserId ? 'Update User' : 'Add User'}</button>
                {editingUserId && (
                    <button type="button" onClick={() => { setEditingUserId(null); setFormData({ username: '', email: '', password: '', first_name: '', last_name: '', role: 'customer' }); }}>
                        Cancel Edit
                    </button>
                )}
            </form>

            <h2>Current Users</h2>
            <button onClick={fetchUsers}>Refresh Users</button>
            {users.length > 0 ? (
                <ul>
                    {users.map((user) => (
                        <li key={user.id}>
                            <strong>{user.username}</strong> ({user.email}) - {user.role}
                            <button onClick={() => handleEditClick(user)}>Edit</button>
                            <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No users to display.</p>
            )}
        </div>
    );
}

export default Users;