// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpsdqQ4RL1KWb-9359j5-H7k8Qqgqrt2A",
  authDomain: "teethsi-app.firebaseapp.com",
  projectId: "teethsi-app",
  storageBucket: "teethsi-app.firebasestorage.app",
  messagingSenderId: "729681182814",
  appId: "1:729681182814:web:65ebcdab4982e7cae074cf",
  measurementId: "G-W72XM2BHM7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };