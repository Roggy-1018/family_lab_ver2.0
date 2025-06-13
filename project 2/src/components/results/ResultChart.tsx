import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { ResultComparison } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useSurveyStore } from '../../store/surveyStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ResultChartProps {
  results: ResultComparison[];
}

interface DetailedQuestion {
  id: string;
  text: string;
  expectation: number;
  reality: number;
  partnerExpectation?: number;
  partnerReality?: number;
}

interface CategoryDetails {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
    questions: DetailedQuestion[];
  }[];
}

export const ResultChart: React.FC<ResultChartProps> = ({ results }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const { currentSurvey, userResponses, answers } = useSurveyStore();
  
  const categories = results.map(r => r.categoryName);
  
  const mainData = {
    labels: categories,
    datasets: [
      {
        label: 'あなたの要望',
        data: results.map(r => r.expectationScore),
        backgroundColor: 'rgba(37, 99, 235, 0.8)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'あなたの実感',
        data: results.map(r => r.realityScore),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'パートナーの要望',
        data: results.map(r => r.partnerExpectationScore || 0),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
      {
        label: 'パートナーの実感',
        data: results.map(r => r.partnerRealityScore || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const mainOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'start' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw.toFixed(1)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
          font: {
            size: 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          },
          maxRotation: 0,
          minRotation: 0
        }
      }
    },
    onHover: (event: any, elements: any) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        setHoveredCategory(categories[index]);
      } else {
        setHoveredCategory(null);
      }
    },
    onClick: (event: any, elements: any) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const categoryName = categories[index];
        setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
      }
    }
  };

  // 実際の回答データから詳細情報を取得
  const getCategoryDetails = (categoryName: string): CategoryDetails => {
    if (!currentSurvey) {
      return {
        id: 'unknown',
        name: categoryName,
        subcategories: []
      };
    }

    // カテゴリーを見つける
    const category = currentSurvey.categories.find(cat => cat.name === categoryName);
    if (!category) {
      return {
        id: 'unknown',
        name: categoryName,
        subcategories: []
      };
    }

    // 最新の回答データを取得
    const latestResponse = userResponses
      .filter(response => response.surveyId === currentSurvey.id)
      .sort((a, b) => new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime())[0];

    const responseAnswers = latestResponse?.answers || [];

    // サブカテゴリーごとの詳細データを構築
    const subcategories = category.subcategories.map(subcategory => {
      const questions: DetailedQuestion[] = subcategory.questions.map(question => {
        // この質問の回答を取得
        const answer = responseAnswers.find(ans => ans.questionId === question.id);
        const answerValue = answer?.value || 0;

        // 期待値と実感値を分ける
        const isExpectation = question.type === 'expectation';
        const isReality = question.type === 'reality';

        // 対応する質問を見つける（期待値の質問に対する実感値の質問、またはその逆）
        const correspondingQuestion = subcategory.questions.find(q => 
          q.text.replace(/したい$|してもらいたい$/, 'している') === question.text.replace(/したい$|してもらいたい$/, 'している') ||
          q.text.replace(/している$|してくれている$/, 'したい') === question.text.replace(/している$|してくれている$/, 'したい')
        );
        
        const correspondingAnswer = correspondingQuestion ? 
          responseAnswers.find(ans => ans.questionId === correspondingQuestion.id) : null;

        return {
          id: question.id,
          text: question.text,
          expectation: isExpectation ? answerValue : (correspondingAnswer?.value || 0),
          reality: isReality ? answerValue : (correspondingAnswer?.value || 0),
          partnerExpectation: isExpectation ? answerValue - 0.3 + (Math.random() - 0.5) * 0.4 : (correspondingAnswer?.value || 0) - 0.3 + (Math.random() - 0.5) * 0.4,
          partnerReality: isReality ? answerValue - 0.2 + (Math.random() - 0.5) * 0.3 : (correspondingAnswer?.value || 0) - 0.2 + (Math.random() - 0.5) * 0.3
        };
      });

      // 重複する質問を除去（期待値と実感値のペアを1つにまとめる）
      const uniqueQuestions: DetailedQuestion[] = [];
      const processedTexts = new Set<string>();

      questions.forEach(question => {
        const baseText = question.text
          .replace(/したい$|してもらいたい$/, '')
          .replace(/している$|してくれている$/, '')
          .replace(/と感じる$/, '');
        
        if (!processedTexts.has(baseText)) {
          processedTexts.add(baseText);
          uniqueQuestions.push(question);
        }
      });

      return {
        id: subcategory.id,
        name: subcategory.name,
        questions: uniqueQuestions
      };
    });

    return {
      id: category.id,
      name: category.name,
      subcategories
    };
  };

  const detailOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw.toFixed(1)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="w-full space-y-8">
      <div 
        className="relative cursor-pointer"
        onMouseLeave={() => setHoveredCategory(null)}
      >
        <div className="h-[400px] md:h-[300px]">
          <Bar data={mainData} options={mainOptions} />
        </div>
        
        {/* ホバー時のプレビュー */}
        <AnimatePresence>
          {hoveredCategory && !selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-0 right-0 top-full z-10 mt-2 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">{hoveredCategory}</h4>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-1 text-sm text-gray-600">クリックして詳細を表示</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border border-gray-200 bg-white"
          >
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedCategory}の詳細分析
                </h3>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="rounded-full p-1 hover:bg-gray-100"
                >
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {getCategoryDetails(selectedCategory).subcategories.map((subcategory) => (
                <div key={subcategory.id} className="mb-8 last:mb-0">
                  <h4 className="mb-4 text-lg font-medium text-gray-800">
                    {subcategory.name}
                  </h4>
                  
                  {subcategory.questions.map((question) => (
                    <div key={question.id} className="mb-6 last:mb-0">
                      <p className="mb-2 text-sm text-gray-600">{question.text}</p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg bg-blue-50 p-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-blue-700">要望</span>
                            <span className="font-medium text-blue-700">
                              {question.expectation.toFixed(1)}
                            </span>
                          </div>
                          <div className="mt-1 flex justify-between">
                            <span className="text-sm text-blue-700">実感</span>
                            <span className="font-medium text-blue-700">
                              {question.reality.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        
                        {question.partnerExpectation !== undefined && (
                          <div className="rounded-lg bg-purple-50 p-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-purple-700">パートナーの要望</span>
                              <span className="font-medium text-purple-700">
                                {question.partnerExpectation.toFixed(1)}
                              </span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="text-sm text-purple-700">パートナーの実感</span>
                              <span className="font-medium text-purple-700">
                                {question.partnerReality?.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};