import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Copy, Check, User, Lock, Info } from 'lucide-react';
import { demoAccounts } from '../../lib/demoData';

interface DemoAccountInfoProps {
  onDemoLogin: (email: string, password: string) => void;
  isLoading?: boolean;
}

export const DemoAccountInfo: React.FC<DemoAccountInfoProps> = ({ 
  onDemoLogin, 
  isLoading = false 
}) => {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const copyToClipboard = async (text: string, accountEmail: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAccount(accountEmail);
      setTimeout(() => setCopiedAccount(null), 2000);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Info className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg text-blue-800">デモアカウント</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-blue-700">
          以下のデモアカウントでアプリケーションをお試しいただけます。
        </p>
        
        {demoAccounts.map((account, index) => (
          <div key={account.email} className="rounded-lg bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-medium text-gray-900">{account.name}</h4>
              <Button
                size="sm"
                onClick={() => onDemoLogin(account.email, account.password)}
                disabled={isLoading}
                className="text-xs"
              >
                このアカウントでログイン
              </Button>
            </div>
            
            <p className="mb-3 text-xs text-gray-600">{account.description}</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{account.email}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(account.email, account.email)}
                  className="rounded p-1 hover:bg-gray-100"
                >
                  {copiedAccount === account.email ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{account.password}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(account.password, `${account.email}-password`)}
                  className="rounded p-1 hover:bg-gray-100"
                >
                  {copiedAccount === `${account.email}-password` ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};