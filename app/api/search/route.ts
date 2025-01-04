import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--lang=en-US,en'
      ]
    });

    const page = await browser.newPage();
    
    // 设置用户代理
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    
    // 设置视窗大小
    await page.setViewport({ width: 1280, height: 800 });

    try {
      // 设置较长的超时时间
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
        waitUntil: 'networkidle0',
        timeout: 60000
      });

      // 等待搜索结果加载，使用多个可能的选择器
      await page.waitForFunction(
        () => {
          const selectors = [
            'div[data-header-feature]',
            'div.g',
            'div[data-sokoban-container]',
            'div[data-content-feature]'
          ];
          return selectors.some(selector => 
            document.querySelector(selector) !== null
          );
        },
        { timeout: 10000 }
      );

      // 提取搜索结果
      const searchResults = await page.evaluate(() => {
        const results: any[] = [];
        
        // 使用多个可能的选择器来查找搜索结果
        const elements = document.querySelectorAll([
          'div[data-header-feature]',
          'div.g',
          'div[data-sokoban-container]',
          'div[data-content-feature]'
        ].join(','));

        elements.forEach((element) => {
          // 尝试不同的选择器组合来获取标题、摘要和链接
          const titleElement = element.querySelector('h3') || element.querySelector('[role="heading"]');
          const snippetElement = element.querySelector('.VwiC3b') || element.querySelector('[data-content-feature="1"]');
          const linkElement = element.querySelector('a[href^="http"]');

          if (titleElement && (snippetElement || linkElement)) {
            results.push({
              title: titleElement.textContent?.trim() || '',
              snippet: snippetElement?.textContent?.trim() || '',
              link: (linkElement as HTMLAnchorElement)?.href || ''
            });
          }
        });

        // 去重并只返回前5个有效结果
        return Array.from(new Set(results.map(r => JSON.stringify(r))))
          .map(r => JSON.parse(r))
          .filter(r => r.title && (r.snippet || r.link))
          .slice(0, 5);
      });

      await browser.close();

      if (searchResults.length === 0) {
        throw new Error('No search results found');
      }

      return NextResponse.json(searchResults);
    } catch (error) {
      await browser.close();
      throw error;
    }
  } catch (error) {
    console.error('搜索失败:', error);
    return NextResponse.json({ 
      error: '搜索失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 