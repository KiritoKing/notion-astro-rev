import { test, expect } from '@playwright/test';

// 定义要测试的关键页面
const criticalPages = [
  { path: '/', title: '首页' },
  { path: '/archive/', title: '归档' },
  { path: '/archive/tag/', title: '标签' },
  { path: '/archive/category/', title: '分类' },
];

// 基础白屏测试 - 确保关键页面能够正常加载，不会出现白屏
test.describe('基础页面加载测试', () => {
  for (const page of criticalPages) {
    test(`${page.title} (${page.path}) 能够正常加载`, async ({ page: browserPage }) => {
      // 访问页面
      const response = await browserPage.goto(page.path);

      // 检查响应状态
      expect(response?.status()).toBeLessThan(400);

      // 确保页面有标题
      await expect(browserPage).toHaveTitle(/./);

      // 检查页面是否有主要内容
      const mainContent = await browserPage.$('main, article, #content, .content, body');
      expect(mainContent).not.toBeNull();

      // 检查是否有导航元素 (可选)
      const navigation = await browserPage.$('nav, header, .header, .navigation, .navbar');
      if (navigation) {
        console.log(`找到导航元素: ${page.title}`);
      } else {
        console.log(`未找到导航元素: ${page.title}`);
      }

      // 检查是否有页脚 (可选)
      const footer = await browserPage.$('footer, .footer');
      if (footer) {
        console.log(`找到页脚元素: ${page.title}`);
      } else {
        console.log(`未找到页脚元素: ${page.title}`);
      }

      // 检查页面是否有文本内容
      const bodyText = await browserPage.textContent('body');
      expect(bodyText?.length).toBeGreaterThan(50);

      // 截图以便视觉检查
      await browserPage.screenshot({ path: `./playwright-results/${page.path.replace(/\//g, '-') || 'home'}.png` });
    });
  }
});

// 检查页面加载性能
test.describe('页面加载性能测试', () => {
  test('首页加载性能', async ({ page }) => {
    // 启用性能测量
    await page.goto('/', { waitUntil: 'networkidle' });

    // 执行性能测量
    const performanceTiming = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType('navigation');
      return perfEntries.length > 0 ? perfEntries[0] : null;
    });

    // 验证性能指标
    expect(performanceTiming).not.toBeNull();

    // 输出性能指标以供参考
    console.log('首页加载性能指标:', performanceTiming);
  });
});
