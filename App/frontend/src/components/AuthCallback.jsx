// src/components/AuthCallback.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthAPI } from '../adapters/apiAdapter';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
            console.error("No code received from Google login.");
            navigate('/signin');
            return;
        }

        AuthAPI.exchangeCode(code)
            .then(() => navigate('/dashboard'))
            .catch((err) => {
                console.error("Failed to exchange Google login code:", err);
                navigate('/signin');
            });
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <p>Signing you in...</p>
        </div>
    );
};

export default AuthCallback;