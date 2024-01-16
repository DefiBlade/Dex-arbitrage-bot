import firebase from 'firebase';


const firebaseConfig = {
  apiKey: "AIzaSyBI1WF0GvrC8IqFaa6bPZmpSzejJJ1pfb8",
  authDomain: "front-run-bot.firebaseapp.com",
  databaseURL: "https://front-run-bot-default-rtdb.firebaseio.com",
  projectId: "front-run-bot",
  storageBucket: "front-run-bot.appspot.com",
  messagingSenderId: "512648242141",
  appId: "1:512648242141:web:3449a9f38ce1d00f0c0c34",
  measurementId: "G-GNPS4GLDHP"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();

export default firebase;

export const database = firebase.database();
export const auth = firebase.auth();
export const storage = firebase.storage();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
