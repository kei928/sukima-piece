"use client"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PropsWithChildren, useEffect } from "react"

export const Layout = ({ children }: PropsWithChildren) => {
    const { status } = useSession();
    const router = useRouter();
    useEffect(() => {
		if (status !== 'authenticated') {
			router.push('/login');
		} else if (status === 'authenticated') {
			router.push('/');
		}
	}, [status, router]);

    return (
        <>
            <Header />
                <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
                    {children}
                </main>
            <Footer />
        </>
    )
}
