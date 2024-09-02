import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

function NotesPage() {
  const [notes, setNotes] = useState({});
  const [branch, setBranch] = useState('');
  const [note, setNote] = useState('');
  const [branchNotes, setBranchNotes] = useState([]);

  const username = localStorage.getItem('username');
  const encryptionKey = localStorage.getItem('encryptionKey');

  useEffect(() => {
    fetch('/notes')
      .then(response => response.json())
      .then(data => {
        if (data[username]) {
          setNotes(data[username]);
        }
      });
  }, [username]);

  const handleBranchChange = (e) => {
    setBranch(e.target.value);
    if (notes[branch]) {
      const decryptedNotes = notes[branch].map(encryptedNote => {
        const bytes = CryptoJS.AES.decrypt(encryptedNote, encryptionKey);
        return bytes.toString(CryptoJS.enc.Utf8);
      });
      setBranchNotes(decryptedNotes);
    } else {
      setBranchNotes([]);
    }
  };

  const handleNoteChange = (index, newContent) => {
    const updatedNotes = [...branchNotes];
    updatedNotes[index] = newContent;
    setBranchNotes(updatedNotes);

    // Encrypt notes and send to the server
    const encryptedNotes = updatedNotes.map(note => CryptoJS.AES.encrypt(note, encryptionKey).toString());
    fetch('/update-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        branch,
        notes: encryptedNotes,
        encryptionKey
      })
    })
      .then(response => response.text())
      .then(message => console.log(message))
      .catch(error => console.error('Error:', error));
  };

  return (
    <div>
      <h1>Notes Page</h1>
      <input
        type="text"
        value={branch}
        onChange={handleBranchChange}
        placeholder="Enter branch"
      />
      <ul>
        {branchNotes.map((note, index) => (
          <li key={index}>
            <textarea
              value={note}
              onChange={(e) => handleNoteChange(index, e.target.value)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotesPage;