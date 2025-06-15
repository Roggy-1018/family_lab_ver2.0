# 🔥 Firebase設定ガイド - 詳細版

## 📋 目次
1. [Firebase プロジェクトの作成](#1-firebase-プロジェクトの作成)
2. [Authentication の設定](#2-authentication-の設定)
3. [Firestore Database の設定](#3-firestore-database-の設定)
4. [セキュリティルールの設定](#4-セキュリティルールの設定)
5. [環境変数の設定](#5-環境変数の設定)
6. [デモアカウントの動作確認](#6-デモアカウントの動作確認)
7. [トラブルシューティング](#7-トラブルシューティング)

---

## 1. Firebase プロジェクトの作成

### ステップ 1-1: Firebase Console にアクセス
1. [Firebase Console](https://console.firebase.google.com/) を開く
2. Googleアカウントでログイン

### ステップ 1-2: 新しいプロジェクトを作成
1. 「プロジェクトを追加」をクリック
2. **プロジェクト名**: `family-lab-production` (任意の名前)
3. **プロジェクトID**: 自動生成されるIDを確認（後で使用）
4. **Google Analytics**: 「有効にする」を選択（推奨）
5. **Analytics アカウント**: デフォルトのアカウントを選択
6. 「プロジェクトを作成」をクリック

### ステップ 1-3: ウェブアプリを追加
1. プロジェクト概要画面で **ウェブアイコン** `</>` をクリック
2. **アプリのニックネーム**: `Family Lab Web App`
3. **Firebase Hosting**: チェックを入れる（推奨）
4. 「アプリを登録」をクリック
5. **🚨 重要**: 表示される設定オブジェクトを必ずコピーして保存

```javascript
};
```

---

## 2. Authentication の設定

### ステップ 2-1: Authentication を有効化
1. 左サイドバーから **「Authentication」** をクリック
2. 「始める」ボタンをクリック

### ステップ 2-2: ログイン方法を設定
1. **「Sign-in method」** タブをクリック
2. **「メール/パスワード」** をクリック
3. **「有効にする」** をオンにする
4. **「保存」** をクリック

### ステップ 2-3: 承認済みドメインを確認
1. **「Settings」** タブをクリック
2. **「承認済みドメイン」** セクションを確認
3. 本番環境のドメインを追加（例：`your-domain.com`）

---

## 3. Firestore Database の設定

### ステップ 3-1: Firestore を作成
1. 左サイドバーから **「Firestore Database」** をクリック
2. **「データベースを作成」** をクリック

### ステップ 3-2: セキュリティルールを選択
1. **「テストモードで開始」** を選択
   - ⚠️ 注意: 後でセキュリティルールを適用します
2. **「次へ」** をクリック

### ステップ 3-3: ロケーションを選択
1. **「asia-northeast1 (東京)」** を選択（推奨）
2. **「完了」** をクリック

### ステップ 3-4: データベース作成完了を確認
- データベースが作成されると、空のコレクション画面が表示されます

---

## 4. セキュリティルールの設定

### ステップ 4-1: セキュリティルールを更新
1. Firestore Database の **「ルール」** タブをクリック
2. 既存のルールを削除
3. 以下のセキュリティルールをコピー＆ペースト

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && 
        request.auth.uid == userId &&
        validateUserData(request.resource.data);
    }
    
    // アンケートは認証済みユーザーが読み取り可能
    match /surveys/{surveyId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && hasAdminRole(request.auth.uid);
    }
    
    // アンケート回答は自分のもののみアクセス可能
    match /surveyResponses/{responseId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId &&
        validateSurveyResponse(request.resource.data);
    }
    
    // 家族グループはメンバーのみアクセス可能
    match /familyGroups/{groupId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.members;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.createdBy &&
        validateFamilyGroup(request.resource.data);
    }
    
    // デモデータは認証済みユーザーが読み取り可能
    match /demoData/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && hasAdminRole(request.auth.uid);
    }
    
    // ヘルパー関数
    function validateUserData(data) {
      return data.keys().hasAll(['email', 'name', 'role']) &&
        data.email is string &&
        data.name is string &&
        data.role in ['user', 'admin'] &&
        data.email.matches('.*@.*\\..*') &&
        data.name.size() > 0 &&
        data.name.size() <= 100;
    }
    
    function validateSurveyResponse(data) {
      return data.keys().hasAll(['userId', 'surveyId', 'answers']) &&
        data.userId is string &&
        data.surveyId is string &&
        data.answers is list &&
        data.answers.size() > 0 &&
        data.answers.size() <= 100;
    }
    
    function validateFamilyGroup(data) {
      return data.keys().hasAll(['name', 'createdBy', 'members']) &&
        data.name is string &&
        data.createdBy is string &&
        data.members is list &&
        data.createdBy in data.members &&
        data.name.size() > 0 &&
        data.name.size() <= 50 &&
        data.members.size() <= 10;
    }
    
    function hasAdminRole(userId) {
      return exists(/databases/$(database)/documents/users/$(userId)) &&
        get(/databases/$(database)/documents/users/$(userId)).data.role == 'admin';
    }
  }
}
```

### ステップ 4-2: ルールを公開
1. **「公開」** ボタンをクリック
2. 確認ダイアログで **「公開」** をクリック

---

## 5. 環境変数の設定

### ステップ 5-1: 環境変数ファイルを作成
プロジェクトのルートディレクトリに `.env.local` ファイルを作成

```env

# Development Settings
VITE_USE_FIREBASE_EMULATOR=false

# Analytics (Optional)
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### ステップ 5-2: 設定値を更新
1. ステップ1-3でコピーした Firebase 設定から値を取得
2. `.env.local` ファイルの各値を実際の値に置き換え

### ステップ 5-3: 設定を確認
```bash
# 開発サーバーを再起動
npm run dev
```

---

## 6. デモアカウントの動作確認

### ステップ 6-1: デモアカウントでログイン
アプリケーションには以下のデモアカウントが用意されています：

**デモアカウント 1:**
- メール: `demo@family-lab.com`
- パスワード: `demo123456`

**デモアカウント 2:**
- メール: `test@family-lab.com`
- パスワード: `test123456`

### ステップ 6-2: 機能テスト
1. **ログイン**: デモアカウントでログイン
2. **プロフィール設定**: 基本情報を入力
3. **アンケート回答**: 夫婦・家族関係診断を完了
4. **結果表示**: 診断結果とグラフを確認
5. **関係改善のヒント**: 改善提案を確認

### ステップ 6-3: Firebase設定後のテスト
Firebase設定完了後は：
1. 新しいアカウントを作成
2. Firebase Console でユーザーデータを確認
3. Firestore でアンケート回答データを確認

---

## 7. トラブルシューティング

### 問題 1: Firebase設定エラー
```
Error: Firebase configuration not found
```

**解決方法:**
1. `.env.local` ファイルが正しく作成されているか確認
2. 環境変数の値が正しく設定されているか確認
3. 開発サーバーを再起動

### 問題 2: 認証エラー
```
Error: auth/operation-not-allowed
```

**解決方法:**
1. Firebase Console > Authentication > Sign-in method
2. 「メール/パスワード」が有効になっているか確認

### 問題 3: Firestore権限エラー
```
Error: permission-denied
```

**解決方法:**
1. Firestore Database > ルール を確認
2. セキュリティルールが正しく設定されているか確認
3. ルールを再公開

### 問題 4: ネットワークエラー
```
Error: network-request-failed
```

**解決方法:**
1. インターネット接続を確認
2. Firebase サービスの状況を確認
3. ファイアウォール設定を確認

### 問題 5: デモアカウントが動作しない

**解決方法:**
1. ブラウザのローカルストレージをクリア
2. ページを再読み込み
3. 別のブラウザで試行

---

## 🎯 設定完了チェックリスト

- [ ] Firebase プロジェクトが作成されている
- [ ] ウェブアプリが追加されている
- [ ] Authentication が有効化されている
- [ ] メール/パスワード認証が有効になっている
- [ ] Firestore Database が作成されている
- [ ] セキュリティルールが適用されている
- [ ] 環境変数が正しく設定されている
- [ ] デモアカウントでログインできる
- [ ] アンケート回答が完了できる
- [ ] 結果表示が正常に動作する

---

## 📞 サポート

設定でお困りの場合は、以下の情報をお知らせください：

1. エラーメッセージの詳細
2. ブラウザの開発者ツールのコンソールログ
3. Firebase Console の設定スクリーンショット
4. 実行した手順

**連絡先**: masato.kourogi@and-adapt.com

---

この設定ガイドに従って Firebase を設定することで、Family Lab アプリケーションが完全に動作するようになります。デモアカウントを使用して、Firebase設定前でもアプリケーションの全機能をお試しいただけます。
