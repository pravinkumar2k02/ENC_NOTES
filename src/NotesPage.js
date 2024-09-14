import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NotesPage.css';
import debounce from 'lodash.debounce';
import { IoMdAdd } from 'react-icons/io';
import { SiLetsencrypt } from 'react-icons/si';
import DOMPurify from 'dompurify';

 
// const API_URL = 'http://localhost:5000'; // Ensure this is HTTPS

const NotesPage = () => {
  const [notes, setNotes] = useState({});
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [isNewNote, setIsNewNote] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, title: '' });
  const [userKey, setUserKey] = useState(sessionStorage.getItem('userKey') || ''); // Use session storage for user key
  const [fullScreenNote, setFullScreenNote] = useState(null);

  useEffect(() => {
    // Axios interceptor to add token to request headers
    axios.interceptors.request.use(
      config => {
        const token = process.env.REACT_APP_AUTH_TOKEN;
        // const token = 'ffdr4eFD5rcgfhREE344e4e';
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Fetch notes from the API
    axios.get(`${process.env.REACT_APP_APIURL}/notes`)
      .then(response => {
        setNotes(response.data);
      })
      .catch(error => {
        console.error('Error fetching notes:', error);
      });
  }, []);

  const handleAddNote = () => {
    setNewTitle('');
    setNewBody('');
    setIsNewNote(true);
    setFullScreenNote(''); // Open a blank full-screen note for adding
  };

  const handleSaveNewNote = () => {
    if (newTitle.trim() && newBody.trim()) {
      const updatedNotes = { ...notes, [newTitle]: newBody };
      setNotes(updatedNotes);
      setNewTitle('');
      setNewBody('');
      setIsNewNote(false);
      setFullScreenNote(null); // Close full-screen note
      handleSaveToBackend(updatedNotes);
    } else {
      alert('Title and Body are required.');
    }
  };

  const handleSaveToBackend = debounce((updatedNotes) => {
    axios.post(`${process.env.REACT_APP_APIURL}/save_notes`, { notes: updatedNotes })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error saving notes:', error);
      });
  }, 1000);

  const handleCardClick = (title) => {
    setFullScreenNote(title); // Open the full-screen note view
  };

  const handleEditChange = (e, field, title) => {
    const updatedNotes = { ...notes };
    if (field === 'title') {
      const oldBody = updatedNotes[title]; // Get the old body for the note
      delete updatedNotes[title]; // Remove the old title entry
      updatedNotes[DOMPurify.sanitize(e.target.value)] = oldBody; // Sanitize input
      setFullScreenNote(DOMPurify.sanitize(e.target.value)); // Update full-screen note title
    } else if (field === 'body') {
      updatedNotes[title] = DOMPurify.sanitize(e.target.value); // Sanitize input
    }
    setNotes(updatedNotes);
    handleSaveToBackend(updatedNotes);
  };

  const handleRightClick = (e, title) => {
    e.preventDefault();
    if (!title) return; // Ensure valid title
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, title });
  };

  const handleEncryptNotes = () => {
    axios.post(`${process.env.REACT_APP_APIURL}/encrypt`, { userKey })
      .then(response => {
        sessionStorage.clear(); // Clear session storage instead of local storage
        window.location.href = '/';
      })
      .catch(error => {
        console.error('Error encrypting notes:', error);
      });
  };

  const handleDeleteNote = (title) => {
    const updatedNotes = { ...notes };
    delete updatedNotes[title];
    setNotes(updatedNotes);
    handleSaveToBackend(updatedNotes);
    setContextMenu({ visible: false, x: 0, y: 0, title: '' });
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest('.context-menu') && !e.target.closest('.note-card')) {
      setContextMenu({ visible: false, x: 0, y: 0, title: '' });
    }
  };

  const handleCloseFullScreen = () => {
    if (isNewNote) {
      setIsNewNote(false); // Close the new note creation mode
      setNewTitle('');
      setNewBody('');
    } else {
      setFullScreenNote(null); // Close the full-screen view for an existing note
    }
  };

  return (
    <div className="notes-page" onClick={handleOutsideClick}>
      {(fullScreenNote !== null || isNewNote) && (
        <div className="full-screen-note">
          <button className="back-button" onClick={handleCloseFullScreen}>Back</button>
          {isNewNote && (
              <button className="save-button" onClick={handleSaveNewNote}>Save</button>
            )}
          <div className="note-card">
            <input
              type="text"
              value={isNewNote ? newTitle : fullScreenNote}
              onChange={(e) => {
                if (isNewNote) {
                  setNewTitle(DOMPurify.sanitize(e.target.value)); // Sanitize input
                } else {
                  handleEditChange(e, 'title', fullScreenNote);
                }
              }}
              placeholder={isNewNote ? 'Title' : ''}
            />
            <textarea
              value={isNewNote ? newBody : notes[fullScreenNote]}
              onChange={(e) => {
                if (isNewNote) {
                  setNewBody(DOMPurify.sanitize(e.target.value)); // Sanitize input
                } else {
                  handleEditChange(e, 'body', fullScreenNote);
                }
              }}
              placeholder={isNewNote ? 'Body' : ''}
            ></textarea>
            {/* {isNewNote && (
              <button className="save-button" onClick={handleSaveNewNote}>Save</button>
            )} */}
          </div>
        </div>
      )}
      {!fullScreenNote && !isNewNote && (
        <>
          <div className="container">
            <IoMdAdd onClick={handleAddNote} className="add-icon" size={40} />
            <div className="encrypt-section">
              <input
                type="text"
                placeholder="key length 8 - 16"
                value={userKey}
                onChange={(e) => setUserKey(DOMPurify.sanitize(e.target.value))} // Sanitize input
              />
              <SiLetsencrypt onClick={handleEncryptNotes} className="add-icon" size={32} />
            </div>
          </div>
          <div className="notes-container">
            {Object.entries(notes).map(([title, body]) => (
              <div
                key={title}
                className="note-card"
                onClick={() => handleCardClick(title)}
                onContextMenu={(e) => handleRightClick(e, title)}
              >
                <h3 dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(title) }}></h3>
                <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }}></p>
              </div>
            ))}
          </div>
          {contextMenu.visible && (
            <div
              className="context-menu"
              style={{ top: contextMenu.y, left: contextMenu.x }}
            >
              <button onClick={() => handleDeleteNote(contextMenu.title)}>Delete</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotesPage;
