"use client";

import { useState, useEffect, useRef } from "react";
import { Action } from "@prisma/client";
import axios from "axios";

type EditActionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  action: Action | null;
  onActionUpdated: () => void;
};

export default function EditActionDialog({
  isOpen,
  onClose,
  action,
  onActionUpdated,
}: EditActionDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [duration, setDuration] = useState("");

  // <dialog>要素への参照を作成
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  // actionデータが変更されたら、フォームの初期値を設定
  useEffect(() => {
    if (action) {
      setTitle(action.title);
      setDescription(action.description || "");
      setAddress(action.address || "");
      setDuration(action.duration.toString());
    }
  }, [action]);

  // isOpenプロパティの状態に応じて、ダイアログを開閉する
  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (dialogElement) {
      if (isOpen) {
        dialogElement.showModal(); // ダイアログを表示
      } else {
        dialogElement.close(); // ダイアログを閉じる
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action) return;

    try {
      await axios.patch(`/api/actions/${action.id}`, {
        title,
        description,
        address,
        duration: Number(duration),
      });
      onActionUpdated();
      onClose(); // 親コンポーネントに通知して閉じる
    } catch (error) {
      console.error("アクションの更新に失敗しました", error);
      alert("更新に失敗しました。");
    }
  };

  // dialogが閉じるイベントをハンドル
  const handleDialogClose = () => {
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={handleDialogClose}
      className="p-0 rounded-2xl shadow-xl w-full max-w-lg backdrop:bg-black/50"
    >
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-teal-600">
            マイアクションを編集
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="edit-title"
              className="block text-sm font-bold text-slate-700 mb-2"
            >
              アクション名
            </label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full flex-1 rounded-lg border-slate-300 px-4 py-3 text-lg focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="edit-description"
              className="block text-sm font-bold text-slate-700 mb-2"
            >
              説明
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full flex-1 rounded-lg border-slate-300 px-4 py-3 text-lg focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <div>
            <label
              htmlFor="edit-address"
              className="block text-sm font-bold text-slate-700 mb-2"
            >
              場所・住所
            </label>
            <input
              id="edit-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="block w-full flex-1 rounded-lg border-slate-300 px-4 py-3 text-lg focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <div>
            <label
              htmlFor="edit-duration"
              className="block text-sm font-bold text-slate-700 mb-2"
            >
              所要時間（分）
            </label>
            <input
              id="edit-duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="block w-full flex-1 rounded-lg border-slate-300 px-4 py-3 text-lg focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-6 rounded-lg bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="py-3 px-6 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors shadow-lg hover:shadow-xl"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
