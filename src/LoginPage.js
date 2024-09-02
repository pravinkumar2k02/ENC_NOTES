import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate(); // Replace useHistory with useNavigate

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleEncryptionKeyChange = (e) => {
    setEncryptionKey(e.target.value);
  };

  const handleLogin = () => {
    fetch('/notes.json')
      .then(response => response.json())
      .then(data => {
        if (data[username] !== undefined) {
          localStorage.setItem('username', username);
          localStorage.setItem('encryptionKey', encryptionKey);
          navigate('/notes'); // Use navigate instead of history.push
        } else {
          alert('Username does not exist. Please register.');
        }
      });
  };

  const handleRegister = () => {
    fetch('/notes.json')
      .then(response => response.json())
      .then(data => {
        if (data[username]) {
          alert('Username already exists!');
        } else {
          // For demonstration, storing registration in local storage.
          // In a real application, you'd POST this data to a server.
          localStorage.setItem('username', username);
          localStorage.setItem('encryptionKey', encryptionKey);
          localStorage.setItem('userNotes', JSON.stringify({}));
          alert('Registration successful. You can now log in.');
          setIsRegistering(false);
        }
      });
  };

  return (
    <div>
      <h1>{isRegistering ? 'Register' : 'Login'}</h1>
      <input
        type="text"
        value={username}
        onChange={handleUsernameChange}
        placeholder="Username"
      />
      <input
        type="text"
        value={encryptionKey}
        onChange={handleEncryptionKeyChange}
        placeholder="Encryption Key"
      />
      <button onClick={isRegistering ? handleRegister : handleLogin}>
        {isRegistering ? 'Register' : 'Login'}
      </button>
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Go to Login' : 'Register'}
      </button>
    </div>
  );
}

export default LoginPage;
