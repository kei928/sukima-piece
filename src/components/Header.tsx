"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

// アイコン
const GuestIcon = () => (
  <svg
    className="h-8 w-8 text-slate-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export default function Header() {
  const { data: session } = useSession();
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="flex container mx-auto px-4 py-4 justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Sukima Piece Logo"
            width={20}
            height={20}
            priority
          />
          <span className="text-xl font-bold text-teal-600">Sukima Piece</span>
        </Link>
        <div className="flex items-center gap-6">
          {session ? (
            <>
              {/* ログイン済みユーザーに表示するメニュー */}
              <Link
                href="/actions"
                className="text-slate-600 hover:text-teal-500 font-medium"
              >
                マイピース
              </Link>
              <Link
                href="/settings/durations"
                className="text-slate-600 hover:text-teal-500 font-medium"
              >
                滞在時間設定
              </Link>
              <div className="flex items-center gap-2">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <GuestIcon />
                )}
                <button
                  onClick={() => signOut()}
                  className="text-slate-600 hover:text-teal-500 text-sm"
                >
                  ログアウト
                </button>
              </div>
            </>
          ) : (
            <>
              {/* ゲストユーザーに表示するメニュー */}
              <Link
                href="/login"
                className="bg-teal-600 text-white py-2 px-4 rounded-lg font-bold text-sm hover:bg-teal-700 transition-colors"
              >
                ログイン / 新規登録
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
