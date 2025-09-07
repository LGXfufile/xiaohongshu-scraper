'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ScrapedData } from './api/scrape/route'

interface ApiResponse {
  success?: boolean
  data: ScrapedData[]
  total?: number
  keyword?: string
  error?: string
  note?: string
}

export default function Home() {
  const [keyword, setKeyword] = useState('副业')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ScrapedData[]>([])
  const [error, setError] = useState('')
  const [note, setNote] = useState('')

  const handleSearch = async () => {
    if (!keyword.trim()) return
    
    setLoading(true)
    setError('')
    setNote('')
    setData([])
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: keyword.trim() }),
      })
      
      const result: ApiResponse = await response.json()
      
      if (result.error) {
        setError(result.error)
      } else {
        setData(result.data || [])
        if (result.note) {
          setNote(result.note)
        }
      }
    } catch {
      setError('网络请求失败，请检查连接后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            小红书数据洞察
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            智能抓取小红书热门内容，按浏览量排序为您呈现最具价值的副业信息
          </p>
        </div>

        {/* 搜索区域 */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="输入搜索关键词..."
                  className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    抓取中...
                  </div>
                ) : (
                  '开始抓取'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 提示信息 */}
        {note && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-blue-400">ℹ️</div>
                <p className="text-blue-300">{note}</p>
              </div>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-red-400">⚠️</div>
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 数据展示 */}
        {data.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                搜索结果 <span className="text-purple-400">({data.length}条)</span>
              </h2>
              <div className="text-sm text-slate-400">
                按浏览量排序显示
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2 leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-slate-300 text-sm mb-3">
                        作者: {item.author}
                      </p>
                    </div>
                  </div>
                  
                  {item.thumbnail && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <Image 
                        src={item.thumbnail} 
                        alt={item.title}
                        width={300}
                        height={128}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <span className="text-blue-400 text-sm font-medium">
                        👁️ {item.viewCount}
                      </span>
                      <span className="text-pink-400 text-sm font-medium">
                        ❤️ {item.likeCount}
                      </span>
                    </div>
                  </div>
                  
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors duration-200"
                  >
                    查看原文 
                    <span className="transform group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        {!loading && data.length === 0 && !error && (
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-4">开始您的数据探索之旅</h3>
              <p className="text-slate-400 mb-6">
                输入关键词，系统将自动抓取小红书相关内容并按热度排序，为您呈现最有价值的信息。
              </p>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-800/30 rounded-lg p-4">
                  <div className="text-purple-400 font-semibold mb-2">🎯 智能抓取</div>
                  <div className="text-slate-400">自动化浏览器技术</div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4">
                  <div className="text-blue-400 font-semibold mb-2">📊 数据分析</div>
                  <div className="text-slate-400">按浏览量智能排序</div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4">
                  <div className="text-pink-400 font-semibold mb-2">⚡ 实时更新</div>
                  <div className="text-slate-400">获取最新热门内容</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
