"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="flex container mx-auto px-4 py-4 justify-between items-center">

        <Link
          href="/"
          className="text-2xl font-bold text-teal-500 hover:text-teal-600"
        >
          Sukima Piece
        </Link>
        <div className="flex items-center gap-6">

          <Link href="/actions" className="text-slate-600 hover:text-teal-500 font-medium">
            マイアクション
          </Link>
          <Link
            href="/settings/durations"
            className="text-slate-600 hover:text-teal-500 font-medium"
          >
            滞在時間設定
          </Link>

          <div className="flex items-center gap-2">
            <img
              src={session?.user?.image || "/guest.png"}
              alt="User Avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
            <button
              onClick={() => signOut()}
              className="text-slate-600 hover:text-teal-500 text-sm"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}