import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  writeBatch,
  limit,
  startAfter,
  DocumentSnapshot,
  setDoc
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { db, auth } from './firebase';
import { User, Survey, SurveyResponse } from '../types';
import { demoSurveys, demoAccounts } from './demoData';

// ===== デモモード関連 =====

/**
 * デモアカウントかどうかを判定
 */
const isDemoAccount = (email: string): boolean => {
  return demoAccounts.some(account => account.email === email);
};

/**
 * デモモード用のローカルストレージキー
 */
const DEMO_USER_KEY = 'demo_user';
const DEMO_RESPONSES_KEY = 'demo_responses';

/**
 * デモユーザー情報をローカルストレージに保存
 */
const saveDemoUser = (user: User) => {
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
};

/**
 * デモユーザー情報をローカルストレージから取得
 */
const getDemoUser = (): User | null => {
  const userData = localStorage.getItem(DEMO_USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

/**
 * デモユーザー情報をローカルストレージから削除
 */
const clearDemoUser = () => {
  localStorage.removeItem(DEMO_USER_KEY);
  localStorage.removeItem(DEMO_RESPONSES_KEY);
};

// ===== 認証関連の操作 =====

/**
 * メールアドレスとパスワードでユーザー登録
 */
export const registerWithEmailAndPassword = async (email: string, password: string, displayName?: string) => {
  try {
    // デモアカウントの場合はローカル処理
    if (isDemoAccount(email)) {
      const demoAccount = demoAccounts.find(account => account.email === email);
      if (demoAccount && demoAccount.password === password) {
        const demoUser: User = {
          id: `demo-${Date.now()}`,
          email: demoAccount.email,
          name: displayName || demoAccount.name,
          familyId: `demo-family-${Date.now()}`,
          role: 'user',
          profile: { hasChildren: false }
        };
        saveDemoUser(demoUser);
        console.log('✅ デモユーザー登録成功:', demoUser.id);
        return { uid: demoUser.id, email: demoUser.email } as FirebaseUser;
      } else {
        throw new Error('デモアカウントのパスワードが正しくありません');
      }
    }

    // 通常のFirebase認証
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    console.log('✅ ユーザー登録成功:', userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error('❌ ユーザー登録エラー:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * メールアドレスとパスワードでログイン
 */
export const loginWithEmailAndPassword = async (email: string, password: string) => {
  try {
    // デモアカウントの場合はローカル処理
    if (isDemoAccount(email)) {
      const demoAccount = demoAccounts.find(account => account.email === email);
      if (demoAccount && demoAccount.password === password) {
        const existingDemoUser = getDemoUser();
        const demoUser: User = existingDemoUser || {
          id: `demo-${Date.now()}`,
          email: demoAccount.email,
          name: demoAccount.name,
          familyId: `demo-family-${Date.now()}`,
          role: 'user',
          profile: { hasChildren: false }
        };
        saveDemoUser(demoUser);
        console.log('✅ デモログイン成功:', demoUser.id);
        return { uid: demoUser.id, email: demoUser.email } as FirebaseUser;
      } else {
        throw new Error('デモアカウントのパスワードが正しくありません');
      }
    }

    // 通常のFirebase認証
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ ログイン成功:', userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error('❌ ログインエラー:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * ログアウト
 */
export const logout = async () => {
  try {
    // デモユーザーの場合はローカルストレージをクリア
    const demoUser = getDemoUser();
    if (demoUser) {
      clearDemoUser();
      console.log('✅ デモログアウト成功');
      return;
    }

    // 通常のFirebase認証
    await signOut(auth);
    console.log('✅ ログアウト成功');
  } catch (error) {
    console.error('❌ ログアウトエラー:', error);
    throw error;
  }
};

/**
 * パスワードリセットメール送信
 */
export const sendPasswordReset = async (email: string) => {
  try {
    // デモアカウントの場合は何もしない
    if (isDemoAccount(email)) {
      console.log('✅ デモアカウントのパスワードリセット（シミュレーション）');
      return;
    }

    await sendPasswordResetEmail(auth, email);
    console.log('✅ パスワードリセットメール送信成功');
  } catch (error: any) {
    console.error('❌ パスワードリセットエラー:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * 認証状態の監視
 */
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  // デモユーザーの場合は即座にコールバックを実行
  const demoUser = getDemoUser();
  if (demoUser) {
    callback({ uid: demoUser.id, email: demoUser.email } as FirebaseUser);
    return () => {}; // unsubscribe function
  }

  // 通常のFirebase認証状態監視
  return onAuthStateChanged(auth, (user) => {
    console.log('🔄 認証状態変更:', user ? `ログイン中 (${user.uid})` : 'ログアウト中');
    callback(user);
  });
};

/**
 * Firebase認証エラーメッセージを日本語に変換
 */
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'ユーザーが見つかりません';
    case 'auth/wrong-password':
      return 'パスワードが正しくありません';
    case 'auth/invalid-email':
      return '無効なメールアドレスです';
    case 'auth/email-already-in-use':
      return 'このメールアドレスは既に使用されています';
    case 'auth/weak-password':
      return 'パスワードが弱すぎます（6文字以上必要）';
    case 'auth/too-many-requests':
      return 'リクエストが多すぎます。しばらく待ってから再試行してください';
    case 'auth/network-request-failed':
      return 'ネットワークエラーが発生しました';
    case 'auth/requires-recent-login':
      return 'この操作には再ログインが必要です';
    default:
      return '認証エラーが発生しました';
  }
};

// ===== ユーザー関連の操作 =====

/**
 * Firestoreにユーザー情報を作成
 */
export const createUser = async (userData: Omit<User, 'id'>) => {
  try {
    // デモユーザーの場合はローカルストレージに保存
    const demoUser = getDemoUser();
    if (demoUser) {
      const updatedDemoUser = { ...demoUser, ...userData };
      saveDemoUser(updatedDemoUser);
      console.log('✅ デモユーザー情報更新成功:', demoUser.id);
      return demoUser.id;
    }

    // 通常のFirestore処理
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('認証されたユーザーが見つかりません');
    }

    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, {
      ...userData,
      id: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('✅ ユーザー情報作成成功:', currentUser.uid);
    return currentUser.uid;
  } catch (error) {
    console.error('❌ ユーザー作成エラー:', error);
    throw error;
  }
};

/**
 * ユーザー情報を取得
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // デモユーザーの場合はローカルストレージから取得
    const demoUser = getDemoUser();
    if (demoUser && demoUser.id === userId) {
      console.log('✅ デモユーザー情報取得成功:', userId);
      return demoUser;
    }

    // 通常のFirestore処理
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = { id: userSnap.id, ...userSnap.data() } as User;
      console.log('✅ ユーザー情報取得成功:', userId);
      return userData;
    } else {
      console.log('⚠️ ユーザー情報が見つかりません:', userId);
      return null;
    }
  } catch (error) {
    console.error('❌ ユーザー取得エラー:', error);
    throw error;
  }
};

/**
 * ユーザー情報を更新
 */
export const updateUser = async (userId: string, userData: Partial<User>) => {
  try {
    // デモユーザーの場合はローカルストレージを更新
    const demoUser = getDemoUser();
    if (demoUser && demoUser.id === userId) {
      const updatedDemoUser = { ...demoUser, ...userData };
      saveDemoUser(updatedDemoUser);
      console.log('✅ デモユーザー情報更新成功:', userId);
      return;
    }

    // 通常のFirestore処理
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
    console.log('✅ ユーザー情報更新成功:', userId);
  } catch (error) {
    console.error('❌ ユーザー更新エラー:', error);
    throw error;
  }
};

// ===== アンケート関連の操作 =====

/**
 * アクティブなアンケート一覧を取得
 */
export const getSurveys = async (): Promise<Survey[]> => {
  try {
    // デモユーザーの場合はデモデータを返す
    const demoUser = getDemoUser();
    if (demoUser) {
      console.log('✅ デモアンケート一覧取得成功:', demoSurveys.length, '件');
      return demoSurveys;
    }

    // 通常のFirestore処理
    const surveysQuery = query(
      collection(db, 'surveys'), 
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(surveysQuery);
    
    const surveys = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Survey[];

    console.log('✅ アンケート一覧取得成功:', surveys.length, '件');
    return surveys;
  } catch (error) {
    console.error('❌ アンケート一覧取得エラー:', error);
    // エラー時はデモデータを返す
    console.log('📝 デモデータを使用します');
    return demoSurveys;
  }
};

/**
 * 特定のアンケートを取得
 */
export const getSurveyById = async (surveyId: string): Promise<Survey | null> => {
  try {
    // デモユーザーの場合はデモデータから検索
    const demoUser = getDemoUser();
    if (demoUser) {
      const survey = demoSurveys.find(s => s.id === surveyId);
      if (survey) {
        console.log('✅ デモアンケート取得成功:', surveyId);
        return survey;
      }
    }

    // 通常のFirestore処理
    const surveyRef = doc(db, 'surveys', surveyId);
    const surveySnap = await getDoc(surveyRef);
    
    if (surveySnap.exists()) {
      const survey = { id: surveySnap.id, ...surveySnap.data() } as Survey;
      console.log('✅ アンケート取得成功:', surveyId);
      return survey;
    } else {
      console.log('⚠️ アンケートが見つかりません、デモデータを検索:', surveyId);
      // デモデータから検索
      return demoSurveys.find(survey => survey.id === surveyId) || null;
    }
  } catch (error) {
    console.error('❌ アンケート取得エラー:', error);
    // エラー時はデモデータから検索
    return demoSurveys.find(survey => survey.id === surveyId) || null;
  }
};

/**
 * アンケートを作成（管理者用）
 */
export const createSurvey = async (surveyData: Omit<Survey, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'surveys'), {
      ...surveyData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ アンケート作成成功:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ アンケート作成エラー:', error);
    throw error;
  }
};

// ===== アンケート回答関連の操作 =====

/**
 * アンケート回答を保存
 */
export const saveSurveyResponse = async (response: Omit<SurveyResponse, 'id'>) => {
  try {
    // デモユーザーの場合はローカルストレージに保存
    const demoUser = getDemoUser();
    if (demoUser) {
      const responses = JSON.parse(localStorage.getItem(DEMO_RESPONSES_KEY) || '[]');
      const newResponse = {
        ...response,
        id: `demo-response-${Date.now()}`
      };
      responses.push(newResponse);
      localStorage.setItem(DEMO_RESPONSES_KEY, JSON.stringify(responses));
      console.log('✅ デモアンケート回答保存成功:', newResponse.id);
      return newResponse.id;
    }

    // 通常のFirestore処理
    const docRef = await addDoc(collection(db, 'surveyResponses'), {
      ...response,
      createdAt: serverTimestamp()
    });
    console.log('✅ アンケート回答保存成功:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ アンケート回答保存エラー:', error);
    throw error;
  }
};

/**
 * ユーザーのアンケート回答履歴を取得
 */
export const getUserSurveyResponses = async (userId: string): Promise<SurveyResponse[]> => {
  try {
    // デモユーザーの場合はローカルストレージから取得
    const demoUser = getDemoUser();
    if (demoUser && demoUser.id === userId) {
      const responses = JSON.parse(localStorage.getItem(DEMO_RESPONSES_KEY) || '[]');
      console.log('✅ デモユーザー回答履歴取得成功:', responses.length, '件');
      return responses;
    }

    // 通常のFirestore処理
    const responsesQuery = query(
      collection(db, 'surveyResponses'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc')
    );
    const querySnapshot = await getDocs(responsesQuery);
    
    const responses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SurveyResponse[];

    console.log('✅ ユーザー回答履歴取得成功:', responses.length, '件');
    return responses;
  } catch (error) {
    console.error('❌ ユーザーアンケート回答取得エラー:', error);
    return [];
  }
};

// ===== 家族グループ関連の操作 =====

/**
 * 家族グループを作成
 */
export const createFamilyGroup = async (groupData: {
  name: string;
  createdBy: string;
}) => {
  try {
    // デモユーザーの場合は固定IDを返す
    const demoUser = getDemoUser();
    if (demoUser) {
      console.log('✅ デモ家族グループ作成成功:', demoUser.familyId);
      return demoUser.familyId;
    }

    // 通常のFirestore処理
    const docRef = await addDoc(collection(db, 'familyGroups'), {
      ...groupData,
      members: [groupData.createdBy],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ 家族グループ作成成功:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ 家族グループ作成エラー:', error);
    throw error;
  }
};

/**
 * 家族グループにユーザーを追加
 */
export const addUserToFamilyGroup = async (userId: string, familyGroupId: string) => {
  try {
    // デモユーザーの場合は何もしない
    const demoUser = getDemoUser();
    if (demoUser) {
      console.log('✅ デモ家族グループへのユーザー追加成功:', userId);
      return;
    }

    // 通常のFirestore処理
    const groupRef = doc(db, 'familyGroups', familyGroupId);
    const groupSnap = await getDoc(groupRef);
    
    if (groupSnap.exists()) {
      const currentMembers = groupSnap.data().members || [];
      if (!currentMembers.includes(userId)) {
        await updateDoc(groupRef, {
          members: [...currentMembers, userId],
          updatedAt: serverTimestamp()
        });
        console.log('✅ 家族グループへのユーザー追加成功:', userId);
      }
    }
  } catch (error) {
    console.error('❌ 家族グループへのユーザー追加エラー:', error);
    throw error;
  }
};