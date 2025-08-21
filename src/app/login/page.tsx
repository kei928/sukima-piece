'use client'
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  console.log(session)
  return (
    <>
      <button onClick={() => signIn("google")}>login</button>
      <button onClick={() => signOut()}>logout</button>
    </>
  );
}
