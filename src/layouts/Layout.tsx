"use client"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { PropsWithChildren } from "react"

export const Layout = ({ children }: PropsWithChildren) => {

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