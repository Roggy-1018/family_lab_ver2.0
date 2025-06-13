import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// 環境変数から Firebase 設定を取得
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC9aBDyToBTkuEED359FDuxd-XfBKY-QzU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "family-lab-9ff74.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "family-lab-9ff74",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "family-lab-9ff74.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "260910016958",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:260910016958:web:6cf4709c9d29c58384f1ef",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-S8VRJY59LV"
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// Firestoreデータベースを取得
export const db = getFirestore(app);

// Firebase Authenticationを取得
export const auth = getAuth(app);

// Firebase Storageを取得
export const storage = getStorage(app);

// 開発環境でエミュレーターを使用する場合
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('🔧 Firebase エミュレーターに接続しました');
  } catch (error) {
    console.log('⚠️ Firebase エミュレーターの接続をスキップしました');
  }
}

// Firebase接続状況をログ出力
console.log('🔥 Firebase initialized successfully');
console.log('📊 Project ID:', firebaseConfig.projectId);
console.log('🔐 Auth Domain:', firebaseConfig.authDomain);

export default app;