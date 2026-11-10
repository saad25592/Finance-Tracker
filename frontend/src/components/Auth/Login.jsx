import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://saadspace.top/finacetracker-api/auth/login', formData);
      
      localStorage.setItem('access_token', response.data.access_token);
      alert('Login Successful!');
      navigate('/'); 
    } catch (error) {
      alert('Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2>Login to Finance Tracker</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required style={{ padding: '10px' }} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={{ padding: '10px' }} />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#008CBA', color: 'white', border: 'none', cursor: 'pointer' }}>Login</button>
      </form>
      <p style={{ marginTop: '20px' }}>Don't have an account? <Link to="/signup">Sign up here</Link></p>
    </div>
  );
}