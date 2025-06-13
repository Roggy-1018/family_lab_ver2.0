import { Survey } from '../types';

/**
 * デモ用のアンケートデータ
 */
export const demoSurveys: Survey[] = [
  {
    id: '1',
    title: '夫婦・家族関係診断',
    description: '夫婦・家族関係の現状を診断します',
    categories: [
      {
        id: 'cat1',
        name: '感情・コミュニケーション',
        description: '感情的なつながりとコミュニケーションについて',
        subcategories: [
          {
            id: 'sub1',
            name: '情緒的つながり',
            description: '感情の理解と共感について',
            questions: [
              {
                id: 'q1_exp',
                text: 'パートナーに自分の気持ちを理解し、共感してもらいたい',
                type: 'expectation',
                categoryId: 'cat1',
                subcategoryId: 'sub1',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q1_real',
                text: 'パートナーは自分の気持ちを理解し、共感してくれていると感じる',
                type: 'reality',
                categoryId: 'cat1',
                subcategoryId: 'sub1',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q2_exp',
                text: 'パートナーに日常的に愛情を表現してもらいたい',
                type: 'expectation',
                categoryId: 'cat1',
                subcategoryId: 'sub1',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q2_real',
                text: 'パートナーは日常的に愛情を表現してくれている',
                type: 'reality',
                categoryId: 'cat1',
                subcategoryId: 'sub1',
                showForChildless: true,
                showForParents: true
              }
            ],
            showForChildless: true,
            showForParents: true
          },
          {
            id: 'sub2',
            name: 'コミュニケーション',
            description: '日常的な対話について',
            questions: [
              {
                id: 'q3_exp',
                text: 'お互いにオープンに話し合い、意見交換をしたい',
                type: 'expectation',
                categoryId: 'cat1',
                subcategoryId: 'sub2',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q3_real',
                text: 'お互いにオープンに話し合え、意見交換ができていると感じる',
                type: 'reality',
                categoryId: 'cat1',
                subcategoryId: 'sub2',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q4_exp',
                text: '困りごとや悩みを正直に話せる雰囲気を作りたい',
                type: 'expectation',
                categoryId: 'cat1',
                subcategoryId: 'sub2',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q4_real',
                text: '困りごとや悩みを正直に話せる雰囲気があると感じる',
                type: 'reality',
                categoryId: 'cat1',
                subcategoryId: 'sub2',
                showForChildless: true,
                showForParents: true
              }
            ],
            showForChildless: true,
            showForParents: true
          }
        ]
      },
      {
        id: 'cat2',
        name: '協力・衝突解決',
        description: '協力体制と問題解決について',
        subcategories: [
          {
            id: 'sub3',
            name: '共同性・協力体制',
            description: '日常生活での協力について',
            questions: [
              {
                id: 'q5_exp',
                text: 'パートナー（家族）に家事や仕事などをしっかりサポートしてもらいたい',
                type: 'expectation',
                categoryId: 'cat2',
                subcategoryId: 'sub3',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q5_real',
                text: 'パートナー（家族）は家事や仕事などをしっかりサポートしてくれている',
                type: 'reality',
                categoryId: 'cat2',
                subcategoryId: 'sub3',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q6_exp',
                text: '夫婦（家族）間で納得のいく形の役割分担をしたい',
                type: 'expectation',
                categoryId: 'cat2',
                subcategoryId: 'sub3',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q6_real',
                text: '夫婦（家族）間で納得のいく形の役割分担ができている',
                type: 'reality',
                categoryId: 'cat2',
                subcategoryId: 'sub3',
                showForChildless: true,
                showForParents: true
              }
            ],
            showForChildless: true,
            showForParents: true
          },
          {
            id: 'sub4',
            name: '衝突・ストレス対処',
            description: '問題解決とストレス管理について',
            questions: [
              {
                id: 'q7_exp',
                text: '衝突が起きたとき、落ち着いて話し合い解決したい',
                type: 'expectation',
                categoryId: 'cat2',
                subcategoryId: 'sub4',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q7_real',
                text: '衝突が起きたとき、落ち着いて話し合い解決できている',
                type: 'reality',
                categoryId: 'cat2',
                subcategoryId: 'sub4',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q8_exp',
                text: '相手を尊重し、過度に感情的にならずに問題を解決したい',
                type: 'expectation',
                categoryId: 'cat2',
                subcategoryId: 'sub4',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q8_real',
                text: '相手を尊重し、過度に感情的にならずに問題を解決できている',
                type: 'reality',
                categoryId: 'cat2',
                subcategoryId: 'sub4',
                showForChildless: true,
                showForParents: true
              }
            ],
            showForChildless: true,
            showForParents: true
          }
        ]
      },
      {
        id: 'cat3',
        name: '価値観・社会的つながり',
        description: '価値観の共有と社会との関わりについて',
        subcategories: [
          {
            id: 'sub5',
            name: '価値観・将来ビジョン',
            description: '将来の展望と価値観について',
            questions: [
              {
                id: 'q9_exp',
                text: '将来の生活設計について、お互いよく話し合いたい',
                type: 'expectation',
                categoryId: 'cat3',
                subcategoryId: 'sub5',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q9_real',
                text: '将来の生活設計について、お互いよく話し合えている',
                type: 'reality',
                categoryId: 'cat3',
                subcategoryId: 'sub5',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q10_exp',
                text: '大切にしたい価値観を夫婦（家族）で共有したい',
                type: 'expectation',
                categoryId: 'cat3',
                subcategoryId: 'sub5',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q10_real',
                text: '大切にしたい価値観を夫婦（家族）で共有できている',
                type: 'reality',
                categoryId: 'cat3',
                subcategoryId: 'sub5',
                showForChildless: true,
                showForParents: true
              }
            ],
            showForChildless: true,
            showForParents: true
          },
          {
            id: 'sub6',
            name: 'レジャー・余暇共有',
            description: '余暇時間の共有について',
            questions: [
              {
                id: 'q11_exp',
                text: '夫婦（家族）で楽しめる時間や趣味を一緒に過ごしたい',
                type: 'expectation',
                categoryId: 'cat3',
                subcategoryId: 'sub6',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q11_real',
                text: '夫婦（家族）で楽しめる時間や趣味を一緒に過ごせている',
                type: 'reality',
                categoryId: 'cat3',
                subcategoryId: 'sub6',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q12_exp',
                text: '旅行や外食などの特別なイベントを十分に楽しみたい',
                type: 'expectation',
                categoryId: 'cat3',
                subcategoryId: 'sub6',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q12_real',
                text: '旅行や外食などの特別なイベントを、十分に楽しめている',
                type: 'reality',
                categoryId: 'cat3',
                subcategoryId: 'sub6',
                showForChildless: true,
                showForParents: true
              }
            ],
            showForChildless: true,
            showForParents: true
          }
        ]
      },
      {
        id: 'cat4',
        name: '親密感・子育て',
        description: '親密さと子育てについて',
        subcategories: [
          {
            id: 'sub7',
            name: '親密感・スキンシップ',
            description: '夫婦間の親密さについて',
            questions: [
              {
                id: 'q13_exp',
                text: '望む程度のスキンシップを日常的に持ちたい',
                type: 'expectation',
                categoryId: 'cat4',
                subcategoryId: 'sub7',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q13_real',
                text: '望む程度のスキンシップが日常的にあると感じる',
                type: 'reality',
                categoryId: 'cat4',
                subcategoryId: 'sub7',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q14_exp',
                text: '性的な関係について、お互いの希望や気持ちを尊重したい',
                type: 'expectation',
                categoryId: 'cat4',
                subcategoryId: 'sub7',
                showForChildless: true,
                showForParents: true
              },
              {
                id: 'q14_real',
                text: '性的な関係について、お互いの希望や気持ちを尊重できている',
                type: 'reality',
                categoryId: 'cat4',
                subcategoryId: 'sub7',
                showForChildless: true,
                showForParents: true
              }
            ],
            showForChildless: true,
            showForParents: true
          },
          {
            id: 'sub8',
            name: '子ども・育児観',
            description: '子育ての方針と協力について',
            questions: [
              {
                id: 'q15_exp',
                text: 'しつけや教育方針について、夫婦で十分に話し合い、共通認識を持ちたい',
                type: 'expectation',
                categoryId: 'cat4',
                subcategoryId: 'sub8',
                showForChildless: false,
                showForParents: true
              },
              {
                id: 'q15_real',
                text: 'しつけや教育方針について、夫婦で十分に話し合い、共通認識をもてている',
                type: 'reality',
                categoryId: 'cat4',
                subcategoryId: 'sub8',
                showForChildless: false,
                showForParents: true
              },
              {
                id: 'q16_exp',
                text: '子育てにおいて困ったときは、夫婦で協力し合いたい',
                type: 'expectation',
                categoryId: 'cat4',
                subcategoryId: 'sub8',
                showForChildless: false,
                showForParents: true
              },
              {
                id: 'q16_real',
                text: '子育てにおいて困ったときは、夫婦で協力し合っていると感じる',
                type: 'reality',
                categoryId: 'cat4',
                subcategoryId: 'sub8',
                showForChildless: false,
                showForParents: true
              },
              {
                id: 'q17_exp',
                text: '子どもとの時間、夫婦それぞれの時間、夫婦二人の時間をバランスよく取りたい',
                type: 'expectation',
                categoryId: 'cat4',
                subcategoryId: 'sub8',
                showForChildless: false,
                showForParents: true
              },
              {
                id: 'q17_real',
                text: '子どもとの時間、夫婦それぞれの時間、夫婦二人の時間をバランスよく取れている',
                type: 'reality',
                categoryId: 'cat4',
                subcategoryId: 'sub8',
                showForChildless: false,
                showForParents: true
              }
            ],
            showForChildless: false,
            showForParents: true
          }
        ]
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * デモユーザーのアカウント情報
 */
export const demoAccounts = [
  {
    email: 'demo@family-lab.com',
    password: 'demo123456',
    name: 'デモユーザー',
    description: '基本的な機能をお試しいただけるアカウントです'
  },
  {
    email: 'test@family-lab.com',
    password: 'test123456',
    name: 'テストユーザー',
    description: 'アンケート回答から結果表示まで体験できます'
  }
];