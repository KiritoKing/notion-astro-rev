import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import { test, expect } from '@playwright/test';

// 定义要测试的关键页面
const pagesToTest = [
  { path: '/', name: '首页' },
  { path: '/archive/', name: '归档页' },
  { path: '/posts/blog-solution/', name: '博客文章页' },
];

// 性能指标阈值
const performanceThresholds = {
  loadTime: 3000, // 页面加载时间阈值（毫秒）
  resourceCount: 100, // 资源数量阈值
  transferSize: 3 * 1024 * 1024, // 传输大小阈值（3MB）
};

// 格式化文件大小
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// 格式化时间
function formatTime(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

// 生成性能报告
test.describe('页面性能测试', () => {
  for (const page of pagesToTest) {
    test(`测量 ${page.name} (${page.path}) 的性能`, async ({ page: browserPage }) => {
      // 创建性能数据收集对象
      const performanceData: PerformanceData = {
        url: page.path,
        name: page.name,
        timestamp: new Date().toISOString(),
        metrics: {
          loadTime: 0,
          domContentLoaded: 0,
          firstPaint: 0,
          firstContentfulPaint: 0,
        },
        resources: {
          total: 0,
          size: 0,
          byType: {},
        },
        status: 'pass',
        warnings: [],
      };

      // 开始计时
      const startTime = Date.now();

      // 访问页面并等待加载完成
      const response = await browserPage.goto(page.path, {
        waitUntil: 'networkidle',
      });

      // 计算加载时间
      performanceData.metrics.loadTime = Date.now() - startTime;

      // 检查响应状态
      expect(response?.status()).toBeLessThan(400);

      // 收集性能指标
      const performanceMetrics = await browserPage.evaluate(() => {
        const perfEntries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: perfEntries.domContentLoadedEventEnd - perfEntries.startTime,
          firstPaint: 0, // 需要单独获取
          firstContentfulPaint: 0, // 需要单独获取
        };
      });

      // 获取 First Paint 和 First Contentful Paint
      const paintMetrics = await browserPage.evaluate(() => {
        const entries = performance.getEntriesByType('paint');
        const firstPaint = entries.find((entry) => entry.name === 'first-paint');
        const firstContentfulPaint = entries.find((entry) => entry.name === 'first-contentful-paint');
        return {
          firstPaint: firstPaint ? firstPaint.startTime : 0,
          firstContentfulPaint: firstContentfulPaint ? firstContentfulPaint.startTime : 0,
        };
      });

      // 更新性能指标
      performanceData.metrics.domContentLoaded = performanceMetrics.domContentLoaded;
      performanceData.metrics.firstPaint = paintMetrics.firstPaint;
      performanceData.metrics.firstContentfulPaint = paintMetrics.firstContentfulPaint;

      // 收集资源信息
      const resourcesInfo = await browserPage.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        const resourcesByType: Record<string, { count: number; size: number }> = {};
        let totalSize = 0;

        resources.forEach((resource) => {
          const url = new URL(resource.name);
          const extension = url.pathname.split('.').pop()?.toLowerCase() || 'unknown';
          let type = extension;

          // 根据扩展名或内容类型分类资源
          if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) {
            type = 'images';
          } else if (['js', 'mjs'].includes(extension)) {
            type = 'scripts';
          } else if (['css'].includes(extension)) {
            type = 'styles';
          } else if (['woff', 'woff2', 'ttf', 'otf'].includes(extension)) {
            type = 'fonts';
          } else if (['json', 'xml'].includes(extension)) {
            type = 'data';
          }

          if (!resourcesByType[type]) {
            resourcesByType[type] = { count: 0, size: 0 };
          }

          resourcesByType[type].count += 1;
          resourcesByType[type].size += (resource as PerformanceResourceTiming).transferSize || 0;
          totalSize += (resource as PerformanceResourceTiming).transferSize || 0;
        });

        return {
          total: resources.length,
          size: totalSize,
          byType: resourcesByType,
        };
      });

      // 更新资源信息
      performanceData.resources = resourcesInfo;

      // 检查是否超过阈值
      if (performanceData.metrics.loadTime > performanceThresholds.loadTime) {
        performanceData.warnings.push(
          `页面加载时间 (${formatTime(performanceData.metrics.loadTime)}) 超过阈值 (${formatTime(performanceThresholds.loadTime)})`
        );
      }

      if (performanceData.resources.total > performanceThresholds.resourceCount) {
        performanceData.warnings.push(
          `资源数量 (${performanceData.resources.total}) 超过阈值 (${performanceThresholds.resourceCount})`
        );
      }

      if (performanceData.resources.size > performanceThresholds.transferSize) {
        performanceData.warnings.push(
          `传输大小 (${formatSize(performanceData.resources.size)}) 超过阈值 (${formatSize(performanceThresholds.transferSize)})`
        );
      }

      // 如果有警告，标记为警告状态
      if (performanceData.warnings.length > 0) {
        performanceData.status = 'warning';
      }

      // 生成可读性更好的报告
      const report = generateReadableReport(performanceData);

      // 输出报告到控制台
      console.log(report);

      // 将报告保存到文件
      try {
        const reportsDir = join(process.cwd(), 'test-results', 'performance-reports');

        // 确保目录存在
        if (!existsSync(reportsDir)) {
          mkdirSync(reportsDir, { recursive: true });
        }

        const fileName = `${page.name.replace(/\s+/g, '-')}-${new Date().toISOString().replace(/:/g, '-')}.txt`;
        const filePath = join(reportsDir, fileName);
        writeFileSync(filePath, report);
        console.log(`性能报告已保存到: ${filePath}`);
      } catch (error) {
        console.error('保存报告时出错:', error);
      }

      // 如果有警告，不要使测试失败，但输出警告
      if (performanceData.warnings.length > 0) {
        console.warn(`⚠️ ${page.name} 性能警告:\n${performanceData.warnings.join('\n')}`);
      }
    });
  }
});

