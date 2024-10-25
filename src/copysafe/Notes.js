// src/components/Notes.js
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { FaTrash, FaShareAlt, FaEdit } from "react-icons/fa";
import AiAssistant from './AiAssistant'; // Import the AI assistant component
Modal.setAppElement("#root");

const customModalStyle = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '80%', // Set width to 80% of the screen
    maxHeight: '80%', // Limit max height of modal
    padding: '20px', // Add padding for better spacing
    overflow: 'hidden', // Hide overflow to prevent scrollbars
  },
};

const Notes = ({ user }) => {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [email, setEmail] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [viewSharedNoteModalIsOpen, setViewSharedNoteModalIsOpen] = useState(false); // State for viewing shared note
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [currentNoteLink, setCurrentNoteLink] = useState("");
  const [shareSuccess, setShareSuccess] = useState(false);
  
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [viewSharedNoteTitle, setViewSharedNoteTitle] = useState(""); // State for viewing shared note title
  const [viewSharedNoteContent, setViewSharedNoteContent] = useState(""); // State for viewing shared note content

  const navigate = useNavigate();

  const fetchNotes = async () => {
    const q = query(collection(db, "notes"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const notesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setNotes(notesData);
  };

  const fetchSharedNotes = async () => {
    const q = query(collection(db, "sharedNotes"), where("sharedWith", "==", user.email));
    const querySnapshot = await getDocs(q);

    const sharedNotesData = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const noteId = docSnapshot.data().noteId;
        const noteRef = doc(db, "notes", noteId);
        const noteData = await getDoc(noteRef);

        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
          content: noteData.exists() ? noteData.data().content : "Note not found",
          title: noteData.exists() ? noteData.data().title : "Note not found", // Include title for shared notes
        };
      })
    );

    setSharedNotes(sharedNotesData);
  };

  useEffect(() => {
    fetchNotes();
    fetchSharedNotes();
  }, [fetchNotes, fetchSharedNotes]);

  const addNote = async () => {
    if (title.trim() === "" || note.trim() === "") return;

    await addDoc(collection(db, "notes"), {
      title: title,
      content: note,
      uid: user.uid,
      createdAt: new Date(),
    });
    setTitle("");
    setNote("");
    fetchNotes();
  };

  const shareNote = (id) => {
    const shareableLink = `${window.location.origin}/note/${id}`;
    setCurrentNoteLink(shareableLink);
    setCurrentNoteId(id);
    setModalIsOpen(true);
  };

  const saveSharedNote = async () => {
    if (email.trim() === "") return;

    try {
      await addDoc(collection(db, "sharedNotes"), {
        noteId: currentNoteId,
        sharedBy: user.email,
        sharedWith: email,
        sharedAt: new Date(),
      });
      setShareSuccess(true);
      setTimeout(() => {
        setModalIsOpen(false);
        setShareSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error sharing note:", error);
      setModalIsOpen(false);
    }
  };

  const deleteNote = async (id) => {
    await deleteDoc(doc(db, "notes", id));
    fetchNotes();
  };

  const deleteSharedNote = async (id) => {
    await deleteDoc(doc(db, "sharedNotes", id));
    fetchSharedNotes();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const openEditModal = (note) => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setCurrentNoteId(note.id);
    setEditModalIsOpen(true);
  };

  const updateNote = async () => {
    if (currentNoteId) {
      await updateDoc(doc(db, "notes", currentNoteId), {
        title: editTitle,
        content: editContent,
      });
      setEditModalIsOpen(false);
      fetchNotes();
    }
  };

  const openViewSharedNoteModal = (note) => {
    setViewSharedNoteTitle(note.title);
    setViewSharedNoteContent(note.content);
    setViewSharedNoteModalIsOpen(true);
  };

  return (
    <div className="p-6 relative min-h-screen">
      {/* Logout Button in Top-Right Corner */}
      {user && (
        <div className="absolute top-4 right-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white p-2 rounded shadow-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="mb-4 flex justify-center items-center">
        <div className="bg-white p-4 rounded-md shadow-md w-full max-w-3xl flex">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="w-1/3 p-2 border-none focus:outline-none mr-2"
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Take a note..."
            className="w-full p-2 border-none focus:outline-none resize-none"
            rows={5}
          />
          <button
            onClick={addNote}
            className="ml-2 bg-blue-500 text-white p-2 rounded shadow-md hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>

      {/* Personal Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-yellow-100 p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 relative break-words cursor-pointer"
            onClick={() => openEditModal(note)}
          >
            <div className="absolute top-2 right-2 flex space-x-2">
              <FaTrash
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
                className="text-gray-600 hover:text-red-500 cursor-pointer"
              />
              <FaShareAlt
                onClick={(e) => {
                  e.stopPropagation();
                  shareNote(note.id);
                }}
                className="text-gray-600 hover:text-blue-500 cursor-pointer"
              />
              <FaEdit
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(note);
                }}
                className="text-gray-600 hover:text-green-500 cursor-pointer"
              />
            </div>
            <h3 className="font-bold">{note.title}</h3>
            <div>{note.content.substring(0, 100)}...</div>
          </div>
        ))}
      </div>

      {/* Shared Notes Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Shared Notes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sharedNotes.map((note) => (
            <div
              key={note.id}
              className="bg-green-100 p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 relative break-words cursor-pointer"
              onClick={() => openViewSharedNoteModal(note)} // Open view shared note modal
            >
              <h3 className="font-bold">{note.title}</h3>
              <p>{note.content.substring(0, 100)}...</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSharedNote(note.id);
                }}
                className="bg-red-500 text-white p-2 rounded mt-2"
              >
                Delete Shared Note
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Share Note Modal */}
      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} style={customModalStyle}>
        <h2 className="text-lg font-bold">Share Note</h2>
        {shareSuccess ? (
          <p className="text-green-500">Note shared successfully!</p>
        ) : (
          <div>
            <p className="mb-2">Share this link:</p>
            <input
              type="text"
              readOnly
              value={currentNoteLink}
              className="border p-2 w-full mb-2"
            />
            <input
              type="email"
              placeholder="Friend's Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 w-full mb-2"
            />
            <button
              onClick={saveSharedNote}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Share
            </button>
          </div>
        )}
        <button
          onClick={() => setModalIsOpen(false)}
          className="mt-4 bg-red-500 text-white p-2 rounded"
        >
          Close
        </button>
      </Modal>

      {/* Edit Note Modal */}
      <Modal isOpen={editModalIsOpen} onRequestClose={() => setEditModalIsOpen(false)} style={customModalStyle}>
        <h2 className="text-lg font-bold">Edit Note</h2>
        <div className="mb-4 border border-gray-300 p-4 rounded">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)} // Handle title change
            placeholder="Edit Note Title"
            className="w-full p-2 border-none focus:outline-none mb-2"
          />
        </div>
        <div className="mb-4 border border-gray-300 p-4 rounded">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)} // Handle content change
            placeholder="Edit Note Content"
            className="w-full p-2 border-none focus:outline-none resize-none h-80" // Fill height and make non-resizable
          />
        </div>
        <div className="flex justify-between mt-4">
          <button
            onClick={updateNote}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Update Note
          </button>
          <button
            onClick={() => setEditModalIsOpen(false)}
            className="bg-red-500 text-white p-2 rounded"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* View Shared Note Modal */}
      <Modal isOpen={viewSharedNoteModalIsOpen} onRequestClose={() => setViewSharedNoteModalIsOpen(false)} style={customModalStyle}>
        <h2 className="text-lg font-bold">View Shared Note</h2>
        <div className="mb-4 border border-gray-300 p-4 rounded">
          <input
            type="text"
            value={viewSharedNoteTitle}
            readOnly
            className="w-full p-2 border-none focus:outline-none mb-2"
          />
        </div>
        <div className="mb-4 border border-gray-300 p-4 rounded">
          <textarea
            value={viewSharedNoteContent}
            readOnly
            className="w-full p-2 border-none focus:outline-none resize-none h-80" // Fill height and make non-resizable
          />
        </div>
        <button
          onClick={() => setViewSharedNoteModalIsOpen(false)}
          className="bg-red-500 text-white p-2 rounded"
        >
          Close
        </button>
      </Modal>

      {/* AI Assistant Component */}
      <AiAssistant notes={notes} /> {/* Pass notes to the AI Assistant */}
    </div>
  );
};

export default Notes;
