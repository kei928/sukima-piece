import { prisma } from "@/libs/prismaClient";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PostAction } from "../route";

// GET, PATCH, DELETE すべての引数をこの形式に統一します
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await getServerSession(authOptions);
    const { id: actionId } = await params;
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "認証されていません" },
        { status: 401 }
      );
    }
    const action = await prisma.action.findFirst({
      where: {
        id: actionId,
        userId: session.user.id
      },
    });

    if (!action) {
      return NextResponse.json(
        { message: "アクションが見つかりません" },
        { status: 404 });
    }

    return NextResponse.json(action, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "アクションの取得に失敗しました" },
      { status: 500 }
    );
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await getServerSession(authOptions);
    const { id: actionId } = await params;
    const body: PostAction = await req.json();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "認証されていません" },
        { status: 401 }
      );
    }

    const actionToUpdate = await prisma.action.findUnique({
      where: { id: actionId },
    });

    if (!actionToUpdate || actionToUpdate.userId !== session.user.id) {
      return NextResponse.json(
        { message: "権限がありません" },
        { status: 403 }
      );
    }

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
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await getServerSession(authOptions);
    const { id: actionId } = await params;

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "認証されていません" },
        { status: 401 }
      );
    }

    const action = await prisma.action.findUnique({
      where: { id: actionId },
    });

    if (!action || action.userId !== session.user.id) {
      return NextResponse.json(
        { message: "権限がありません" },
        { status: 403 }
      );
    }

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