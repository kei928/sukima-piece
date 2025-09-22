"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { PostAction } from "../api/actions/route";
import { Action } from "@prisma/client";
import EditActionDialog from "@/components/EditActionDialog";

export default function ActionsPage() {
  const [actionName, setActionName] = useState("");
  const [requiredTime, setRequiredTime] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");

  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);

  const fetchActions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<Action[]>("/api/actions");
      setActions(response.data);
    } catch (error) {
      console.error("アクションの取得に失敗しました", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ページが読み込まれた時に一度だけアクションを取得
  useEffect(() => {
    fetchActions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post<PostAction>("/api/actions", {
        title: actionName,
        description: description,
        duration: Number(requiredTime),
        address: address,
      });
      setActionName("");
      setRequiredTime("");
      setDescription("");
      setAddress("");
      fetchActions(); // 送信後にアクション一覧を再取得
    } catch (error) {
      console.error("アクションの送信に失敗しました", error);
    }
  };

  const handleDelete = async (actionId: string) => {
    if (!confirm("本当に削除しますか？")) {
      return;
    }
    try {
      await axios.delete(`/api/actions/${actionId}`);
      // 成功したら、画面からそのアクションを即座に削除して再描画
      setActions(actions.filter((action) => action.id !== actionId));
    } catch (error) {
      console.error("アクションの削除に失敗しました", error);
      alert("削除に失敗しました。");
    }
  };

  const handleEdit = (action: Action) => {
    setEditingAction(action);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/*アクション追加フォーム*/}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
          <h1 className="text-3xl font-bold text-teal-600 mb-8 text-center">
            マイアクション追加
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* アクション名 */}
            <div>
              <label
                htmlFor="actionName"
                className="block text-sm font-bold text-slate-700 mb-2"
              >
                アクション名
              </label>
              <input
                type="text"
                id="actionName"
                value={actionName}
                onChange={(e) => setActionName(e.target.value)}
                placeholder="例: カフェで読書"
                className="block w-full flex-1 rounded-lg border-slate-300 px-4 py-3 text-lg focus:border-teal-500 focus:ring-teal-500"
                required
              />
            </div>

            {/* 説明 */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-bold text-slate-700 mb-2"
              >
                説明（任意）
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例: 駅前のスターバックスで"
                className="block w-full flex-1 rounded-lg border-slate-300 px-4 py-3 text-lg focus:border-teal-500 focus:ring-teal-500"
              ></textarea>
            </div>

            {/* 住所 */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-bold text-slate-700 mb-2"
              >
                場所・住所（任意）
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="例: 東京都渋谷区神南１丁目２３−１０"
                className="block w-full flex-1 rounded-lg border-slate-300 px-4 py-3 text-lg focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            {/* 所要時間 */}
            <div>
              <label
                htmlFor="requiredTime"
                className="block text-sm font-bold text-slate-700 mb-2"
              >
                所要時間（分）
              </label>
              <input
                type="number"
                id="requiredTime"
                value={requiredTime}
                onChange={(e) => setRequiredTime(e.target.value)}
                placeholder="例: 60"
                className="block w-full flex-1 rounded-lg border-slate-300 px-4 py-3 text-lg focus:border-teal-500 focus:ring-teal-500"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-teal-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                アクションを追加する
              </button>
            </div>
          </form>
        </div>

        {/* アクション一覧 */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-3xl font-bold text-teal-600 mb-6 text-center">
            マイアクション一覧
          </h2>
          {isLoading ? (
            <p className="text-center text-slate-500">読み込み中...</p>
          ) : actions.length > 0 ? (
            <ul className="space-y-4">
              {actions.map((action) => (
                <li
                  key={action.id}
                  className="p-6 border rounded-lg bg-slate-50 flex justify-between items-start"
                >
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">
                      {action.title}
                    </h3>
                    <p className="text-slate-600 mt-1">{action.description}</p>
                    <p className="text-sm text-slate-500 mt-2">
                      <strong>場所:</strong> {action.address || "指定なし"}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      <strong>所要時間:</strong> {action.duration} 分
                    </p>
                  </div>
                  <div className="flex gap-4 items-center flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleEdit(action)}
                      className="text-teal-600 hover:text-teal-700 font-semibold text-sm"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(action.id)}
                      className="text-red-600 hover:text-red-700 font-semibold text-sm"
                    >
                      削除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-slate-500">
              登録されているアクションはありません。
            </p>
          )}
        </div>
      </main>
      <EditActionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        action={editingAction}
        onActionUpdated={() => {
          fetchActions(); // 更新が成功したらリストを再取得
        }}
      />
    </div>
  );
}
