// src/components/Login.js
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
  const navigate = useNavigate();

  const signIn = (e) => {
    e.preventDefault(); // Prevent page refresh
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
        navigate('/'); // Redirect to home page after successful login
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="h-screen flex justify-center items-center">
      <button onClick={signIn} className="bg-blue-500 text-white p-4 rounded">
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
