import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons

function LoginPage() {
  const [userKey, setUserKey] = useState('');
  const [message, setMessage] = useState('');
  const [isKeyVisible, setIsKeyVisible] = useState(false); // State to toggle key visibility
  const navigate = useNavigate();
  
  // Use environment variables securely for the auth token
  const apiKey = process.env.REACT_APP_AUTH_TOKEN; 

  useEffect(() => {
    // Set an interval to keep the server alive every 4 minutes (240000 ms)
    const keepAliveInterval = setInterval(() => {
      axios.get(`${process.env.REACT_APP_APIURL}/keep-alive`, {
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

  // Input change handler with sanitization
  const handleKeyChange = (e) => {
    const sanitizedInput = e.target.value.replace(/[<>]/g, ''); // Remove dangerous characters
    setUserKey(sanitizedInput);
  };

  // Validate user key (server-side validation will also be required)
  const validateUserKey = (key) => {
    const regex = /^[a-zA-Z0-9!@#$%^&*()_+=-]{8,16}$/;
    return regex.test(key);
  };

  // Securely handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUserKey(userKey)) {
      setMessage('User key must be 8 to 16 characters long and include letters, numbers, and special characters.');
      return;
    }

    try {
      // Use HTTPS for communication and sanitize inputs
      const response = await axios.post(`${process.env.REACT_APP_APIURL}/decrypt`, { userKey: userKey.trim() }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}` // Add API key to header
        }
      });
      setMessage(response.data.message);
      if (response.data.success) {
        // Store userKey in sessionStorage (less persistent than localStorage)
        sessionStorage.setItem('userKey', userKey);

        // Redirect to notes page upon successful login
        navigate('/notes');

        if (response.data.isDecrypted) {
          // Encrypt the file after 5 minutes for added security
          setTimeout(async () => {
            try {
              await axios.post(`${process.env.REACT_APP_APIURL}/encrypt`, { userKey: userKey.trim() }, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`
                }
              });
              console.log('File encrypted successfully after 5 minutes.');
              navigate('/');
              sessionStorage.clear(); // Clear userKey from session storage
            } catch (error) {
              console.error('Error during encryption:', error);
              setMessage('Error during encryption.');
            }
          }, 300000); // 5 minutes in milliseconds
        }
      }
    } catch (error) {
      // Avoid exposing sensitive error details to users
      console.error('Error:', error.response ? error.response.data : error.message);
      setMessage('An error occurred. Please try again.');
    }
  };

  // Toggle password visibility
  const toggleKeyVisibility = () => {
    setIsKeyVisible(!isKeyVisible);
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
    inputWrapper: {
      position: 'relative',
    },
    input: {
      padding: '12px',
      fontSize: '16px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      transition: 'border 0.3s',
      width: '100%',
      boxSizing: 'border-box', 
      maxWidth: '300px', 
    },
    inputFocus: {
      outline: 'none',
      borderColor: '#555',
    },
    eyeIcon: {
      position: 'absolute',
      top: '50%',
      right: '10px',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
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
          <div style={styles.inputWrapper}>
            <input
              style={styles.input}
              type={isKeyVisible ? 'text' : 'password'} // Toggle between text and password
              value={userKey}
              onChange={handleKeyChange}
              placeholder="key length 8 - 16"
              required
              onFocus={(e) => e.target.style.borderColor = styles.inputFocus.borderColor}
              onBlur={(e) => e.target.style.borderColor = styles.input.borderColor}
            />
            <span style={styles.eyeIcon} onClick={toggleKeyVisibility}>
              {isKeyVisible ? <FaEyeSlash /> : <FaEye />} {/* Toggle icons */}
            </span>
          </div>
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
