import { prisma } from "@/libs/prismaClient";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

type Params = {
  id: string;
};

export const DELETE = async (
  req: NextRequest,
  context: { params: Params }
) => {
  try {
    const session = await getServerSession(authOptions);
    const actionId = context.params.id;

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "認証されていません" },
        { status: 401 }
      );
    }

    // 削除しようとしているアクションが、本当にそのユーザーのものであるかを確認
    const action = await prisma.action.findUnique({
      where: { id: actionId },
    });

    if (!action || action.userId !== session.user.id) {
      return NextResponse.json(
        { message: "権限がありません" },
        { status: 403 } // Forbidden
      );
    }

    // アクションを削除
    await prisma.action.delete({
      where: {
        id: actionId,
      },
    });

    return NextResponse.json(
      { message: "アクションを削除しました" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "アクションの削除に失敗しました" },
      { status: 500 }
    );
  }
};