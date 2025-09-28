import { prisma } from "@/libs/prismaClient";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/libs/authOptions";

//  ユーザーの滞在時間設定を取得
export const GET = async (_req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "認証されていません" }, { status: 401 });
        }

        const durations = await prisma.categoryDuration.findMany({
            where: { userId: session.user.id },
        });

        // { "cafe": 60, "park": 90 } のような形式に変換して返す
        const durationMap = durations.reduce((acc, item) => {
            acc[item.category] = item.duration;
            return acc;
        }, {} as { [key: string]: number });

        return NextResponse.json(durationMap, { status: 200 });
    } catch (error) {
        console.error("設定の取得に失敗しました:", error);
        return NextResponse.json({ message: "設定の取得に失敗しました" }, { status: 500 });
    }
};

//  ユーザーの滞在時間設定を保存（更新）
export const POST = async (req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "認証されていません" }, { status: 401 });
        }

        const body: { [key: string]: number } = await req.json();
        const userId = session.user.id;

        // トランザクションですべての設定を一度に更新
        const updatePromises = Object.entries(body).map(([category, duration]) => {
            return prisma.categoryDuration.upsert({
                where: { userId_category: { userId, category } },
                update: { duration },
                create: { userId, category, duration },
            });
        });

        await prisma.$transaction(updatePromises);

        return NextResponse.json({ message: "設定を保存しました" }, { status: 200 });
    } catch (error) {
        console.error("設定の保存に失敗しました:", error);
        return NextResponse.json({ message: "設定の保存に失敗しました" }, { status: 500 });
    }
};