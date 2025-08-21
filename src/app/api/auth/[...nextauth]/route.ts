import { prisma } from '@/libs/prismaClient';
import NextAuth, { type AuthOptions, type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

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
            if (!account) {
                return token;
            }

            const userId = account.providerAccountId;
            const userName = profile?.name as string;
            const userEmail = profile?.email as string;
            const userImage = token?.picture || '';

            await prisma.user.upsert({
                where: {
                    id: userId,
                },
                create: {
                    id: userId,
                    name: userName,
                    email: userEmail,
                    image: userImage,
                },
                update: {
                    name: userName,
                    email: userEmail,
                    image: userImage,
                },
            });
            return token;
        },
        async session({ session, token, _user }: any) {
            session.user.id = token.sub;
            return session;
        },
    }
};

const handler: NextAuthOptions = NextAuth(authOptions);

export { handler as GET, handler as POST };