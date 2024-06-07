import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBIMNXQj6Zi8NiPjG2-c7BFtF5ilJaGU10",
  authDomain: "service-wallah.firebaseapp.com",
  projectId: "service-wallah",
  storageBucket: "service-wallah.appspot.com",
  messagingSenderId: "870893969305",
  appId: "1:870893969305:web:b5fbbe7dca411b2bc73d08",
  measurementId: "G-3CYG0JHWDF"
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

export { storage, firebaseApp };

//User password supabase m6&HK++tF8$dN%P
//JWT Secret supabase +zSTVLU9iChAlT0pXVSdRzZOg/jYbe0e4YIPttBl9N30ekQV3qLDOgLVMNrY+oImFtUjEigrhEYBe+k4ypLejw==