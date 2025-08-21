'use client';
import { SessionProvider } from 'next-auth/react';
import type { PropsWithChildren, ReactNode } from 'react';

export const NextAuthProvider = ({ children }: PropsWithChildren) => {
    return <SessionProvider>{children}</SessionProvider>;
};