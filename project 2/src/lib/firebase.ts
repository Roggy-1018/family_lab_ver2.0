import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// 環境変数から Firebase 設定を取得
const firebaseConfig = {
  apiKey: 
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
