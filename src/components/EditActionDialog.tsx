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

export default function EditActionDialog({ isOpen, onClose, action, onActionUpdated }: EditActionDialogProps) {
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
    <dialog ref={dialogRef} onClose={handleDialogClose} className="p-6 rounded-lg shadow-xl">
      <h2 className="text-xl font-bold mb-4">アクションを編集</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ...フォームの中身... */}
        <div>
          <label htmlFor="edit-title">アクション名</label>
          <input id="edit-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded p-2 mt-1" required />
        </div>
        <div>
          <label htmlFor="edit-description">説明</label>
          <textarea id="edit-description" value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded p-2 mt-1" />
        </div>
        <div>
          <label htmlFor="edit-address">場所・住所</label>
          <input id="edit-address" type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full border rounded p-2 mt-1" />
        </div>
        <div>
          <label htmlFor="edit-duration">所要時間（分）</label>
          <input id="edit-duration" type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full border rounded p-2 mt-1" required />
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onClose} className="py-2 px-4 rounded bg-gray-200 hover:bg-gray-300">キャンセル</button>
          <button type="submit" className="py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700">保存</button>
        </div>
      </form>
    </dialog>
  );
}