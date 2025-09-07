'use client'
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  console.log(session)
  return (
    <>
      <button onClick={() => signIn("google")} className="text-gray-600 hover:text-indigo-600">login</button>
      <button onClick={() => signOut()} className="text-gray-600 hover:text-indigo-600">logout</button>
    </>
  );
}
