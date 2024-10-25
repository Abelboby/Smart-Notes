// src/App.js
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Notes from "./components/Notes";
import NoteDetail from "./components/NoteDetail";
import Login from "./components/Login";
import Header from "./components/Header";
import { useState } from "react";

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Header user={user} setUser={setUser} /> {/* Pass user to Header */}
      <Routes>
        <Route
          path="/"
          element={user ? <Notes user={user} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/note/:id"
          element={user ? <NoteDetail /> : <Navigate to="/login" replace />}
        />
        <Route path="/login" element={<Login setUser={setUser} />} />
      </Routes>
    </Router>
  );
}

export default App;
