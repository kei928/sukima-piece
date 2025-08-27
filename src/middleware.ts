import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  
  // リクエストからセッショントークン（ログイン状態）を取得
  const token = await getToken({ req, secret });

  // 現在アクセスしようとしているページのパスを取得
  const { pathname } = req.nextUrl;

  // ログイン済みのユーザーが/loginページにアクセスした場合トップページ(`/`)にリダイレクト
  if (token && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 未ログインのユーザーが保護されたページ（/login以外）にアクセスした場合ログインページ(`/login`)にリダイレクト
  if (!token && !pathname.startsWith('/login')) {
    // 認証用のAPIルートは除外
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 上記の条件に当てはまらない場合は、アクセスを許可
  return NextResponse.next();
}

// このmiddlewareが適用されるページのパスを指定
export const config = {
  matcher: [
    /*
     * 下記にマッチするパス以外を全て対象とする:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};