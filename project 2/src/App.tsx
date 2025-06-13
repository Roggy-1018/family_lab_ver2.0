import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { SurveyPage } from './pages/SurveyPage';
import { ResultsPage } from './pages/ResultsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReferencesPage } from './pages/ReferencesPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { ProfilePage } from './pages/ProfilePage';
import { InvitePartnerPage } from './pages/InvitePartnerPage';
import { ConsultExpertPage } from './pages/ConsultExpertPage';
import { RelationshipTipsPage } from './pages/RelationshipTipsPage';
import { FirebaseStatus } from './components/firebase/FirebaseStatus';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { useAuthStore } from './store/authStore';

// ページ遷移時に自動的にトップにスクロール
const ScrollToTop: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return <>{children}</>;
};

// 認証が必要なページを保護するコンポーネント
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { initializeAuth } = useAuthStore();

  // アプリケーション起動時に認証状態を初期化
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <ScrollToTop>
        <div className="flex min-h-screen flex-col">
          <Header />
          
          <main className="flex-1">
            <Routes>
              {/* 公開ページ */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/references" element={<ReferencesPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/firebase-status" element={<FirebaseStatus />} />
              
              {/* 認証が必要なページ */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/invite-partner" 
                element={
                  <ProtectedRoute>
                    <InvitePartnerPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/survey/:surveyId" 
                element={
                  <ProtectedRoute>
                    <SurveyPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/results/:surveyId" 
                element={
                  <ProtectedRoute>
                    <ResultsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/consult-expert" 
                element={
                  <ProtectedRoute>
                    <ConsultExpertPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/relationship-tips" 
                element={
                  <ProtectedRoute>
                    <RelationshipTipsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* 存在しないページは自動的にホームページにリダイレクト */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </ScrollToTop>
    </Router>
  );
}

export default App;