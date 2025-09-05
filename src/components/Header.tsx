"use client";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const { data: session, status } = useSession();
  return (
    <header className="bg-white shadow">
      <div className="flex Container mx-auto px-4 py-6 justify-between items-center">
        <Link 
          href="/"
          className="text-2xl font-bold text-gray-800 hover:text-indigo-600"
        >
          Sukimable
        </Link>
        {/* ログインボタンなどここにかくよ*/}
        <div className="flex items-center gap-4">
          <Link 
          href="/actions"
          className ="text-gray-600 hover:text-indigo-600">
            マイアクション追加
          </Link>
          <img
            src={session?.user?.image || "/default-avatar.png"}
            alt="User Avatar"
            width={30}
            height={30}
            className="rounded-full ml-4"
          />
          <button onClick={() => signOut()}>logout</button>
        </div>
      </div>
    </header>
  );
}
