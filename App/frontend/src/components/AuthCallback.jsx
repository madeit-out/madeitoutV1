// src/components/AuthCallback.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
            localStorage.setItem('token', token);
            navigate('/dashboard');
        } else {
            // Handle case where no token is received
            console.error("No token received from Google login.");
            navigate('/signin');
        }
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <p>Signing you in...</p>
        </div>
    );
};

export default AuthCallback;