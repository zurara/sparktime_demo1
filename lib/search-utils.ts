import puppeteer from 'puppeteer';

export async function searchGoogle(query: string): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true
  });

  try {
    const page = await browser.newPage();
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    
    // 等待搜索结果加载
    await page.waitForSelector('#search');
    
    // 提取搜索结果
    const searchResults = await page.evaluate(() => {
      const results: string[] = [];
      // 获取搜索结果的主要内容
      document.querySelectorAll('.g').forEach((element) => {
        const title = element.querySelector('h3')?.textContent || '';
        const snippet = element.querySelector('.VwiC3b')?.textContent || '';
        if (title || snippet) {
          results.push(`标题: ${title}\n摘要: ${snippet}\n`);
        }
      });
      return results.join('\n');
    });

    return searchResults;
  } finally {
    await browser.close();
  }
} 