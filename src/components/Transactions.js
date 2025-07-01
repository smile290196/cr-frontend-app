// src/components/Transactions.js
import React, { useState, useEffect, useCallback } from 'react'; // ADD useCallback here
import axios from 'axios';
import './Transactions.css'

const API_URL = 'http://192.168.5.185:5000';

function Transactions({ token, setMessage, setMessageType }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        repair_id: '',
        custom_build_id: '',
        user_id: '',
        transaction_date: '',
        amount: '',
        payment_method: '',
        status: 'Completed',
        notes: ''
    });
    const [editingTransactionId, setEditingTransactionId] = useState(null);

    // Wrap fetchTransactions in useCallback
    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setMessage('');
        setMessageType('');
        try {
            const res = await axios.get(`${API_URL}/transactions`, {
                headers: { 'x-auth-token': token },
            });
            setTransactions(res.data);
            setMessage('Transactions fetched successfully!');
            setMessageType('success');
        } catch (err) {
            console.error('Fetch transactions error:', err.response?.data || err.message);
            setMessage(err.response?.data?.msg || 'Failed to fetch transactions. Check console for details.');
            setMessageType('error');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [token, setMessage, setMessageType]); // Add token, setMessage, setMessageType as dependencies for useCallback

    useEffect(() => {
        if (token) {
            fetchTransactions();
        }
    }, [token, fetchTransactions]); // Add fetchTransactions to useEffect's dependency array

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddUpdateTransaction = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        try {
            const dataToSend = { ...formData };
            dataToSend.transaction_date = dataToSend.transaction_date ? new Date(dataToSend.transaction_date).toISOString() : new Date().toISOString();

            if (editingTransactionId) {
                await axios.put(`${API_URL}/transactions/${editingTransactionId}`, dataToSend, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Transaction updated successfully!');
            } else {
                await axios.post(`${API_URL}/transactions`, dataToSend, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Transaction added successfully!');
            }
            setMessageType('success');
            setFormData({
                repair_id: '', custom_build_id: '', user_id: '', transaction_date: '',
                amount: '', payment_method: '', status: 'Completed', notes: ''
            });
            setEditingTransactionId(null);
            fetchTransactions();
        } catch (err) {
            console.error('Transaction action error:', err.response?.data || err.message);
            setMessage(err.response?.data?.msg || 'Failed to perform transaction action. Check console.');
            setMessageType('error');
        }
    };

    const handleEditClick = (transaction) => {
        setFormData({
            repair_id: transaction.repair_id || '',
            custom_build_id: transaction.custom_build_id || '',
            user_id: transaction.user_id || '',
            transaction_date: transaction.transaction_date ? new Date(transaction.transaction_date).toISOString().split('T')[0] : '',
            amount: transaction.amount || '',
            payment_method: transaction.payment_method || '',
            status: transaction.status || 'Completed',
            notes: transaction.notes || ''
        });
        setEditingTransactionId(transaction.id);
    };

    const handleDeleteTransaction = async (id) => {
        setMessage('');
        setMessageType('');
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await axios.delete(`${API_URL}/transactions/${id}`, {
                    headers: { 'x-auth-token': token },
                });
                setMessage('Transaction deleted successfully!');
                setMessageType('success');
                fetchTransactions();
            } catch (err) {
                console.error('Delete transaction error:', err.response?.data || err.message);
                setMessage(err.response?.data?.msg || 'Failed to delete transaction. Check console.');
                setMessageType('error');
            }
        }
    };

    if (loading) return <p>Loading transactions...</p>;

    return (
        <div>
            <h2>{editingTransactionId ? 'Edit Transaction' : 'Add New Transaction'}</h2>
            <form onSubmit={handleAddUpdateTransaction}>
                <input type="number" name="repair_id" placeholder="Repair ID (optional)" value={formData.repair_id} onChange={handleFormChange} />
                <input type="number" name="custom_build_id" placeholder="Custom Build ID (optional)" value={formData.custom_build_id} onChange={handleFormChange} />
                <input type="number" name="user_id" placeholder="User ID" value={formData.user_id} onChange={handleFormChange} required />
                <label>Transaction Date: <input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleFormChange} /></label>
                <input type="number" name="amount" placeholder="Amount" value={formData.amount} onChange={handleFormChange} step="0.01" required />
                <input type="text" name="payment_method" placeholder="Payment Method" value={formData.payment_method} onChange={handleFormChange} required />
                <select name="status" value={formData.status} onChange={handleFormChange}>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Refunded">Refunded</option>
                </select>
                <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleFormChange} />
                <button type="submit">{editingTransactionId ? 'Update Transaction' : 'Add Transaction'}</button>
                {editingTransactionId && <button type="button" onClick={() => { setEditingTransactionId(null); setFormData({}); }}>Cancel Edit</button>}
            </form>

            <h2>Current Transactions</h2>
            <button onClick={fetchTransactions}>Refresh Transactions</button>
            {transactions.length > 0 ? (
                <ul>
                    {transactions.map((transaction) => (
                        <li key={transaction.id}>
                            <strong>Transaction ID: {transaction.id}</strong> - Amount: £{transaction.amount} - Method: {transaction.payment_method} - Status: {transaction.status}
                            <p>Date: {new Date(transaction.transaction_date).toLocaleDateString()} | User ID: {transaction.user_id}</p>
                            <button onClick={() => handleEditClick(transaction)}>Edit</button>
                            <button onClick={() => handleDeleteTransaction(transaction.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No transactions to display.</p>
            )}
        </div>
    );
}

export default Transactions;