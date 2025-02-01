// Import the functions you need from the SDKs you need
'use client';
import * as dotenv from 'dotenv';
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
dotenv.config();


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const isDev = process.env.NEXT_PUBLIC_DEV === 'true';
// const isLocal = process.env.NEXT_PUBLIC_LOCAL === 'true';
const isLocal = true;
const firebaseConfig = {
  apiKey: "AIzaSyAzvc8VxlKyTDzIu8hVyZiz-IkMWR_bCYg",
  authDomain: "radiodjumbai-8f473.firebaseapp.com",
  projectId: "radiodjumbai-8f473",
  storageBucket: "radiodjumbai-8f473.firebasestorage.app",
  messagingSenderId: "1012321828922",
  appId: "1:1012321828922:web:ca06ad205b91b44c9ef503",
  measurementId: "G-ZNRZSH0HTQ"
};


console.log('isDev', isDev);
console.log('isLocal', isLocal);
// Initialize Firebase
const app = initializeApp(
  firebaseConfig
);


export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);


if (isLocal) { //this prevent trying to connect on production
  console.log('connecting to firestore emulator');
  connectFirestoreEmulator(firestore, 'localhost', 8080); // Connect to the emulator
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}

export default app;