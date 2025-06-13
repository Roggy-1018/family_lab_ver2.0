import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FocusedAction {
  id: string;
  actionName: string;
  categoryName: string;
  itemName: string;
  actionType: '認識合わせ' | '実感UP' | '要望調整';
  steps: string[];
  addedAt: string;
  isCompleted: boolean;
  progress: number; // 0-100
}

interface RelationshipTipsState {
  focusedActions: FocusedAction[];
  addFocusedAction: (action: Omit<FocusedAction, 'id' | 'addedAt' | 'isCompleted' | 'progress'>) => void;
  removeFocusedAction: (actionId: string) => void;
  updateActionProgress: (actionId: string, progress: number) => void;
  toggleActionCompletion: (actionId: string) => void;
  clearAllActions: () => void;
}

export const useRelationshipTipsStore = create<RelationshipTipsState>()(
  persist(
    (set, get) => ({
      focusedActions: [],

      addFocusedAction: (actionData) => {
        const newAction: FocusedAction = {
          ...actionData,
          id: `action-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          addedAt: new Date().toISOString(),
          isCompleted: false,
          progress: 0
        };

        set(state => ({
          focusedActions: [...state.focusedActions, newAction]
        }));

        console.log('✅ 注力アクション追加:', newAction);
      },

      removeFocusedAction: (actionId) => {
        set(state => ({
          focusedActions: state.focusedActions.filter(action => action.id !== actionId)
        }));
        console.log('🗑️ 注力アクション削除:', actionId);
      },

      updateActionProgress: (actionId, progress) => {
        set(state => ({
          focusedActions: state.focusedActions.map(action =>
            action.id === actionId 
              ? { ...action, progress: Math.max(0, Math.min(100, progress)) }
              : action
          )
        }));
      },

      toggleActionCompletion: (actionId) => {
        set(state => ({
          focusedActions: state.focusedActions.map(action =>
            action.id === actionId 
              ? { 
                  ...action, 
                  isCompleted: !action.isCompleted,
                  progress: !action.isCompleted ? 100 : action.progress
                }
              : action
          )
        }));
      },

      clearAllActions: () => {
        set({ focusedActions: [] });
        console.log('🧹 全ての注力アクションをクリア');
      }
    }),
    {
      name: 'relationship-tips-storage',
      partialize: (state) => ({
        focusedActions: state.focusedActions
      })
    }
  )
);