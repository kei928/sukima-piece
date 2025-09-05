import { prisma } from "@/libs/prismaClient";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";


export type PostAction = {
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

        const {title,duration,description}: PostAction = await req.json();
        const userId = session.user.id;

        const action = await prisma.action.create({
            data: {
                title,
                duration,
                description,
                userId: userId, // 確実に存在するuserIdを使用
            },
        });

        return NextResponse.json(action, { status: 200 }); // 成功時は作成されたタスクを返す
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'タスクの追加に失敗しました' },
            { status: 500 },
        );
    }
};