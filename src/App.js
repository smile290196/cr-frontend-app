// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// No need for 'RouterProvider' alias if only using BrowserRouter in index.js
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Users from './components/Users';
import Bikes from './components/Bikes';
import Repairs from './components/Repairs';
import Parts from './components/Parts';
import Quotes from './components/Quotes';
import CustomBuilds from './components/CustomBuilds';
import Transactions from './components/Transactions';
import CustomBuildComponents from './components/CustomBuildComponents';
import './App.css';

// In a central config file (e.g., src/config.js or similar)
const API_URL = process.env.REACT_APP_API_URL;
export { API_URL };
// If you want to use a different API URL, you can set it in your .env file
// e.g., REACT_APP_API_URL=http://
function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate(); // This is now correctly within the Router context

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const handleLogout = useCallback(() => {
        setToken(null);
        setCurrentUser(null);
        localStorage.removeItem('token');
        setMessage('You have been logged out.');
        setMessageType('success');
        navigate('/login');
    }, [navigate, setMessage, setMessageType]);

    const fetchCurrentUser = useCallback(async () => {
        if (!token) {
            setCurrentUser(null);
            return;
        }
        try {
            const res = await axios.get(`${API_URL}/auth`, {
                headers: { 'x-auth-token': token },
            });
            setCurrentUser(res.data);
        } catch (err) {
            console.error('Failed to fetch current user:', err.response?.data || err.message);
            setCurrentUser(null);
            setMessage(err.response?.data?.msg || 'Failed to fetch user details.');
            setMessageType('error');
            if (err.response && err.response.status === 401) {
                handleLogout();
            }
        }
    }, [token, setMessage, setMessageType, handleLogout]);

    useEffect(() => {
        fetchCurrentUser();
    }, [token, fetchCurrentUser]);

    const registerUser = async (username, email, password, firstName, lastName, role) => {
        setMessage('');
        setMessageType('');
        try {
            const res = await axios.post(`${API_URL}/users`, {
                username,
                email,
                password,
                first_name: firstName,
                last_name: lastName,
                role
            });
            setMessage(res.data.msg || 'Registration successful!');
            setMessageType('success');
        } catch (err) {
            console.error('Registration error:', err.response?.data || err.message);
            setMessage(err.response?.data?.msg || 'Registration failed.');
            setMessageType('error');
        }
    };

   // And now, update the loginUser function itself:
const loginUser = async (username, password) => { // CHANGE 4: Accept username as parameter
    setMessage('');
    setMessageType('');
    try {
        // CHANGE 5: Send username in the request body
        const res = await axios.post(`${API_URL}/auth`, { username, password }); 
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        setMessage('Login successful!');
        setMessageType('success');
        navigate('/');
    } catch (err) {
        console.error('Login error:', err.response?.data || err.message);
        setMessage(err.response?.data?.msg || 'Login failed. Invalid credentials.');
        setMessageType('error');
    }
};

    return (
        <div className="App">
            <header className="App-header">
                <h1>Cycle Repair Management</h1>
                <nav>
                    <Link to="/">Home</Link>
                    {!token ? (
                        <>
                            <Link to="/register">Register</Link>
                            <Link to="/login">Login</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/users">Users</Link>
                            <Link to="/bikes">Bikes</Link>
                            <Link to="/repairs">Repairs</Link>
                            <Link to="/parts">Parts</Link>
                            <Link to="/quotes">Quotes</Link>
                            <Link to="/custom-builds">Custom Builds</Link>
                            <Link to="/transactions">Transactions</Link>
                            <Link to="/custom-build-components">Build Components</Link>
                            <button onClick={handleLogout}>Logout</button>
                        </>
                    )}
                </nav>
            </header>

            {message && (
                <div className={`message ${messageType}`}>
                    {message}
                </div>
            )}

            <main className="App-main">
                <Routes>
                    <Route path="/" element={
                        <div>
                            <h2>Welcome!</h2>
                            {currentUser ? (
                                <p>Logged in as: {currentUser.username} ({currentUser.email}) - Role: {currentUser.role}</p>
                            ) : (
                                <p>Please register or login to manage your cycle repair shop.</p>
                            )}
                        </div>
                    } />
                    <Route path="/register" element={
                        <div>
                            <h2>Register</h2>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const username = e.target.username.value;
                                const email = e.target.email.value;
                                const password = e.target.password.value;
                                const firstName = e.target.firstName.value;
                                const lastName = e.target.lastName.value;
                                const role = e.target.role ? e.target.role.value : 'customer';
                                registerUser(username, email, password, firstName, lastName, role);
                            }}>
                                <input type="text" name="username" placeholder="Username" required />
                                <input type="email" name="email" placeholder="Email" required />
                                <input type="password" name="password" placeholder="Password" required />
                                <input type="text" name="firstName" placeholder="First Name" />
                                <input type="text" name="lastName" placeholder="Last Name" />
                                <button type="submit">Register</button>
                            </form>
                        </div>
                    } />
                    <Route path="/login" element={
                        <div>
                            <h2>Login</h2>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                // CHANGE 1: Get username from the input field
                                const username = e.target.username.value; 
                                const password = e.target.password.value;
                                // CHANGE 2: Call loginUser with username
                                loginUser(username, password); 
                            }}>
                                {/* CHANGE 3: Update input type, name, and placeholder for username */}
                                <input type="text" name="username" placeholder="Username" required /> 
                                <input type="password" name="password" placeholder="Password" required />
                                <button type="submit">Login</button>
                            </form>
                        </div>
                    } />
                    {token && (
                        <>
                            <Route path="/users" element={<Users token={token} setMessage={setMessage} setMessageType={setMessageType} />} />
                            <Route path="/bikes" element={<Bikes token={token} setMessage={setMessage} setMessageType={setMessageType} />} />
                            <Route path="/repairs" element={<Repairs token={token} setMessage={setMessage} setMessageType={setMessageType} />} />
                            <Route path="/parts" element={<Parts token={token} setMessage={setMessage} setMessageType={setMessageType} />} />
                            <Route path="/quotes" element={<Quotes token={token} setMessage={setMessage} setMessageType={setMessageType} />} />
                            <Route path="/custom-builds" element={<CustomBuilds token={token} setMessage={setMessage} setMessageType={setMessageType} />} />
                            <Route path="/transactions" element={<Transactions token={token} setMessage={setMessage} setMessageType={setMessageType} />} />
                            <Route path="/custom-build-components" element={<CustomBuildComponents token={token} setMessage={setMessage} setMessageType={setMessageType} />} />
                        </>
                    )}
                </Routes>
            </main>
        </div>
    );
}

export default App;