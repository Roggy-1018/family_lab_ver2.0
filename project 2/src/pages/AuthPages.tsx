import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { Heart, CheckCircle, AlertCircle } from 'lucide-react';
import { FirebaseStatus } from '../components/firebase/FirebaseStatus';
import { DemoAccountInfo } from '../components/auth/DemoAccountInfo';

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<AuthFormData>>({});
  const [loginError, setLoginError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // エラーをクリア
    if (errors[name as keyof AuthFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  const validate = () => {
    const newErrors: Partial<AuthFormData> = {};
    
    if (!formData.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    
    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error: any) {
      setLoginError(error.message);
    }
  };

  const handleDemoLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      setLoginError(error.message);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Firebase接続状況 */}
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <FirebaseStatus />
        </div>

        {/* デモアカウント情報 */}
        <DemoAccountInfo onDemoLogin={handleDemoLogin} isLoading={isLoading} />

        <Card variant="elevated" className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Family Labにログイン</CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* ログインエラー表示 */}
              {loginError && (
                <div className="rounded-lg bg-red-50 p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-red-700">{loginError}</p>
                  </div>
                </div>
              )}
              
              <Input
                label="メールアドレス"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="your@email.com"
                fullWidth
              />
              
              <Input
                label="パスワード"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
                fullWidth
              />
              
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    ログイン状態を保持
                  </label>
                </div>
                
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  パスワードをお忘れですか？
                </Link>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col">
              <Button
                type="submit"
                isLoading={isLoading}
                fullWidth
              >
                ログイン
              </Button>
              
              <p className="mt-4 text-center text-sm text-gray-600">
                アカウントをお持ちでない方は{' '}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  新規登録
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [formData, setFormData] = useState<AuthFormData>({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<AuthFormData>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // エラーをクリア
    if (errors[name as keyof AuthFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (registrationError) {
      setRegistrationError('');
    }
  };

  const validate = () => {
    const newErrors: Partial<AuthFormData> = {};
    
    if (!formData.name) {
      newErrors.name = 'お名前を入力してください';
    }
    
    if (!formData.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    
    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await register(formData.email, formData.password, formData.name || '');
      setRegistrationSuccess(true);
      
      // 3秒後にプロフィール設定ページに遷移
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    } catch (error: any) {
      setRegistrationError(error.message);
    }
  };

  const handleDemoLogin = async (email: string, password: string) => {
    try {
      await register(email, password, 'デモユーザー');
      setRegistrationSuccess(true);
      
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error: any) {
      setRegistrationError(error.message);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
        <Card variant="elevated" className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">登録完了！</CardTitle>
          </CardHeader>
          
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-gray-700">
                アカウントの登録が完了しました。
              </p>
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm text-green-800">
                  🎉 ユーザー情報が正常に保存されました。
                </p>
                <p className="mt-2 text-xs text-green-600">
                  デモモードまたはFirebaseで管理されています。
                </p>
              </div>
              <p className="text-sm text-gray-600">
                まずはプロフィール情報を設定しましょう。
                <br />
                3秒後に自動的に移動します...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Firebase接続状況 */}
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <FirebaseStatus />
        </div>

        {/* デモアカウント情報 */}
        <DemoAccountInfo onDemoLogin={handleDemoLogin} isLoading={isLoading} />

        <Card variant="elevated" className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">アカウントを作成</CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* 登録エラー表示 */}
              {registrationError && (
                <div className="rounded-lg bg-red-50 p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-red-700">{registrationError}</p>
                  </div>
                </div>
              )}
              
              <Input
                label="お名前"
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                error={errors.name}
                placeholder="山田 太郎"
                fullWidth
              />
              
              <Input
                label="メールアドレス"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="your@email.com"
                fullWidth
              />
              
              <Input
                label="パスワード"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
                fullWidth
              />
              
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  <Link
                    to="/terms"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    利用規約
                  </Link>
                  {' '}と{' '}
                  <Link
                    to="/privacy"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    プライバシーポリシー
                  </Link>
                  に同意します
                </label>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col">
              <Button
                type="submit"
                isLoading={isLoading}
                fullWidth
              >
                登録する
              </Button>
              
              <p className="mt-4 text-center text-sm text-gray-600">
                すでにアカウントをお持ちの方は{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  ログイン
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};