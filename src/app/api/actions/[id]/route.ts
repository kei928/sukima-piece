import { prisma } from "@/libs/prismaClient";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PostAction } from "../route";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const session = await getServerSession(authOptions);
    const actionId = params.id;
    const body: PostAction = await req.json();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "認証されていません" },
        { status: 401 }
      );
    }

    // 更新しようとしているアクションが、本当にそのユーザーのものであるかを確認
    const actionToUpdate = await prisma.action.findUnique({
      where: { id: actionId },
    });

    if (!actionToUpdate || actionToUpdate.userId !== session.user.id) {
      return NextResponse.json(
        { message: "権限がありません" },
        { status: 403 } // Forbidden
      );
    }


    // アクションを更新
    const updatedAction = await prisma.action.update({
      where: { id: actionId },
      data: {
        title: body.title,
        description: body.description,
        address: body.address,
        duration: body.duration,
      },
    });
    return NextResponse.json(updatedAction, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "アクションの更新に失敗しました" },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const session = await getServerSession(authOptions);
    const actionId = params.id;

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
}