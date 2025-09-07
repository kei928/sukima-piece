import { prisma } from "@/libs/prismaClient";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export const GET = async (req: NextRequest): Promise<NextResponse> => {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { message: '認証されていません' },
                { status: 401 },
            );
        }

        const userId = session.user.id;

        const actions = await prisma.action.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(actions, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'アクションの取得に失敗しました' },
            { status: 500 },
        );
    }
};


export type PostAction = {
    title: string;
    duration: number;
    description?: string;
    address?: string;
}

export const POST = async (req: NextRequest): Promise<NextResponse> => {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { message: '認証されていません' },
                { status: 401 },
            );
        }


        const { title, duration, description, address }: PostAction = await req.json();
        const userId = session.user.id;

        const action = await prisma.action.create({
            data: {
                title,
                duration,
                description,
                address,
                userId: userId,
            },
        });

        return NextResponse.json(action, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'タスクの追加に失敗しました' },
            { status: 500 },
        );
    }
};