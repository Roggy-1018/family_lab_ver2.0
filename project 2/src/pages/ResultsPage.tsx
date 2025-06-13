import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSurveyStore } from '../store/surveyStore';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ResultChart } from '../components/results/ResultChart';
import { Info, ArrowRight, CheckCircle } from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { 
    fetchResults, 
    results, 
    isLoading, 
    surveys, 
    userResponses,
    currentSurvey,
    fetchSurveyById
  } = useSurveyStore();
  const { user } = useAuthStore();

  const completedSurveys = userResponses.map(response => 
    surveys.find(survey => survey?.id === response.surveyId)
  ).filter(Boolean);

  const familySurvey = completedSurveys.find(survey => survey?.title === '夫婦・家族関係診断');
  
  useEffect(() => {
    if (surveyId) {
      console.log('🔍 結果ページ初期化:', surveyId);
      // 結果を取得（最新の回答データから計算）
      fetchResults(surveyId);
    }
  }, [surveyId, fetchResults]);

  // モックパートナーデータを追加して可視化
  const resultsWithPartner = results.map(result => ({
    ...result,
    partnerExpectationScore: result.expectationScore - 0.3 + (Math.random() - 0.5) * 0.4,
    partnerRealityScore: result.realityScore - 0.2 + (Math.random() - 0.5) * 0.3,
    partnerGap: result.gap - 0.1 + (Math.random() - 0.5) * 0.2
  }));
  
  const hasPartnerResults = true; // 常にパートナー結果セクションを表示

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-lg text-gray-600">結果を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  // 結果がない場合の表示
  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <Card variant="elevated" className="text-center">
              <CardContent className="p-12">
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <h1 className="mb-4 text-2xl font-bold text-gray-900">
                  アンケートが完了しました！
                </h1>
                <p className="mb-6 text-gray-600">
                  ご回答いただき、ありがとうございました。<br />
                  結果の分析を行っています。しばらくお待ちください。
                </p>
                <Button onClick={() => navigate('/dashboard')}>
                  ダッシュボードに戻る
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                夫婦・家族関係診断の結果
              </h1>
              <p className="text-xl text-gray-600">
                あなたの回答から見えてきた関係性の分析結果です
              </p>
            </div>
          </div>
          
          <Card variant="outline" className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="flex items-start space-x-4 p-4">
              <Info className="mt-1 h-5 w-5 flex-shrink-0 text-blue-500" />
              <div>
                <h3 className="font-medium text-blue-800">診断結果について</h3>
                <p className="text-blue-700">
                  この結果は、あなたの回答に基づいて算出されています。パートナーも診断を完了すると、より詳細な比較分析が可能になります。
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card variant="elevated" className="mb-8">
            <CardHeader>
              <CardTitle>診断結果の概要</CardTitle>
              <p className="text-sm text-gray-600">
                4つの主要カテゴリーでの期待と実感のギャップを表示しています
              </p>
            </CardHeader>
            
            <CardContent>
              <ResultChart results={resultsWithPartner} />
              
              {/* カテゴリー別詳細 */}
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">カテゴリー別詳細</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {results.map((result) => (
                    <div key={result.categoryId} className="rounded-lg border border-gray-200 p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{result.categoryName}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">期待値:</span>
                          <span className="font-medium">{result.expectationScore.toFixed(1)}/5.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">実感値:</span>
                          <span className="font-medium">{result.realityScore.toFixed(1)}/5.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ギャップ:</span>
                          <span className={`font-medium ${
                            result.gap >= 1.5 ? 'text-red-600' : 
                            result.gap >= 1.0 ? 'text-orange-600' : 
                            result.gap >= 0.5 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {result.gap.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>今後に向けて</CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="mb-6">
                <Link 
                  to="/relationship-tips"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <span>関係改善のヒントを見る</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4">
                  <h3 className="mb-2 font-medium text-blue-800">結果について話し合ってみましょう</h3>
                  <p className="text-blue-700">
                    この分析結果をパートナーと共有し、お互いの期待や感じていることについて話し合ってみましょう。
                  </p>
                </div>
                
                <div className="rounded-lg bg-green-50 p-4">
                  <h3 className="mb-2 font-medium text-green-800">ギャップの大きい項目に注目</h3>
                  <p className="text-green-700">
                    期待と実感の差が大きい項目は、改善の余地が大きい部分です。優先的に取り組むことで、関係性の向上が期待できます。
                  </p>
                </div>
                
                <div className="rounded-lg bg-purple-50 p-4">
                  <h3 className="mb-2 font-medium text-purple-800">専門家のサポート</h3>
                  <p className="text-purple-700">
                    複数の項目で大きなギャップがある場合は、カウンセラーや専門家に相談することも検討してみましょう。
                  </p>
                </div>
                
                <div className="rounded-lg bg-amber-50 p-4">
                  <h3 className="mb-2 font-medium text-amber-800">定期的な診断</h3>
                  <p className="text-amber-700">
                    3-6ヶ月後に再度診断を行い、改善の進捗を確認することをおすすめします。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};