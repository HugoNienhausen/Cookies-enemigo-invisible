// /app/page.tsx

"use client"; 

import React, { useState } from 'react';

// Estilos sencillos directamente en el componente para simplicidad
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '400px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: '10px',
        marginBottom: '20px',
        boxSizing: 'border-box',
        border: '1px solid #ddd',
        borderRadius: '4px',
    },
    button: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px 15px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '100%',
    },
    message: {
        marginTop: '20px',
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
    },
    success: {
        color: 'green',
    }
};


export default function HomePage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [messageType, setMessageType] = useState(''); // 'success' o 'error'

    const handleSubmit = async (e: React.FormEvent) => { // Usamos el tipo React.FormEvent de TypeScript
        e.preventDefault();
        setIsSending(true);
        setMessage('Enviando');
        setMessageType('');

        try {
            // Llama a la API Route
            const response = await fetch('/api/send-email', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setMessageType('success');
            } else {
                setMessage(`Error: ${data.message}`);
                setMessageType('error');
            }

        } catch (error) {
            console.error('Error de red:', error);
            setMessage('Ocurrió un error de conexión. Inténtalo de nuevo.');
            setMessageType('error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Cookies enemigo invisible</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Pon tu putisimo correo:</label>
                <input
                    type="email"
                    id="email"
                    placeholder="correo@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                />
                <button type="submit" disabled={isSending} style={styles.button}>
                    {isSending ? 'Grindando...' : 'Dame mi asignacion'}
                </button>
                <p style={{ ...styles.message, ...(messageType === 'error' ? styles.error : styles.success) }}>
                    {message}
                </p>
            </form>
        </div>
    );
}