import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
    try {
        return NextResponse.json(0, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'タスクの追加に失敗しました' },
            { status: 500 },
        );
    }
};




