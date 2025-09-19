import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDoL4R2GmKy7gqnWXKei8V5lflH4plEMkM",
  authDomain: "agenda-f58b7.firebaseapp.com",
  projectId: "agenda-f58b7",
  storageBucket: "agenda-f58b7.firebasestorage.app",
  messagingSenderId: "88974735864",
  appId: "1:88974735864:web:0e9a029173d6409f61be0d",
  measurementId: "G-0DSR8JY53N"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

