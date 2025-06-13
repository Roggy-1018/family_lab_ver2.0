import { useState, useEffect } from 'react';
import { 
  doc, 
  collection, 
  onSnapshot, 
  query, 
  QueryConstraint,
  DocumentSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Firestoreドキュメントのリアルタイム監視フック
 */
export const useDocument = (collectionName: string, docId: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    const docRef = doc(db, collectionName, docId);
    
    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() });
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Document subscription error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, docId]);

  return { data, loading, error };
};

/**
 * Firestoreコレクションのリアルタイム監視フック
 */
export const useCollection = (
  collectionName: string, 
  constraints: QueryConstraint[] = []
) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), ...constraints);
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Collection subscription error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
};

/**
 * ページネーション付きコレクション監視フック
 */
export const usePaginatedCollection = (
  collectionName: string,
  constraints: QueryConstraint[] = [],
  pageSize: number = 10
) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = () => {
    // ページネーション実装
    // 実際の実装では getPaginatedDocuments を使用
  };

  const refresh = () => {
    setData([]);
    setLastDoc(null);
    setHasMore(true);
    // 最初のページを再読み込み
  };

  return { 
    data, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refresh 
  };
};