// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDZNgq45rCmf4gBm0eANWHUHIg-GpiUMkg",
    authDomain: "notesharing12.firebaseapp.com",
    projectId: "notesharing12",
    storageBucket: "notesharing12.appspot.com",
    messagingSenderId: "1051891955245",
    appId: "1:1051891955245:web:96b48e7291ab5f62da2aa4",
    measurementId: "G-VRK71WCN6F"
  };
  

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider };
