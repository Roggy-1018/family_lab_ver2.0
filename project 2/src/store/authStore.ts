import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { 
  registerWithEmailAndPassword,
  loginWithEmailAndPassword,
  logout as firebaseLogout,
  onAuthStateChange,
  createUser,
  getUserById,
  updateUser,
  createFamilyGroup,
  addUserToFamilyGroup
} from '../lib/firebaseService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<User['profile']>) => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // 認証状態の初期化
      initializeAuth: () => {
        // Firebase認証状態の監視を開始
        onAuthStateChange(async (firebaseUser) => {
          if (firebaseUser) {
            try {
              // Firestoreからユーザー情報を取得
              const userData = await getUserById(firebaseUser.uid);
              if (userData) {
                set({ 
                  user: userData,
                  isAuthenticated: true 
                });
              } else {
                // Firestoreにユーザー情報がない場合は作成
                const newUserData = {
                  email: firebaseUser.email || '',
                  name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
                  familyId: '',
                  role: 'user' as const,
                  profile: { hasChildren: false }
                };
                
                await createUser(newUserData);
                
                // 家族グループを作成
                const familyGroupId = await createFamilyGroup({
                  name: `${newUserData.name}の家族`,
                  createdBy: firebaseUser.uid
                });
                
                // ユーザーに家族グループIDを設定
                await updateUser(firebaseUser.uid, { familyId: familyGroupId });
                
                const updatedUser = await getUserById(firebaseUser.uid);
                if (updatedUser) {
                  set({ 
                    user: updatedUser,
                    isAuthenticated: true 
                  });
                }
              }
            } catch (error) {
              console.error('ユーザー情報の取得に失敗:', error);
              set({ user: null, isAuthenticated: false });
            }
          } else {
            set({ user: null, isAuthenticated: false });
          }
        });
      },

      // ログイン処理
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          // 入力値の検証
          if (!email || !password) {
            throw new Error('メールアドレスとパスワードを入力してください');
          }

          // Firebase認証でログイン
          const firebaseUser = await loginWithEmailAndPassword(email, password);
          
          // Firestoreからユーザー情報を取得
          const userData = await getUserById(firebaseUser.uid);
          if (userData) {
            set({ 
              user: userData,
              isAuthenticated: true 
            });
          } else {
            throw new Error('ユーザー情報が見つかりません');
          }

        } catch (error: any) {
          console.error('ログインに失敗:', error);
          
          // Firebase認証エラーを日本語に変換
          let errorMessage = 'ログインに失敗しました';
          if (error.code === 'auth/user-not-found') {
            errorMessage = 'ユーザーが見つかりません';
          } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'パスワードが正しくありません';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = '無効なメールアドレスです';
          }
          
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      // 新規登録処理
      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true });
        
        try {
          // 入力値の検証
          if (!email || !password || !name) {
            throw new Error('すべての項目を入力してください');
          }

          if (password.length < 6) {
            throw new Error('パスワードは6文字以上である必要があります');
          }

          // Firebase認証でユーザー作成
          const firebaseUser = await registerWithEmailAndPassword(email, password);
          
          // Firestoreにユーザー情報を保存
          const userData = {
            email,
            name,
            familyId: '',
            role: 'user' as const,
            profile: { hasChildren: false }
          };
          
          await createUser(userData);
          
          // 家族グループを作成
          const familyGroupId = await createFamilyGroup({
            name: `${name}の家族`,
            createdBy: firebaseUser.uid
          });
          
          // ユーザーに家族グループIDを設定
          await updateUser(firebaseUser.uid, { familyId: familyGroupId });
          
          // 更新されたユーザー情報を取得
          const updatedUser = await getUserById(firebaseUser.uid);
          if (updatedUser) {
            set({ 
              user: updatedUser,
              isAuthenticated: true 
            });
          }

        } catch (error: any) {
          console.error('登録に失敗:', error);
          
          // Firebase認証エラーを日本語に変換
          let errorMessage = '登録に失敗しました';
          if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'このメールアドレスは既に使用されています';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = '無効なメールアドレスです';
          } else if (error.code === 'auth/weak-password') {
            errorMessage = 'パスワードが弱すぎます';
          }
          
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      // ログアウト処理
      logout: async () => {
        try {
          await firebaseLogout();
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error('ログアウトに失敗:', error);
        }
      },

      // プロフィール更新処理
      updateProfile: async (profile: Partial<User['profile']>) => {
        const { user } = get();
        if (!user) {
          throw new Error('ユーザーが認証されていません');
        }

        try {
          const updatedProfile = {
            ...user.profile,
            ...profile,
          };

          // Firestoreのユーザー情報を更新
          await updateUser(user.id, { profile: updatedProfile });
          
          // ローカル状態を更新
          set(state => ({
            user: state.user ? {
              ...state.user,
              profile: updatedProfile,
            } : null,
          }));
        } catch (error) {
          console.error('プロフィール更新に失敗:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);