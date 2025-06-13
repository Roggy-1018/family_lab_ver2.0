import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * ページネーション付きでドキュメントを取得
 */
export const getPaginatedDocuments = async (
  collectionName: string,
  pageSize: number = 10,
  lastDoc?: DocumentSnapshot,
  constraints: QueryConstraint[] = []
) => {
  try {
    const queryConstraints = [
      ...constraints,
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    ];

    if (lastDoc) {
      queryConstraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, collectionName), ...queryConstraints);
    const snapshot = await getDocs(q);
    
    return {
      docs: snapshot.docs,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('ページネーション取得エラー:', error);
    throw error;
  }
};

/**
 * 検索機能
 */
export const searchDocuments = async (
  collectionName: string,
  field: string,
  searchTerm: string,
  maxResults: number = 20
) => {
  try {
    // Firestoreの制限により、完全一致検索のみ
    const q = query(
      collection(db, collectionName),
      where(field, '>=', searchTerm),
      where(field, '<=', searchTerm + '\uf8ff'),
      limit(maxResults)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('検索エラー:', error);
    throw error;
  }
};

/**
 * バッチ処理のヘルパー
 */
export const processBatch = async <T>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<void>
) => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await processor(batch);
  }
};

/**
 * Firestore エラーハンドリング
 */
export const handleFirestoreError = (error: any): string => {
  switch (error.code) {
    case 'permission-denied':
      return 'アクセス権限がありません';
    case 'not-found':
      return 'データが見つかりません';
    case 'already-exists':
      return 'データが既に存在します';
    case 'resource-exhausted':
      return 'リクエスト制限に達しました';
    case 'failed-precondition':
      return '前提条件が満たされていません';
    case 'aborted':
      return '処理が中断されました';
    case 'out-of-range':
      return '範囲外の値です';
    case 'unimplemented':
      return 'この機能は実装されていません';
    case 'internal':
      return '内部エラーが発生しました';
    case 'unavailable':
      return 'サービスが利用できません';
    case 'data-loss':
      return 'データが失われました';
    case 'unauthenticated':
      return '認証が必要です';
    default:
      return 'エラーが発生しました';
  }
};

/**
 * リアルタイム更新のヘルパー
 */
export const subscribeToDocument = (
  collectionName: string,
  docId: string,
  callback: (data: any) => void,
  errorCallback?: (error: any) => void
) => {
  const docRef = doc(db, collectionName, docId);
  
  return onSnapshot(docRef, 
    (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('リアルタイム更新エラー:', error);
      if (errorCallback) {
        errorCallback(error);
      }
    }
  );
};

/**
 * コレクションのリアルタイム監視
 */
export const subscribeToCollection = (
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: any[]) => void,
  errorCallback?: (error: any) => void
) => {
  const q = query(collection(db, collectionName), ...constraints);
  
  return onSnapshot(q,
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (error) => {
      console.error('コレクション監視エラー:', error);
      if (errorCallback) {
        errorCallback(error);
      }
    }
  );
};