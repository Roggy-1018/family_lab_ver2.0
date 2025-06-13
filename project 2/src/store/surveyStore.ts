import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Survey, SurveyResponse, ResultComparison } from '../types';
import { 
  getSurveys as getFirebaseSurveys,
  getSurveyById as getFirebaseSurveyById,
  saveSurveyResponse,
  getUserSurveyResponses
} from '../lib/firebaseService';

interface SurveyState {
  surveys: Survey[];
  currentSurvey: Survey | null;
  currentPage: number;
  userResponses: SurveyResponse[];
  isLoading: boolean;
  results: ResultComparison[];
  answers: Record<string, number>;
  
  // アクション
  fetchSurveys: () => Promise<void>;
  fetchSurveyById: (id: string) => Promise<void>;
  submitResponse: (response: SurveyResponse) => Promise<void>;
  fetchResults: (surveyId: string) => Promise<void>;
  fetchUserResponses: (userId: string) => Promise<void>;
  setCurrentPage: (page: number) => void;
  setAnswer: (questionId: string, value: number) => void;
  calculateResults: (surveyData: any, answers: any[]) => ResultComparison[];
  submitCurrentAnswers: (userId: string, surveyId: string) => Promise<void>;
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set, get) => ({
      surveys: [],
      currentSurvey: null,
      currentPage: 1,
      userResponses: [],
      isLoading: false,
      results: [],
      answers: {},
      
      // 現在のページを設定
      setCurrentPage: (page: number) => set({ currentPage: page }),
      
      // 回答を設定
      setAnswer: (questionId: string, value: number) => 
        set(state => ({
          answers: {
            ...state.answers,
            [questionId]: value
          }
        })),

      // 結果を計算
      calculateResults: (surveyData: any, answers: any[]) => {
        const results: ResultComparison[] = [];
        
        if (!surveyData?.categories) {
          console.log('❌ surveyData.categories が存在しません');
          return results;
        }

        console.log('📊 結果計算開始:', {
          categoriesCount: surveyData.categories.length,
          answersCount: answers.length,
          categories: surveyData.categories.map((c: any) => c.name)
        });

        // 各カテゴリーの結果を計算
        surveyData.categories.forEach((category: any, categoryIndex: number) => {
          console.log(`📋 カテゴリー ${categoryIndex + 1}: ${category.name}`);
          
          // このカテゴリーに属する質問を取得
          const categoryQuestions = category.subcategories.flatMap((sub: any) => 
            sub.questions.map((q: any) => ({
              ...q,
              subcategoryName: sub.name
            }))
          );

          console.log(`  質問数: ${categoryQuestions.length}`);
          
          // このカテゴリーの回答を抽出
          const categoryAnswers = answers.filter(answer => 
            categoryQuestions.some(q => q.id === answer.questionId)
          );

          console.log(`  回答数: ${categoryAnswers.length}`);

          if (categoryAnswers.length === 0) {
            console.log(`  ⚠️ ${category.name} に回答がありません`);
            // 回答がない場合でもデフォルト値で結果を作成
            results.push({
              categoryId: category.id,
              categoryName: category.name,
              expectationScore: 0,
              realityScore: 0,
              gap: 0
            });
            return;
          }

          // 期待値の回答を抽出
          const expectationAnswers = categoryAnswers.filter(answer => {
            const question = categoryQuestions.find(q => q.id === answer.questionId);
            return question && question.type === 'expectation';
          });

          // 実感値の回答を抽出
          const realityAnswers = categoryAnswers.filter(answer => {
            const question = categoryQuestions.find(q => q.id === answer.questionId);
            return question && question.type === 'reality';
          });

          console.log(`  期待値回答: ${expectationAnswers.length}件`);
          console.log(`  実感値回答: ${realityAnswers.length}件`);

          // 平均スコアを計算
          const expectationScore = expectationAnswers.length > 0 
            ? expectationAnswers.reduce((sum, answer) => sum + answer.value, 0) / expectationAnswers.length
            : 3; // デフォルト値

          const realityScore = realityAnswers.length > 0 
            ? realityAnswers.reduce((sum, answer) => sum + answer.value, 0) / realityAnswers.length
            : 3; // デフォルト値

          const gap = Math.abs(expectationScore - realityScore);

          console.log(`  期待値平均: ${expectationScore.toFixed(2)}`);
          console.log(`  実感値平均: ${realityScore.toFixed(2)}`);
          console.log(`  ギャップ: ${gap.toFixed(2)}`);

          results.push({
            categoryId: category.id,
            categoryName: category.name,
            expectationScore,
            realityScore,
            gap
          });
        });

        console.log('✅ 結果計算完了:', results);
        return results;
      },

      // 現在の回答を送信
      submitCurrentAnswers: async (userId: string, surveyId: string) => {
        const { answers } = get();
        
        // answersオブジェクトを配列形式に変換
        const answerArray = Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value
        }));

        console.log('📤 回答送信:', {
          userId,
          surveyId,
          answersCount: answerArray.length,
          answers: answerArray
        });

        const response: Omit<SurveyResponse, 'id'> = {
          userId,
          surveyId,
          answers: answerArray,
          completedAt: new Date().toISOString(),
          startedAt: new Date().toISOString()
        };

        await get().submitResponse(response);
        
        // 回答送信後、ユーザーの回答履歴を再取得
        await get().fetchUserResponses(userId);
        
        // 回答をクリア
        set({ answers: {}, currentPage: 1 });
      },

      // アンケート一覧を取得
      fetchSurveys: async () => {
        set({ isLoading: true });
        try {
          const surveys = await getFirebaseSurveys();
          set({ surveys });
          console.log('✅ アンケート一覧取得成功:', surveys.length, '件');
        } catch (error) {
          console.error('❌ アンケート一覧の取得に失敗:', error);
          // エラー時はデモデータを使用
          set({ surveys: [] });
        } finally {
          set({ isLoading: false });
        }
      },

      // 特定のアンケートを取得
      fetchSurveyById: async (id: string) => {
        set({ isLoading: true });
        try {
          const survey = await getFirebaseSurveyById(id);
          if (survey) {
            set({ currentSurvey: survey });
            console.log('✅ アンケート取得成功:', survey.title);
          }
        } catch (error) {
          console.error('❌ アンケートの取得に失敗:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // ユーザーの回答履歴を取得
      fetchUserResponses: async (userId: string) => {
        set({ isLoading: true });
        try {
          const responses = await getUserSurveyResponses(userId);
          set({ userResponses: responses });
          console.log('✅ ユーザー回答履歴取得成功:', responses.length, '件');
          console.log('📊 回答データ:', responses);
        } catch (error) {
          console.error('❌ ユーザー回答履歴の取得に失敗:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // アンケート回答を送信
      submitResponse: async (response: SurveyResponse) => {
        set({ isLoading: true });
        try {
          const responseId = await saveSurveyResponse(response);
          const newResponse = { ...response, id: responseId };
          
          set(state => ({
            userResponses: [...state.userResponses, newResponse]
          }));
          
          console.log('✅ 回答送信成功:', responseId);
        } catch (error) {
          console.error('❌ 回答の送信に失敗:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 結果を取得
      fetchResults: async (surveyId: string) => {
        set({ isLoading: true });
        try {
          const { userResponses, currentSurvey } = get();
          
          // 指定されたsurveyIdの最新の回答を取得
          const latestResponse = userResponses
            .filter(response => response.surveyId === surveyId)
            .sort((a, b) => new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime())[0];

          if (!latestResponse) {
            console.log('❌ 指定されたsurveyIdの回答が見つかりません:', surveyId);
            set({ results: [] });
            return;
          }

          console.log('📊 最新の回答データ:', latestResponse);

          // アンケートデータを取得
          let survey = currentSurvey;
          if (!survey || survey.id !== surveyId) {
            await get().fetchSurveyById(surveyId);
            survey = get().currentSurvey;
          }

          if (!survey) {
            console.log('❌ アンケートデータが見つかりません:', surveyId);
            set({ results: [] });
            return;
          }

          // 回答データから結果を計算
          const calculatedResults = get().calculateResults(survey, latestResponse.answers);
          set({ results: calculatedResults });
          console.log('✅ 結果計算成功:', calculatedResults.length, '件');
        } catch (error) {
          console.error('❌ 結果の取得に失敗:', error);
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'survey-storage',
      partialize: (state) => ({
        answers: state.answers,
        currentPage: state.currentPage,
        userResponses: state.userResponses // 回答履歴も永続化
      })
    }
  )
);