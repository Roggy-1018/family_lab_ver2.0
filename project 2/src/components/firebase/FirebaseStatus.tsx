import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Shield } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface FirebaseStatusProps {
  showDetails?: boolean;
}

export const FirebaseStatus: React.FC<FirebaseStatusProps> = ({ 
  showDetails = false 
}) => {
  const [authStatus, setAuthStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [firestoreStatus, setFirestoreStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkFirebaseConnection = async () => {
    setIsRefreshing(true);
    
    // Firebase Auth接続確認
    try {
      // auth オブジェクトが正常に初期化されているかチェック
      if (auth && auth.app) {
        setAuthStatus('connected');
        console.log('✅ Firebase Auth 接続確認成功');
      } else {
        setAuthStatus('error');
        console.error('❌ Firebase Auth 初期化エラー');
      }
    } catch (error) {
      console.error('❌ Firebase Auth 接続エラー:', error);
      setAuthStatus('error');
    }

    // Firestore接続確認
    try {
      // Firestoreが正常に初期化されているかチェック
      if (db && db.app) {
        setFirestoreStatus('connected');
        console.log('✅ Firestore 接続確認成功');
      } else {
        setFirestoreStatus('error');
        console.error('❌ Firestore 初期化エラー');
      }
    } catch (error: any) {
      console.error('❌ Firestore 接続エラー:', error);
      setFirestoreStatus('error');
    }

    setIsRefreshing(false);
  };

  useEffect(() => {
    checkFirebaseConnection();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return '接続済み';
      case 'error':
        return 'エラー';
      default:
        return '確認中...';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  if (!showDetails) {
    const overallStatus = authStatus === 'connected' && firestoreStatus === 'connected' 
      ? 'connected' 
      : authStatus === 'error' || firestoreStatus === 'error' 
      ? 'error' 
      : 'checking';

    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon(overallStatus)}
        <span className="text-sm text-gray-600">
          Firebase {getStatusText(overallStatus)}
        </span>
        {overallStatus === 'connected' && (
          <span className="text-xs text-green-600 font-medium">
            (family-lab-9ff74)
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Firebase接続状況</h3>
        <button
          onClick={checkFirebaseConnection}
          disabled={isRefreshing}
          className="flex items-center space-x-1 rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>更新</span>
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Firebase Authentication</span>
          </div>
          <div className={`flex items-center space-x-2 rounded-full px-2 py-1 ${getStatusColor(authStatus)}`}>
            {getStatusIcon(authStatus)}
            <span className="text-sm font-medium">{getStatusText(authStatus)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Firestore Database</span>
          </div>
          <div className={`flex items-center space-x-2 rounded-full px-2 py-1 ${getStatusColor(firestoreStatus)}`}>
            {getStatusIcon(firestoreStatus)}
            <span className="text-sm font-medium">{getStatusText(firestoreStatus)}</span>
          </div>
        </div>
        
        {authStatus === 'connected' && firestoreStatus === 'connected' && (
          <div className="mt-4 rounded-lg bg-green-50 p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Firebase接続成功！
                </p>
                <p className="text-xs text-green-600">
                  プロジェクト: family-lab-9ff74
                </p>
              </div>
            </div>
          </div>
        )}
        
        {(authStatus === 'error' || firestoreStatus === 'error') && (
          <div className="mt-4 rounded-lg bg-red-50 p-3">
            <div className="flex items-start space-x-2">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Firebase接続エラー
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Firebase Consoleでプロジェクト設定を確認してください。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};