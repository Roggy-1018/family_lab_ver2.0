# Family Lab - Firebase連携版

学術的根拠に基づく家族関係診断・サポートアプリケーション

## 🔥 Firebase連携の詳細実装

### 1. Firebase プロジェクトの作成

#### ステップ 1: Firebase Console でプロジェクト作成
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例：`family-lab-production`）
4. Google Analytics の設定（推奨：有効化）
5. プロジェクトを作成

#### ステップ 2: ウェブアプリの追加
1. プロジェクト概要 > アプリを追加 > ウェブ
2. アプリのニックネーム：`Family Lab Web App`
3. Firebase Hosting の設定（任意）
4. 設定オブジェクトをコピー

### 2. Firebase サービスの設定

#### Authentication の設定
```bash
# Firebase Console で以下を実行：
1. Authentication > Sign-in method
2. 「メール/パスワード」を有効化
3. 「メール/パスワード」をクリック
4. 「有効にする」をオン
5. 保存
```

#### Firestore Database の設定
```bash
# Firebase Console で以下を実行：
1. Firestore Database > データベースを作成
2. セキュリティルール：「テストモードで開始」を選択
3. ロケーション：asia-northeast1 (東京) を推奨
4. 完了
```

### 3. 環境変数の設定

#### 開発環境用 (.env.local)
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_USE_FIREBASE_EMULATOR=false
```

#### 本番環境用
```env
# Netlify/Vercel などのデプロイ環境で設定
VITE_FIREBASE_API_KEY=production-api-key
VITE_FIREBASE_AUTH_DOMAIN=family-lab-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=family-lab-prod
VITE_FIREBASE_STORAGE_BUCKET=family-lab-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=987654321
VITE_FIREBASE_APP_ID=1:987654321:web:fedcba654321
```

### 4. Firestore セキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // アンケートは認証済みユーザーが読み取り可能
    match /surveys/{surveyId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.admin == true; // 管理者のみ作成・更新可能
    }
    
    // アンケート回答は自分のもののみアクセス可能
    match /surveyResponses/{responseId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // 家族グループはメンバーのみアクセス可能
    match /familyGroups/{groupId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.members;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.createdBy;
    }
    
    // 統計データは認証済みユーザーが読み取り可能
    match /stats/{statId} {
      allow read: if request.auth != null;
      allow write: if false; // システムのみ更新可能
    }
  }
}
```

### 5. データベース構造

