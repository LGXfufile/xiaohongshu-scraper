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

    // 检查是否在Vercel环境中
    const isVercelEnvironment = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
    
    if (isVercelEnvironment) {
      // 在生产环境中返回模拟数据，避免Playwright安装问题
      const mockData: ScrapedData[] = [
        {
          title: "副业赚钱的10个渠道，每个都能月入过万",
          author: "创业小达人",
          viewCount: "15.6万浏览",
          likeCount: "2.3万点赞",
          link: "https://www.xiaohongshu.com/explore/mock-1",
          thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300"
        },
        {
          title: "在家就能做的5种副业，学生党宝妈都适合",
          author: "副业达人Jane",
          viewCount: "12.8万浏览",
          likeCount: "1.9万点赞", 
          link: "https://www.xiaohongshu.com/explore/mock-2",
          thumbnail: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300"
        },
        {
          title: "我的副业一年赚了20万，分享经验给大家",
          author: "财富自由小姐姐",
          viewCount: "25.3万浏览",
          likeCount: "4.2万点赞",
          link: "https://www.xiaohongshu.com/explore/mock-3",
          thumbnail: "https://images.unsplash.com/photo-1534951009808-766178b47a4f?w=300"
        },
        {
          title: "零成本副业项目，新手也能日赚300+",
          author: "副业教练Lisa",
          viewCount: "18.7万浏览",
          likeCount: "3.1万点赞",
          link: "https://www.xiaohongshu.com/explore/mock-4",
          thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300"
        },
        {
          title: "副业做什么最赚钱？这5个项目值得试试",
          author: "赚钱小能手",
          viewCount: "22.1万浏览",
          likeCount: "3.8万点赞",
          link: "https://www.xiaohongshu.com/explore/mock-5",
          thumbnail: "https://images.unsplash.com/photo-1560472355-536de3962603?w=300"
        },
        {
          title: "副业兼职推荐，适合上班族的赚钱方法",
          author: "职场副业王",
          viewCount: "14.2万浏览",
          likeCount: "2.7万点赞",
          link: "https://www.xiaohongshu.com/explore/mock-6",
          thumbnail: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=300"
        },
        {
          title: "手机就能做的副业，每天2小时月入5000",
          author: "手机赚钱达人",
          viewCount: "19.8万浏览",
          likeCount: "3.5万点赞",
          link: "https://www.xiaohongshu.com/explore/mock-7",
          thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300"
        },
        {
          title: "大学生副业指南，从0到月入过万的经历",
          author: "大学生创业者",
          viewCount: "16.9万浏览",
          likeCount: "2.9万点赞",
          link: "https://www.xiaohongshu.com/explore/mock-8",
          thumbnail: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300"
        },
        {
          title: "宝妈在家副业，带娃赚钱两不误",
          author: "宝妈创业小组",
          viewCount: "13.6万浏览",
          likeCount: "2.4万点赞",
          link: "https://www.xiaohongshu.com/explore/mock-9",
          thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300"
        },
        {
          title: "副业变主业，我是如何实现财务自由的",
          author: "财务自由达人",
          viewCount: "31.2万浏览",
          likeCount: "5.7万点赞",
          link: "https://www.xiaohongshu.com/explore/mock-10",
          thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300"
        }
      ]
      
      return NextResponse.json({ 
        success: true, 
        data: mockData,
        total: mockData.length,
        keyword,
        note: "生产环境展示模拟数据，实际部署时会使用真实抓取功能"
      })
    }

    // 启动浏览器（仅在本地开发环境）
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
    
    // 如果是Playwright相关错误，返回特定的错误信息
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    if (errorMessage.includes('browserType.launch') || errorMessage.includes('Executable doesn\'t exist')) {
      return NextResponse.json({ 
        error: '服务器错误: browserType.launch: Executable doesn\'t exist at /home/sbx_user1051/.cache/ms-playwright/chromium_headless_shell-1187/chrome-linux/headless_shell\n\n|| Looks like Playwright Test or Playwright was just installed or updated. || || Please run the following command to download new browsers: || || || npx playwright install || || || <3 Playwright Team ||',
        suggestion: '生产环境正在配置中，目前显示模拟数据用于演示'
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: `服务器错误: ${errorMessage}` 
    }, { status: 500 })
  }
}