interface PerformanceData {
  url: string;
  name: string;
  timestamp: string;
  metrics: {
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
  };
  resources: {
    total: number;
    size: number;
    byType: Record<string, { count: number; size: number }>;
  };
  status: string;
  warnings: string[];
}

// 生成可读性更好的报告
function generateReadableReport(data: PerformanceData): string {
  const { url, name, timestamp, metrics, resources, status, warnings } = data;

  // 创建表格样式的报告
  const lines = [
    `=== 性能测试报告: ${name} (${url}) ===`,
    `测试时间: ${new Date(timestamp).toLocaleString()}`,
    `状态: ${status === 'pass' ? '✅ 通过' : '⚠️ 警告'}`,
    '',
    '--- 性能指标 ---',
    `页面加载时间: ${formatTime(metrics.loadTime)}`,
    `DOM 内容加载: ${formatTime(metrics.domContentLoaded)}`,
    `首次绘制: ${formatTime(metrics.firstPaint)}`,
    `首次内容绘制: ${formatTime(metrics.firstContentfulPaint)}`,
    '',
    '--- 资源统计 ---',
    `总资源数: ${resources.total}`,
    `总传输大小: ${formatSize(resources.size)}`,
    '',
    '--- 资源类型明细 ---',
  ];

  // 添加资源类型明细
  Object.entries(resources.byType)
    .sort((a, b) => b[1].size - a[1].size)
    .forEach(([type, info]) => {
      lines.push(`${type.padEnd(10)}: ${info.count} 个文件, ${formatSize(info.size)}`);
    });

  // 添加警告信息
  if (warnings.length > 0) {
    lines.push('', '--- 警告 ---');
    warnings.forEach((warning) => lines.push(`⚠️ ${warning}`));
  }

  return lines.join('\n');
}
