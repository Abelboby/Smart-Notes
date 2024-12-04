import React, { useState, useEffect } from "react";
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
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaShareAlt, FaEdit, FaPlus } from "react-icons/fa";
import AiAssistant from './AiAssistant';
import { signOut } from "firebase/auth";


Modal.setAppElement("#root");

const customModalStyle = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxHeight: '80%',
    padding: '0',
    border: 'none',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-6 py-8">
      {/* Input Area */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto transform transition-all duration-200 hover:shadow-xl">
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              className="w-full px-4 py-2 text-lg font-semibold bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Take a note..."
              className="w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none"
              rows={5}
            />
            <button
              onClick={addNote}
              className="flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md"
            >
              <FaPlus className="mr-2" />
              Add Note
            </button>
          </div>
        </div>
      </div>

      {/* Personal Notes Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Notes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer"
              onClick={() => openEditModal(note)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{note.title}</h3>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="p-2 text-gray-600 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors duration-200"
                  >
                    <FaTrash size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      shareNote(note.id);
                    }}
                    className="p-2 text-gray-600 hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors duration-200"
                  >
                    <FaShareAlt size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(note);
                    }}
                    className="p-2 text-gray-600 hover:text-green-500 rounded-full hover:bg-green-50 transition-colors duration-200"
                  >
                    <FaEdit size={14} />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 line-clamp-3">{note.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shared Notes Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Shared Notes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sharedNotes.map((note) => (
            <div
              key={note.id}
              className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer"
              onClick={() => openViewSharedNoteModal(note)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{note.title}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSharedNote(note.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-500 rounded-full hover:bg-red-50 transition-all duration-200"
                >
                  <FaTrash size={14} />
                </button>
              </div>
              <p className="text-gray-600 line-clamp-3">{note.content}</p>
              <div className="mt-4 text-sm text-gray-500">
                Shared by: {note.sharedBy}
              </div>
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

      <AiAssistant notes={notes} />
    </div>
  );
};

export default Notes;