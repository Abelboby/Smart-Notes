import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Notes from "./components/Notes";
import NoteDetail from "./components/NoteDetail";
import Login from "./components/Login";
import Header from "./components/Header";
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header user={user} setUser={setUser} />
        <Routes>
          <Route
            path="/login"
            element={
              user ? <Navigate to="/" /> : <Login setUser={setUser} />
            }
          />
          <Route
            path="/"
            element={
              user ? <Notes user={user} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/note/:id"
            element={
              user ? <NoteDetail user={user} /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;