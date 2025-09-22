import { prisma } from '@/libs/prismaClient';
import NextAuth, { ISODateString, type AuthOptions, type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

declare module 'next-auth' {
    interface Session {
        user?: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
            id?: string;
        };
        expires: ISODateString;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id?: string;
        role?: string;

    }
}



export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET as string,
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account && profile) {
                const userId = account.providerAccountId;
                token.id = userId; // トークンにIDを追加
                token.accessToken = account.access_token
                token.refreshToken = account.refresh_token

                await prisma.user.upsert({
                    where: { id: userId },
                    create: {
                        id: userId,
                        name: profile.name,
                        email: profile.email,
                        image: token.picture,
                    },
                    update: {
                        name: profile.name,
                        email: profile.email,
                        image: token.picture,
                    },
                });
            }
            return token;
        },
        async session({ session, token }) {
            // セッションにIDを格納
            if (session.user) {
                session.user.id = token.id;
            }
            return session;
        },
    }
};

const handler: NextAuthOptions = NextAuth(authOptions);

export { handler as GET, handler as POST };