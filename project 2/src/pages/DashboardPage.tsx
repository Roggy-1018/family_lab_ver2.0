import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { useSurveyStore } from '../store/surveyStore';
import { useRelationshipTipsStore } from '../store/relationshipTipsStore';
import { BarChart3, Users, Heart, MessageSquare, Phone, CheckCircle, Clock, ArrowRight, Target } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchSurveys, surveys, userResponses, results, fetchUserResponses } = useSurveyStore();
  const { focusedActions } = useRelationshipTipsStore();
  
  useEffect(() => {
    // アンケート一覧を取得
    fetchSurveys();
    
    // ユーザーの回答履歴を取得
    if (user?.id) {
      fetchUserResponses(user.id);
    }
  }, [fetchSurveys, fetchUserResponses, user?.id]);

  // プロフィール完成度を計算
  const calculateProfileProgress = () => {
    if (!user?.profile) return 0;
    
    const requiredFields = [
      'birthDate',
      'gender',
      'marriageDate',
      'occupation',
      'prefecture'
    ];
    
    const completedFields = requiredFields.filter(field => 
      user.profile[field as keyof typeof user.profile]
    );
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const profileProgress = calculateProfileProgress();
  
  // プロフィール完成度のチャートデータ
  const profileChartData = {
    labels: ['完了', '未完了'],
    datasets: [
      {
        data: [profileProgress, 100 - profileProgress],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(229, 231, 235, 0.5)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(229, 231, 235, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    },
    maintainAspectRatio: false
  };

  // 完了したアンケートを取得（複数回答を考慮）
  const completedSurveys = userResponses.map((response, index) => {
    const survey = surveys.find(s => s.id === response.surveyId);
    if (survey) {
      return {
        id: `${survey.id}-${index}`, // 複数回答を区別するためのユニークID
        title: survey.title,
        description: survey.description,
        completedAt: response.completedAt,
        responseId: response.id,
        surveyId: survey.id,
        responseIndex: index + 1 // 何回目の回答かを表示
      };
    }
    return null;
  }).filter(Boolean);

  // 利用可能なアンケート（常に表示）
  const availableSurveys = surveys;

  // 注力アクションの進捗計算
  const completedActions = focusedActions.filter(action => action.isCompleted).length;
  const totalActions = focusedActions.length;
  const actionProgress = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  // デバッグ用ログ
  console.log('Dashboard Debug Info:', {
    surveys: surveys.length,
    userResponses: userResponses.length,
    completedSurveys: completedSurveys.length,
    availableSurveys: availableSurveys.length,
    userResponsesData: userResponses,
    surveysData: surveys,
    focusedActionsCount: focusedActions.length,
    actionProgress: actionProgress
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ようこそ、{user?.name}さん</h1>
          <p className="mt-2 text-gray-600">Family Labで家族関係の診断を始めましょう</p>
        </div>
        
        {/* メインコンテンツグリッド */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* プロフィール完成度 */}
          <Card className="flex h-full flex-col bg-white">
            <CardHeader className="bg-blue-50 px-6 py-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 flex-shrink-0 text-blue-600" />
                <CardTitle className="text-base font-semibold">プロフィール</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-grow flex-col p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="relative h-32 w-32">
                  <Doughnut data={profileChartData} options={chartOptions} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">{profileProgress}%</span>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t text-center">
                <Link 
                  to="/profile"
                  className="inline-block w-full py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  プロフィールを更新
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 診断アンケート */}
          <Card className="flex h-full flex-col bg-white">
            <CardHeader className="bg-green-50 px-6 py-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 flex-shrink-0 text-green-600" />
                <CardTitle className="text-base font-semibold">夫婦・家族関係診断</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-grow flex-col p-6">
              <div className="space-y-4 flex-grow">
                {availableSurveys.length > 0 ? (
                  availableSurveys.map(survey => (
                    <div key={survey.id} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2 text-sm">{survey.title}</h3>
                      <p className="text-xs text-gray-600 mb-3">{survey.description}</p>
                      <Link 
                        to={`/survey/${survey.id}`}
                        className="inline-block w-full py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors text-center text-sm"
                      >
                        {userResponses.some(r => r.surveyId === survey.id) ? '再度回答する' : '回答する'}
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center flex-grow">
                    <div className="text-center">
                      <Heart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <p className="text-gray-600 text-sm">診断アンケートを読み込んでいます...</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 診断結果 */}
          <Card className="flex h-full flex-col bg-white">
            <CardHeader className="bg-purple-50 px-6 py-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 flex-shrink-0 text-purple-600" />
                <CardTitle className="text-base font-semibold">診断結果</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-grow flex-col p-6">
              {completedSurveys.length > 0 ? (
                <div className="space-y-3 flex-grow">
                  {completedSurveys.map(survey => (
                    <div key={survey.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm">{survey.title}</h3>
                          {survey.responseIndex > 1 && (
                            <span className="text-xs text-blue-600">({survey.responseIndex}回目)</span>
                          )}
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>完了日: {survey.completedAt ? new Date(survey.completedAt).toLocaleDateString('ja-JP') : '不明'}</span>
                      </div>
                      <Link 
                        to={`/results/${survey.surveyId}`}
                        className="inline-flex w-full items-center justify-center py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors text-sm"
                      >
                        結果を見る
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center flex-grow">
                  <div className="text-center">
                    <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="text-gray-600 text-sm">診断に回答すると結果が表示されます</p>
                  </div>
                </div>
              )}
              
              {completedSurveys.length > 1 && (
                <div className="mt-auto pt-4 border-t text-center">
                  <Link 
                    to="/results/comparison"
                    className="inline-block w-full py-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors text-sm"
                  >
                    すべての結果を比較
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* パートナー連携 */}
          <Card className="flex h-full flex-col bg-white">
            <CardHeader className="bg-blue-50 px-6 py-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 flex-shrink-0 text-blue-600" />
                <CardTitle className="text-base font-semibold">パートナー連携</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-grow flex-col p-6">
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600 text-sm">連携状態</span>
                  <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-600 text-xs">未連携</span>
                </div>
                <p className="text-gray-600 text-sm">パートナーと連携すると、より正確な分析が可能になります。</p>
              </div>
              <div className="mt-auto pt-4 border-t text-center">
                <Link 
                  to="/invite-partner"
                  className="inline-block w-full py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-sm"
                >
                  パートナーを招待
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* 関係改善のヒント */}
          <Card className="flex h-full flex-col bg-white">
            <CardHeader className="bg-amber-50 px-6 py-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 flex-shrink-0 text-amber-600" />
                <CardTitle className="text-base font-semibold">注力アクション</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-grow flex-col p-6">
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="text-gray-600 mb-4 text-sm">選択した改善アクションの進捗状況です。</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>注力アクション数</span>
                    <span>{totalActions}件</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>完了済み</span>
                    <span>{completedActions}件</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">進捗率</span>
                    <span className="text-sm font-medium">{actionProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${actionProgress}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t text-center">
                <Link 
                  to="/relationship-tips"
                  className="inline-block w-full py-2 text-amber-600 hover:bg-amber-50 rounded-md transition-colors text-sm"
                >
                  改善アクションを管理
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* 専門家のアドバイス */}
          <Card className="flex h-full flex-col bg-white">
            <CardHeader className="bg-indigo-50 px-6 py-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 flex-shrink-0 text-indigo-600" />
                <CardTitle className="text-base font-semibold">専門家のアドバイス</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-grow flex-col p-6">
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="text-gray-600 text-sm">経験豊富な専門家に相談して、より深いアドバイスを受けることができます。</p>
              </div>
              <div className="mt-auto pt-4 border-t text-center">
                <Link 
                  to="/consult-expert"
                  className="inline-block w-full py-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors text-sm"
                >
                  専門家に相談する
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};