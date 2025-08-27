"use client"

import { useState } from "react"
import Header from "@/components/Header"
import axios from "axios"
import { PostTask } from "../api/task/route"
import { title } from "process"



export default function Home() {
  const [actionName, setActionName] = useState("")
  const [requiredTime, setRequiredTime] = useState("")
  const [description, setDescription] = useState("")


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Action Name:", actionName)
    console.log("Required Time:", requiredTime)
    console.log("Description:", description)
    axios.post<PostTask>('/api/task', {
        title: actionName,
        description: description,
        duration: Number(requiredTime)
  })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">マイアクション追加</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* アクション名 */}
            <div>
              <label htmlFor="actionName" className="block text-sm font-medium text-gray-900 mb-2">
                アクション名
              </label>
              <input
                type="text"
                id="actionName"
                value={actionName}
                onChange={(e) => setActionName(e.target.value)}
                placeholder="Value"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-sm"
              />
            </div>

            {/*setumei*/}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                    説明
                </label>
                <textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Value"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-sm"
                ></textarea>
            </div>

            {/* 所要時間 */}
            <div>
              <label htmlFor="requiredTime" className="block text-sm font-medium text-gray-900 mb-2">
                所要時間
              </label>
              <input
                type="text"
                id="requiredTime"
                value={requiredTime}
                onChange={(e) => setRequiredTime(e.target.value)}
                placeholder="Value"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-sm"
              />
            </div>

            {/* Submit ボタン */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gray-900 text-white py-4 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}