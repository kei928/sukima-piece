import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

// ログインが必須なページのパス
const protectedPaths = ['/actions', '/settings'];

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  // ログイン済みのユーザーが/loginにアクセスしたらトップへ
  if (token && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 未ログインで保護されたページにアクセスした場合、ログインページへリダイレクト
  if (!token && protectedPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|SP_logo.svg).*)',
  ],
};