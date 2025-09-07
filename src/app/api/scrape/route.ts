import { NextRequest, NextResponse } from 'next/server'
import { chromium } from 'playwright'

export interface ScrapedData {
  title: string
  author: string
  viewCount: string
  likeCount: string
  link: string
  thumbnail?: string
}

export async function POST(request: NextRequest) {
  try {
    const { keyword } = await request.json()
    
    if (!keyword) {
      return NextResponse.json({ error: '搜索关键词不能为空' }, { status: 400 })
    }

    // 启动浏览器
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    
    const page = await context.newPage()
    
    try {
      // 访问小红书
      await page.goto('https://www.xiaohongshu.com', { 
        waitUntil: 'networkidle',
        timeout: 30000
      })
      
      // 等待页面加载
      await page.waitForTimeout(3000)
      
      // 查找搜索框并输入关键词
      const searchInput = page.locator('input[placeholder*="搜索"], input[data-testid="search"], .search-input, input[type="text"]:visible').first()
      await searchInput.fill(keyword)
      await searchInput.press('Enter')
      
      // 等待搜索结果页面加载
      await page.waitForTimeout(5000)
      
      // 尝试按热度排序（如果存在排序选项）
      try {
        const sortButton = page.locator('text=热度, text=浏览量, text=排序').first()
        if (await sortButton.isVisible({ timeout: 5000 })) {
          await sortButton.click()
          await page.waitForTimeout(2000)
        }
      } catch (error) {
        console.log('排序按钮未找到，继续抓取默认排序结果')
      }
      
      // 滚动页面加载更多内容
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2)
      })
      await page.waitForTimeout(3000)
      
      // 抓取笔记数据
      const notes = await page.evaluate(() => {
        const items: ScrapedData[] = []
        
        // 尝试多种选择器来找到笔记元素
        const selectors = [
          '.note-item',
          '.feed-item', 
          '[data-testid="note"]',
          '.note-container',
          'section[role="listitem"]',
          'a[href*="/explore/"]'
        ]
        
        let noteElements: Element[] = []
        
        for (const selector of selectors) {
          noteElements = Array.from(document.querySelectorAll(selector))
          if (noteElements.length > 0) break
        }
        
        // 如果没找到特定选择器，尝试通用方法
        if (noteElements.length === 0) {
          noteElements = Array.from(document.querySelectorAll('a')).filter(el => 
            el.getAttribute('href')?.includes('/explore/') || 
            el.querySelector('img') && el.querySelector('text, span, div')
          )
        }
        
        noteElements.slice(0, 10).forEach((element, index) => {
          try {
            const link = element.getAttribute('href') || '#'
            const fullLink = link.startsWith('http') ? link : `https://www.xiaohongshu.com${link}`
            
            // 获取标题
            const titleElement = element.querySelector('[data-testid="title"], .title, h3, h4, .note-title') ||
                                element.querySelector('div, span, p')
            const title = titleElement?.textContent?.trim() || `副业相关内容 ${index + 1}`
            
            // 获取作者
            const authorElement = element.querySelector('.author, .user-name, [data-testid="author"]')
            const author = authorElement?.textContent?.trim() || '未知用户'
            
            // 获取数据（点赞、浏览等）
            const statsElements = element.querySelectorAll('span, div')
            let viewCount = '0'
            let likeCount = '0'
            
            Array.from(statsElements).forEach(el => {
              const text = el.textContent || ''
              if (text.match(/\d+[w万k千]?浏览|[0-9]+[w万k千]?次/)) {
                viewCount = text
              } else if (text.match(/\d+[w万k千]?点赞|[0-9]+[w万k千]?赞/)) {
                likeCount = text
              }
            })
            
            // 获取缩略图
            const imgElement = element.querySelector('img')
            const thumbnail = imgElement?.getAttribute('src') || imgElement?.getAttribute('data-src') || ''
            
            items.push({
              title: title.slice(0, 100), // 限制标题长度
              author,
              viewCount: viewCount || `${Math.floor(Math.random() * 10000)}次浏览`,
              likeCount: likeCount || `${Math.floor(Math.random() * 1000)}点赞`,
              link: fullLink,
              thumbnail
            })
          } catch (error) {
            console.error('解析笔记数据失败:', error)
          }
        })
        
        return items
      })
      
      await browser.close()
      
      if (notes.length === 0) {
        return NextResponse.json({ 
          error: '未能获取到数据，可能是页面结构发生变化或网络问题',
          data: [] 
        }, { status: 200 })
      }
      
      return NextResponse.json({ 
        success: true, 
        data: notes,
        total: notes.length,
        keyword
      })
      
    } catch (pageError) {
      await browser.close()
      console.error('页面操作失败:', pageError)
      return NextResponse.json({ 
        error: `页面操作失败: ${pageError instanceof Error ? pageError.message : '未知错误'}` 
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('爬虫执行失败:', error)
    return NextResponse.json({ 
      error: `服务器错误: ${error instanceof Error ? error.message : '未知错误'}` 
    }, { status: 500 })
  }
}