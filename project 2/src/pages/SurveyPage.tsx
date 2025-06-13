import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useSurveyStore } from '../store/surveyStore';
import { useAuthStore } from '../store/authStore';
import { SurveySection } from '../components/survey/SurveySection';
import { SurveyProgress } from '../components/survey/SurveyProgress';
import { motion } from 'framer-motion';

const PAGE_TITLES = {
  1: '感情・コミュニケーション',
  2: '協力・衝突解決',
  3: '価値観・社会的つながり',
  4: '親密感・子育て'
};

export const SurveyPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { 
    fetchSurveyById, 
    currentSurvey, 
    isLoading, 
    currentPage, 
    setCurrentPage,
    answers,
    submitCurrentAnswers
  } = useSurveyStore();
  const { user } = useAuthStore();
  
  useEffect(() => {
    if (surveyId) {
      fetchSurveyById(surveyId);
    }
  }, [surveyId, fetchSurveyById]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handleNext = async () => {
    if (currentPage < 4) {
      setCurrentPage(currentPage + 1);
    } else {
      // 最後のページで回答を送信
      if (user && surveyId) {
        try {
          await submitCurrentAnswers(user.id, surveyId);
          navigate(`/results/${surveyId}`);
        } catch (error) {
          console.error('Failed to submit answers:', error);
          // エラーが発生してもとりあえず結果ページに遷移
          navigate(`/results/${surveyId}`);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 現在のページに回答があるかチェック（より柔軟な判定）
  const hasAnswersForCurrentPage = () => {
    if (!currentSurvey || !currentSurvey.categories[currentPage - 1]) return false;
    
    const category = currentSurvey.categories[currentPage - 1];
    const questions = category.subcategories.flatMap(sub => 
      sub.questions.filter(q => 
        (user?.profile.hasChildren && q.showForParents) ||
        (!user?.profile.hasChildren && q.showForChildless)
      )
    );
    
    // 質問の50%以上に回答があれば次に進める
    const answeredQuestions = questions.filter(q => answers[q.id] !== undefined);
    const answerRate = questions.length > 0 ? answeredQuestions.length / questions.length : 0;
    
    return answerRate >= 0.5; // 50%以上回答していれば次に進める
  };

  // 最終ページかどうかの判定
  const isLastPage = currentPage === 4;

  // 次に進むボタンの有効性
  const canProceed = () => {
    if (isLastPage) {
      // 最終ページでは、何らかの回答があれば完了可能
      return Object.keys(answers).length > 0;
    }
    // 中間ページでは、現在のページに一定の回答があれば次に進める
    return hasAnswersForCurrentPage();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="text-lg text-gray-600">アンケートを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (!currentSurvey || !user?.profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">アンケートが見つかりませんでした。</p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="mt-4"
          >
            ダッシュボードに戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <SurveyProgress currentStep={currentPage} totalSteps={4} />

          <Card variant="elevated" className="mb-8">
            <CardHeader className="bg-blue-50 px-6 py-5">
              <CardTitle className="text-2xl text-blue-900">
                ページ {currentPage} / 4: {PAGE_TITLES[currentPage as keyof typeof PAGE_TITLES]}
              </CardTitle>
              <p className="mt-2 text-blue-700">
                以下の質問について、あなたの要望と実感を教えてください。
              </p>
            </CardHeader>
            
            <CardContent className="px-6 py-5">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SurveySection
                  survey={currentSurvey}
                  pageNumber={currentPage}
                  userProfile={user.profile}
                />
              </motion.div>
              
              <div className="mt-8 flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                >
                  前のページへ
                </Button>
                
                <div className="flex flex-col items-end space-y-2">
                  <Button 
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    {isLastPage ? '回答を完了する' : '次のページへ'}
                  </Button>
                  
                  {!canProceed() && (
                    <p className="text-sm text-gray-500">
                      {isLastPage 
                        ? 'いくつかの質問に回答してから完了してください'
                        : 'いくつかの質問に回答してから次のページに進んでください'
                      }
                    </p>
                  )}
                </div>
              </div>
              
              {/* 進行状況の表示 */}
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>回答済み質問数:</span>
                  <span className="font-medium">
                    {Object.keys(answers).length} / {
                      currentSurvey.categories.flatMap(cat => 
                        cat.subcategories.flatMap(sub => 
                          sub.questions.filter(q => 
                            (user?.profile.hasChildren && q.showForParents) ||
                            (!user?.profile.hasChildren && q.showForChildless)
                          )
                        )
                      ).length
                    }
                  </span>
                </div>
                <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (Object.keys(answers).length / 
                        currentSurvey.categories.flatMap(cat => 
                          cat.subcategories.flatMap(sub => 
                            sub.questions.filter(q => 
                              (user?.profile.hasChildren && q.showForParents) ||
                              (!user?.profile.hasChildren && q.showForChildless)
                            )
                          )
                        ).length) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};