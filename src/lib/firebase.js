import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBEoV9Pu5o56h1zsrN9XKVocC_jNtYzFh8",
  authDomain: "lifesync-80344.firebaseapp.com",
  projectId: "lifesync-80344",
  storageBucket: "lifesync-80344.firebasestorage.app",
  messagingSenderId: "534418067518",
  appId: "1:534418067518:web:85a03b0cec362d1d17016f",
  measurementId: "G-Y6YSFB2XKM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

