import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAqed2tCPX8SYXtTaMshQXHAmIzCtZ8Ikc",
  authDomain: "test-1-80c35.firebaseapp.com",
  projectId: "test-1-80c35",
  storageBucket: "test-1-80c35.appspot.com",
  messagingSenderId: "1067797969930",
  appId: "1:1067797969930:web:9ff80274b705da378d73f3",
  measurementId: "G-HM17GE0TJV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
