import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // এখানে আপনার Render এর লাইভ URL দিতে পারেন যদি আলাদা থাকে
      await axios.post('https://saadspace.top/finacetracker-api/auth/signup', formData);
      alert('Signup Successful! Please Login.');
      navigate('/login');
    } catch (error) {
      alert('Signup failed. Please try again.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2>Sign Up for Finance Tracker</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input type="text" name="name" placeholder="Your Business/Full Name" onChange={handleChange} required style={{ padding: '10px' }} />
        <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required style={{ padding: '10px' }} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={{ padding: '10px' }} />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>Sign Up</button>
      </form>
      <p style={{ marginTop: '20px' }}>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
}