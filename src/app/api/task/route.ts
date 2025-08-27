import { prisma } from "@/libs/prismaClient";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";


export type PostTask = {
    title: string;
    duration: number;
    description?: string;
}

export const POST = async (req: NextRequest): Promise<NextResponse> => {
    try {
        const session = await getServerSession(authOptions);
        const {title,duration,description}: PostTask = await req.json();
        const task=await prisma.task.create({
            data: {
                title,
                duration,
                description,
                userId: session?.user?.id as string,
            },

        })
        return NextResponse.json(0, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'タスクの追加に失敗しました' },
            { status: 500 },
        );
    }
};




