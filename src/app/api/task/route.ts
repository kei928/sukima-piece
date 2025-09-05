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

        // セッションまたはユーザーIDが存在しない場合はエラーを返す
        if (!session || !session.user?.id) {
            return NextResponse.json(
                { message: '認証されていません' },
                { status: 401 },
            );
        }

        const {title,duration,description}: PostTask = await req.json();
        const userId = session.user.id;

        const task = await prisma.task.create({
            data: {
                title,
                duration,
                description,
                userId: userId, // 確実に存在するuserIdを使用
            },
        });

        return NextResponse.json(task, { status: 200 }); // 成功時は作成されたタスクを返す
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'タスクの追加に失敗しました' },
            { status: 500 },
        );
    }
};