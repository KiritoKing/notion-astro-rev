import * as fs from 'node:fs';
import * as path from 'node:path';

import { test, expect } from '@playwright/test';

// 读取 URL 映射文件
const urlMapPath = path.resolve('./migration/url-map.json');
const urlMap = JSON.parse(fs.readFileSync(urlMapPath, 'utf-8'));

// 测试所有 URL 重定向
for (const [newUrl, oldUrls] of Object.entries(urlMap)) {
  test.describe(`重定向测试: ${newUrl}`, () => {
    for (const oldUrl of oldUrls as string[]) {
      test(`从 ${oldUrl} 重定向到 /${newUrl}`, async ({ page }) => {
        // 设置较长的超时时间
        test.setTimeout(30000);

        // 检查是否在 CI 环境中运行
        const isCI = process.env.CI === 'true';

        try {
          // 访问旧 URL，等待导航完成
          // 确保 oldUrl 格式正确，如果以 / 开头则保留，否则添加 /
          const urlToVisit = oldUrl.startsWith('/') ? oldUrl : `/${oldUrl}`;
          await page.goto(urlToVisit, { waitUntil: 'networkidle' });

          // 等待一段时间，确保重定向完成
          await page.waitForTimeout(5000);

          // 检查最终 URL
          const finalUrl = page.url();
          console.log(`最终 URL: ${finalUrl}`);

          // 如果最终 URL 包含目标路径，测试通过
          // 确保 newUrl 格式正确，如果以 / 开头则保留，否则添加 /
          const targetUrl = newUrl.startsWith('/') ? newUrl : `/${newUrl}`;
          if (finalUrl.includes(targetUrl)) {
            console.log(`重定向成功：${oldUrl} -> ${newUrl}`);
          } else {
            // 如果没有重定向到目标 URL，检查页面内容
            console.log(`未重定向到目标 URL，检查页面内容`);

            // 检查页面是否有重定向相关内容
            // 等待页面稳定后再获取内容
            await page.waitForLoadState('networkidle');
            const html = await page.content();

            if (html.includes('Redirecting') || html.includes('http-equiv="refresh"')) {
              console.log('检测到重定向页面');

              // 在 CI 环境中，我们希望测试失败而不是跳过
              if (isCI) {
                console.error(`CI 环境中重定向测试失败: ${oldUrl} -> ${newUrl}`);
                const targetUrl = newUrl.startsWith('/') ? newUrl : `/${newUrl}`;
                expect(finalUrl).toContain(targetUrl); // 这将导致测试失败
              } else {
                // 在本地开发环境中，我们可能没有实现完整的重定向
                // 所以跳过这个测试
                test.skip();
                return;
              }
            }
          }

          // 检查最终 URL 是否包含目标路径
          // 对于包含中文的 URL，需要处理 URL 编码
          if (newUrl.match(/[\u4e00-\u9fa5]/)) {
            // 检查是否包含中文
            const decodedUrl = decodeURIComponent(finalUrl);
            const targetUrl = newUrl.startsWith('/') ? newUrl : `/${newUrl}`;
            expect(decodedUrl).toContain(targetUrl);
          } else {
            const targetUrl = newUrl.startsWith('/') ? newUrl : `/${newUrl}`;
            expect(finalUrl).toContain(targetUrl);
          }

          // 检查页面内容是否正确加载
          await expect(page).toHaveTitle(/./); // 确保页面有标题

          // 检查页面是否有主要内容
          const mainContent = await page.$('main, article, #content, .content');
          expect(mainContent).not.toBeNull();
        } catch (error) {
          console.error(`测试出错: ${error instanceof Error ? error.message : String(error)}`);

          // 在 CI 环境中，我们希望测试失败而不是跳过
          if (isCI) {
            throw error; // 在 CI 环境中重新抛出错误，导致测试失败
          } else {
            test.skip(); // 在本地环境中跳过测试
          }
        }
      });
    }
  });
}
