import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: 'AIzaSyDItqnV6baN3ZhFTZzTdGuSJyV',
    authDomain: 'pointify-9e51e.firebaseapp.com',
    projectId: 'pointify-9e51e',
    storageBucket: 'pointify-9e51e.appspot.com',
    messagingSenderId: '321868996666',
    appId: '1:321868996666:web:d2bbd5e4b7c32c32f59503',
};

const app = initializeApp(firebaseConfig);
export const fireStore = getFirestore(app)
const auth = getAuth(app);

export default auth;