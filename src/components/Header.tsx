import Link from 'next/link';

export default function Header(){
    return (
        <header className ="bg-white shadow">
            <div className = "Container mx-auto px-4 py-6">
                <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-indigo-600">
                    Sukimable
                </Link>
                {/* ログインボタンなどここにかくよ*/}
            </div>
        </header>
    );
}