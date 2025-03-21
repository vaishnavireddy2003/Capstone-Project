import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import './signup.css'; 

const SignUp = () => {
    const [name, setName] = useState(''); //Stores the user’s entered name
    const [email, setEmail] = useState(''); //Stores the user’s entered email
    const [password, setPassword] = useState(''); //Stores the user’s entered password
    const navigate = useNavigate();

    //Handling User Registration
    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:4000/users', {
                name,
                email,
                password,
                role: 'employee'
            });
            navigate('/login'); //redirect users to login page after successful registration
        } catch (error) {
            console.error('Error signing up:', error);
        }
    };

    return (
        <div className="signup-container">
        <div className="signup-box">
        <h2>Sign Up</h2>
        <form onSubmit={handleSignUp}>
          <div className="input-container">
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="input-container">
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-container">
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="signup-btn">Sign Up</button>
          
        </form>
      </div>
    </div>

    );
};

export default SignUp;
