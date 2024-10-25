// src/components/NoteDetail.js
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const NoteDetail = () => {
  const { id } = useParams();
  const [note, setNote] = useState(null);

  // Fetch note by ID
  const fetchNote = useCallback(async () => {
    const noteRef = doc(db, "notes", id);
    const noteSnap = await getDoc(noteRef);
    if (noteSnap.exists()) {
      setNote(noteSnap.data());
    } else {
      console.log("No such note!");
    }
  }, [id]); // Dependency on id

  useEffect(() => {
    fetchNote();
  }, [fetchNote]); // Include fetchNote in the dependency array

  return (
    <div className="p-6">
      {note ? (
        <div className={`p-4 rounded-lg shadow-lg ${note.color}`}>
          <h2 className="text-2xl font-bold mb-4">Note</h2>
          <p>{note.content}</p>
        </div>
      ) : (
        <p>Loading note...</p>
      )}
    </div>
  );
};

export default NoteDetail;
