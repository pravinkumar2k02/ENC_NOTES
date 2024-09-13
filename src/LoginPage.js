import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [userKey, setUserKey] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const apiKey = '################'; // Replace with your actual auth token
  // const apiKey = process.env.REACT_APP_AUTH_TOKEN; //use this if u are using env variables
  // const API_URL = 'http://localhost:5000';
  const API_URL = 'https://deeply-spectrum-cellar.glitch.me';
  useEffect(() => {
    // Set an interval to keep the server alive every 4 minutes (240000 ms)
    const keepAliveInterval = setInterval(() => {
      axios.get(`${API_URL}/keep-alive`, {
        headers: {
          'Authorization': `Bearer ${apiKey}` // Add API key to header
        }
      })
        .then(() => console.log('Keep-alive ping sent'))
        .catch((error) => console.error('Error sending keep-alive ping:', error));
    }, 240000); // 4 minutes

    // Clear interval on component unmount
    return () => clearInterval(keepAliveInterval);
  }, [apiKey]);

  const handleKeyChange = (e) => {
    setUserKey(e.target.value);
  };

  const validateUserKey = (key) => {
    const regex = /^[a-zA-Z0-9!@#$%^&*()_+=-]{6,12}$/;
    return regex.test(key);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUserKey(userKey)) {
      setMessage('User key must be 6 to 12 characters long and include letters, numbers, and special characters.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/decrypt`, { userKey }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}` // Add API key to header
        }
      });
      setMessage(response.data);
      console.log(response.data);
      if (response.data.success) {
        localStorage.setItem('userKey', userKey);
        navigate('/notes');

        // Check if decryption is successful and if the file is decrypted
        if (response.data.isDecrypted) {
          // Wait for 5 minutes (300000 ms) before encrypting again
          setTimeout(async () => {
            try {
              // Encrypt the file after 5 minutes
              await axios.post(`${API_URL}/encrypt`, { userKey }, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}` // Add API key to header
                }
              });
              console.log('File encrypted successfully after 10 minutes.');
              navigate('/');
              // Clear localStorage after encryption
              localStorage.clear();
              console.log('LocalStorage cleared.');

            } catch (error) {
              console.error('Error during encryption:', error);
              setMessage('Error during encryption.');
            }
          }, 300000); // 5 minutes in milliseconds
        }
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      setMessage('Error Decrypting data.');
    }
  };

  // Internal CSS styles
  const styles = {
    body: {
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #f1f1f1, #e1e1e1)',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 0,
      padding: 0,
    },
    container: {
      width: '100%',
      maxWidth: '400px',
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '10px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    },
    header: {
      color: '#333',
      marginBottom: '20px',
      textAlign: 'center',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    input: {
      padding: '12px',
      fontSize: '16px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      transition: 'border 0.3s',
    },
    inputFocus: {
      outline: 'none',
      borderColor: '#555',
    },
    button: {
      padding: '12px',
      backgroundColor: '#4CAF50',
      color: 'white',
      fontSize: '16px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    buttonHover: {
      backgroundColor: '#45a049',
    },
    message: {
      color: 'red',
      marginTop: '10px',
    },
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h1 style={styles.header}>Enter User Key</h1>
        <form style={styles.form} onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="text"
            value={userKey}
            onChange={handleKeyChange}
            placeholder="Enter your key"
            required
            onFocus={(e) => e.target.style.borderColor = styles.inputFocus.borderColor}
            onBlur={(e) => e.target.style.borderColor = styles.input.borderColor}
          />
          <button
            style={styles.button}
            type="submit"
            onMouseOver={(e) => e.target.style.backgroundColor = styles.buttonHover.backgroundColor}
            onMouseOut={(e) => e.target.style.backgroundColor = styles.button.backgroundColor}
          >
            Submit
          </button>
        </form>
        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
