// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiFdJJAVSU1E1Dm2idAXh_kD0hXIN_VEQ",
  authDomain: "fir-tut-4b87b.firebaseapp.com",
  projectId: "fir-tut-4b87b",
  storageBucket: "fir-tut-4b87b.appspot.com",
  messagingSenderId: "2538838262",
  appId: "1:2538838262:web:e46bcaee7dc9f4aba4f4d7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);