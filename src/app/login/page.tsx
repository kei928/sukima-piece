'use client'

import { signIn } from "next-auth/react";
import { useState } from "react";

// GoogleアイコンのSVGコンポーネント
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.021,35.591,44,30.134,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // ログイン後、前のページかホームページにリダイレクト
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("ログインに失敗しました", error);
      // ここでエラーメッセージをユーザーに表示することもできます
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] bg-gray-50">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md border">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Sukima Piece
          </h1>
          <p className="mt-2 text-gray-600">
            ログインして、すきま時間の活用を始めよう
          </p>
        </div>
        
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 text-lg font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            "ログイン中..."
          ) : (
            <>
              <GoogleIcon />
              Googleでログイン
            </>
          )}
        </button>

      </div>
    </div>
  );
}