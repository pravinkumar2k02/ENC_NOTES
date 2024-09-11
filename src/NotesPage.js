import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NotesPage.css';
import debounce from 'lodash.debounce';
import { IoMdAdd } from 'react-icons/io';
import { SiLetsencrypt } from 'react-icons/si';

const NotesPage = () => {
  const [notes, setNotes] = useState({});
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [isNewNote, setIsNewNote] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, title: '' });
  const [userKey, setUserKey] = useState(localStorage.getItem('userKey') || '');
  const [fullScreenNote, setFullScreenNote] = useState(null);

  useEffect(() => {
    axios.get('https://deeply-spectrum-cellar.glitch.me/notes')
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
      alert("Title and Body are required.");
    }
  };

  const handleSaveToBackend = debounce((updatedNotes) => {
    axios.post('https://deeply-spectrum-cellar.glitch.me/save_notes', { notes: updatedNotes })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error saving notes:', error);
      });
  }, 1000);

  const handleCardClick = (title) => {
    setFullScreenNote(title); // Open the full screen note view
  };

  const handleEditChange = (e, field, title) => {
    const updatedNotes = { ...notes };
    if (field === 'title') {
      const oldBody = updatedNotes[title]; // Get the old body for the note
      delete updatedNotes[title]; // Remove the old title entry
      updatedNotes[e.target.value] = oldBody; // Add new title with the old body
      setFullScreenNote(e.target.value); // Update full-screen note title
    } else if (field === 'body') {
      updatedNotes[title] = e.target.value; // Update body content
    }
    setNotes(updatedNotes);
    handleSaveToBackend(updatedNotes);
  };

  const handleRightClick = (e, title) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, title });
  };

  const handleEncryptNotes = () => {
    axios.post('https://deeply-spectrum-cellar.glitch.me/encrypt', { userKey })
      .then(response => {
        localStorage.clear();
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
          <div className="note-card">
            <input
              type="text"
              value={isNewNote ? newTitle : fullScreenNote}
              onChange={(e) => {
                if (isNewNote) {
                  setNewTitle(e.target.value);
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
                  setNewBody(e.target.value);
                } else {
                  handleEditChange(e, 'body', fullScreenNote);
                }
              }}
              placeholder={isNewNote ? 'Body' : ''}
            ></textarea>
            {isNewNote && (
              <button className="save-button" onClick={handleSaveNewNote}>Save</button>
            )}
          </div>
        </div>
      )}
      {!fullScreenNote && !isNewNote && (
        <>
          <div className="container">
            <IoMdAdd onClick={handleAddNote} className="add-icon" disabled={!userKey} size={40} />
            <div className="encrypt-section">
              <input
                type="text"
                placeholder="User Key"
                value={userKey}
                onChange={(e) => setUserKey(e.target.value)}
              />
              <SiLetsencrypt onClick={handleEncryptNotes} className="add-icon" disabled={!userKey} size={32} />
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
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
          {contextMenu.visible && (
            <div
              className="context-menu"
              style={{ top: contextMenu.y, left: contextMenu.x }}
            >
              <button onClick={() => handleDeleteNote(contextMenu.title)} disabled={!userKey}>Delete</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotesPage;
