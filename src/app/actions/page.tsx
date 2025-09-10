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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/*アクション追加フォーム*/}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            マイアクション追加
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* アクション名 */}
            <div>
              <label
                htmlFor="actionName"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                アクション名
              </label>
              <input
                type="text"
                id="actionName"
                value={actionName}
                onChange={(e) => setActionName(e.target.value)}
                placeholder="例: カフェで読書"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-sm"
                required
              />
            </div>

            {/* 説明 */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                説明（任意）
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例: 駅前のスターバックスで"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-sm"
              ></textarea>
            </div>

            {/* 住所 */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                場所・住所（任意）
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="例: 東京都渋谷区神南１丁目２３−１０"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-sm"
              />
            </div>

            {/* 所要時間 */}
            <div>
              <label
                htmlFor="requiredTime"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                所要時間（分）
              </label>
              <input
                type="number"
                id="requiredTime"
                value={requiredTime}
                onChange={(e) => setRequiredTime(e.target.value)}
                placeholder="例: 60"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-sm"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gray-900 text-white py-4 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
              >
                アクションを追加する
              </button>
            </div>
          </form>
        </div>

        {/* アクション一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            マイアクション一覧
          </h2>
          {isLoading ? (
            <p>読み込み中...</p>
          ) : actions.length > 0 ? (
            <ul className="space-y-4">
              {actions.map((action) => (
                <li
                  key={action.id}
                  className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start"
                >
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {action.description}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>場所:</strong> {action.address || "指定なし"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>所要時間:</strong> {action.duration} 分
                    </p>
                  </div>
                  <div className="flex gap-4 items-center">
                    <button
                      onClick={() => handleEdit(action)}
                      className="text-blue-500 hover:text-blue-700 font-semibold text-sm"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(action.id)}
                      className="text-red-500 hover:text-red-700 font-semibold text-sm"
                    >
                      削除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">
              登録されているアクションはありません。
            </p>
          )}
        </div>
      </main>
       {/* ★★★ 編集ダイアログコンポーネントを配置 ★★★ */}
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
