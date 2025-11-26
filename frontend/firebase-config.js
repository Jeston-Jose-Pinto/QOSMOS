// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZdM3H6_7WptYaEe3Jl7BML1rEp9XtZXE",
  authDomain: "quantum-computing-simulator.firebaseapp.com",
  projectId: "quantum-computing-simulator",
  storageBucket: "quantum-computing-simulator.firebasestorage.app",
  messagingSenderId: "243542374418",
  appId: "1:243542374418:web:50af11fcb3ded5411d80cb",
  measurementId: "G-5FP233Q20E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);