#### Users Collection
```typescript
interface UserDocument {
  id: string;              // Firebase Auth UID
  email: string;           // ユーザーのメールアドレス
  name: string;            // 表示名
  familyId: string;        // 所属する家族グループID
  role: 'user' | 'admin';  // ユーザーロール
  profile: {
    hasChildren: boolean;
    birthDate?: string;
    gender?: 'male' | 'female' | 'other';
    marriageDate?: string;
    occupation?: string;
    prefecture?: string;
    children?: Child[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Surveys Collection
```typescript
interface SurveyDocument {
  id: string;
  title: string;
  description: string;
  categories: SurveyCategory[];
  isActive: boolean;
  version: number;         // バージョン管理
  createdBy: string;       // 作成者ID
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### SurveyResponses Collection
```typescript
interface SurveyResponseDocument {
  id: string;
  userId: string;
  surveyId: string;
  answers: QuestionAnswer[];
  completedAt: string;
  startedAt: string;
  deviceInfo?: {           // デバイス情報（分析用）
    userAgent: string;
    platform: string;
  };
  createdAt: Timestamp;
}
```

#### FamilyGroups Collection
```typescript
interface FamilyGroupDocument {
  id: string;
  name: string;
  createdBy: string;
  members: string[];       // メンバーのUID配列
  inviteCode?: string;     // 招待コード
  settings: {
    allowDataSharing: boolean;
    notificationEnabled: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 6. Firebase Functions（オプション）

#### 自動統計計算
```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const calculateUserStats = functions.firestore
  .document('surveyResponses/{responseId}')
  .onCreate(async (snap, context) => {
    const response = snap.data();
    const userId = response.userId;
    
    // ユーザーの統計を更新
    const statsRef = admin.firestore().doc(`stats/user_${userId}`);
    await statsRef.set({
      totalResponses: admin.firestore.FieldValue.increment(1),
      lastResponseDate: response.completedAt,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  });
```

### 7. 開発・デプロイ

#### 開発環境
```bash
# 依存関係のインストール
npm install

# Firebase エミュレーターの起動（オプション）
npm install -g firebase-tools
firebase login
firebase init emulators
firebase emulators:start

# 開発サーバーの起動
npm run dev
```

#### 本番デプロイ
```bash
# ビルド
npm run build

# Firebase Hosting にデプロイ
firebase deploy --only hosting

# または Netlify/Vercel にデプロイ
# dist フォルダをアップロード
```

### 8. 監視・分析

#### Firebase Analytics
```typescript
// src/lib/analytics.ts
import { getAnalytics, logEvent } from 'firebase/analytics';
import { app } from './firebase';

const analytics = getAnalytics(app);

export const trackSurveyCompletion = (surveyId: string) => {
  logEvent(analytics, 'survey_completed', {
    survey_id: surveyId
  });
};

export const trackUserRegistration = () => {
  logEvent(analytics, 'sign_up', {
    method: 'email'
  });
};
```

#### Performance Monitoring
```typescript
// src/lib/performance.ts
import { getPerformance } from 'firebase/performance';
import { app } from './firebase';

const perf = getPerformance(app);

export const measureSurveyLoadTime = () => {
  const trace = perf.trace('survey_load');
  trace.start();
  
  return {
    stop: () => trace.stop()
  };
};
```

### 9. セキュリティ対策

#### データ検証
```typescript
// Firestore セキュリティルールでの検証例
allow write: if request.auth != null &&
  request.resource.data.keys().hasAll(['email', 'name']) &&
  request.resource.data.email is string &&
  request.resource.data.name is string &&
  request.resource.data.email.matches('.*@.*\\..*');
```

#### レート制限
```typescript
// Cloud Functions でのレート制限
import { RateLimiter } from 'limiter';

const limiter = new RateLimiter(10, 'minute'); // 1分間に10回まで

export const rateLimitedFunction = functions.https.onCall(async (data, context) => {
  if (!limiter.tryRemoveTokens(1)) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded');
  }
  
  // 処理を実行
});
```

### 10. トラブルシューティング

#### よくある問題と解決方法

1. **Firebase設定エラー**
   ```bash
   Error: Firebase configuration not found
   ```
   → `.env.local` ファイルの設定を確認

2. **認証エラー**
   ```bash
   Error: auth/operation-not-allowed
   ```
   → Firebase Console で Authentication を有効化

3. **Firestore権限エラー**
   ```bash
   Error: permission-denied
   ```
   → セキュリティルールを確認・更新

4. **ネットワークエラー**
   ```bash
   Error: network-request-failed
   ```
   → インターネット接続とFirebaseサービス状況を確認

### 11. パフォーマンス最適化

#### データ取得の最適化
```typescript
// ページネーション
const getPaginatedData = async (lastDoc?: DocumentSnapshot) => {
  let query = collection(db, 'surveyResponses')
    .orderBy('createdAt', 'desc')
    .limit(10);
    
  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }
  
  return getDocs(query);
};

// インデックス作成
// Firebase Console > Firestore > インデックス で作成
```

#### キャッシュ戦略
```typescript
// オフライン対応
import { enableNetwork, disableNetwork } from 'firebase/firestore';

// オフライン時の処理
window.addEventListener('offline', () => {
  disableNetwork(db);
});

window.addEventListener('online', () => {
  enableNetwork(db);
});
```

## 🚀 次のステップ

1. **Firebase プロジェクトの作成と設定**
2. **環境変数の設定**
3. **セキュリティルールの適用**
4. **テストデータの投入**
5. **本番環境へのデプロイ**

これで、スケーラブルで安全なFirebase連携アプリケーションが完成します！