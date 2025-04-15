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
  firstContentfulPaint: 1500, // 首次内容绘制阈值（毫秒）
  largestContentfulPaint: 2500, // 最大内容绘制阈值（毫秒）
  cumulativeLayoutShift: 0.1, // 累积布局偏移阈值
  totalBlockingTime: 300, // 总阻塞时间阈值（毫秒）
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
          largestContentfulPaint: 0,
          cumulativeLayoutShift: 0,
          totalBlockingTime: 0,
          timeToInteractive: 0,
        },
        resources: {
          total: 0,
          size: 0,
          byType: {},
        },
        status: 'pass',
        warnings: [],
        scores: {
          performance: 0,
          accessibility: 0,
          bestPractices: 0,
          seo: 0,
        },
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

      // 获取更多性能指标
      const webVitals = await browserPage.evaluate(() => {
        // 获取基本绘制指标
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find((entry) => entry.name === 'first-paint');
        const firstContentfulPaint = paintEntries.find((entry) => entry.name === 'first-contentful-paint');

        // 尝试获取 LCP（最大内容绘制）
        let largestContentfulPaint = 0;
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries && lcpEntries.length > 0) {
          largestContentfulPaint = lcpEntries[lcpEntries.length - 1].startTime;
        }

        // 尝试获取 CLS（累积布局偏移）
        let cumulativeLayoutShift = 0;
        try {
          const layoutShiftEntries = performance.getEntriesByType('layout-shift');
          if (layoutShiftEntries && layoutShiftEntries.length > 0) {
            // 由于 TypeScript 类型限制，使用 any 类型处理
            cumulativeLayoutShift = (layoutShiftEntries as any[]).reduce(
              (total, entry) => total + (entry.value || 0),
              0
            );
          }
        } catch (e) {
          // 如果不支持，忽略错误
          console.log('无法获取布局偏移数据', e);
        }

        // 尝试获取 TBT（总阻塞时间）
        let totalBlockingTime = 0;
        const longTaskEntries = performance.getEntriesByType('longtask');
        if (longTaskEntries && longTaskEntries.length > 0) {
          totalBlockingTime = longTaskEntries.reduce((total, entry) => {
            return total + (entry.duration - 50); // 50ms 是长任务的阈值
          }, 0);
        }

        // 估算 TTI（可交互时间）
        let timeToInteractive = 0;
        try {
          const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
          if (navigationEntry && navigationEntry.domInteractive) {
            timeToInteractive = navigationEntry.domInteractive + totalBlockingTime;
          }
        } catch (e) {
          console.log('无法获取可交互时间数据', e);
        }

        return {
          firstPaint: firstPaint ? firstPaint.startTime : 0,
          firstContentfulPaint: firstContentfulPaint ? firstContentfulPaint.startTime : 0,
          largestContentfulPaint,
          cumulativeLayoutShift,
          totalBlockingTime,
          timeToInteractive,
        };
      });

      // 更新性能指标
      performanceData.metrics.domContentLoaded = performanceMetrics.domContentLoaded;
      performanceData.metrics.firstPaint = webVitals.firstPaint;
      performanceData.metrics.firstContentfulPaint = webVitals.firstContentfulPaint;
      performanceData.metrics.largestContentfulPaint = webVitals.largestContentfulPaint;
      performanceData.metrics.cumulativeLayoutShift = webVitals.cumulativeLayoutShift;
      performanceData.metrics.totalBlockingTime = webVitals.totalBlockingTime;
      performanceData.metrics.timeToInteractive = webVitals.timeToInteractive;

      // 计算简单的性能分数 (0-100)
      const calculateScore = (value: number, threshold: number, isLowerBetter = true) => {
        if (value === 0) return null; // 无数据
        return isLowerBetter
          ? Math.max(0, Math.min(100, 100 - (value / threshold) * 100))
          : Math.max(0, Math.min(100, (value / threshold) * 100));
      };

      // 计算性能分数
      const fcp = calculateScore(
        performanceData.metrics.firstContentfulPaint,
        performanceThresholds.firstContentfulPaint
      );
      const lcp = calculateScore(
        performanceData.metrics.largestContentfulPaint,
        performanceThresholds.largestContentfulPaint
      );
      const cls = calculateScore(
        performanceData.metrics.cumulativeLayoutShift,
        performanceThresholds.cumulativeLayoutShift
      );
      const tbt = calculateScore(performanceData.metrics.totalBlockingTime, performanceThresholds.totalBlockingTime);

      // 综合性能分数
      if (fcp && lcp && cls && tbt) {
        performanceData.scores!.performance = Math.round(fcp * 0.15 + lcp * 0.35 + cls * 0.25 + tbt * 0.25);
      }

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

      // 检查 Web Vitals 指标
      if (performanceData.metrics.firstContentfulPaint > performanceThresholds.firstContentfulPaint) {
        performanceData.warnings.push(
          `首次内容绘制 (${formatTime(performanceData.metrics.firstContentfulPaint)}) 超过阈值 (${formatTime(performanceThresholds.firstContentfulPaint)})`
        );
      }

      if (performanceData.metrics.largestContentfulPaint > performanceThresholds.largestContentfulPaint) {
        performanceData.warnings.push(
          `最大内容绘制 (${formatTime(performanceData.metrics.largestContentfulPaint)}) 超过阈值 (${formatTime(performanceThresholds.largestContentfulPaint)})`
        );
      }

      if (performanceData.metrics.cumulativeLayoutShift > performanceThresholds.cumulativeLayoutShift) {
        performanceData.warnings.push(
          `累积布局偏移 (${performanceData.metrics.cumulativeLayoutShift.toFixed(3)}) 超过阈值 (${performanceThresholds.cumulativeLayoutShift})`
        );
      }

      if (performanceData.metrics.totalBlockingTime > performanceThresholds.totalBlockingTime) {
        performanceData.warnings.push(
          `总阻塞时间 (${formatTime(performanceData.metrics.totalBlockingTime)}) 超过阈值 (${formatTime(performanceThresholds.totalBlockingTime)})`
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
    largestContentfulPaint?: number;
    cumulativeLayoutShift?: number;
    totalBlockingTime?: number;
    timeToInteractive?: number;
  };
  resources: {
    total: number;
    size: number;
    byType: Record<string, { count: number; size: number }>;
  };
  status: string;
  warnings: string[];
  scores?: {
    performance?: number;
    accessibility?: number;
    bestPractices?: number;
    seo?: number;
  };
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
  ];

  // 添加高级指标（如果有数据）
  if (metrics.largestContentfulPaint) {
    lines.push(`最大内容绘制: ${formatTime(metrics.largestContentfulPaint)}`);
  }

  if (metrics.cumulativeLayoutShift !== undefined) {
    lines.push(`累积布局偏移: ${metrics.cumulativeLayoutShift.toFixed(3)}`);
  }

  if (metrics.totalBlockingTime) {
    lines.push(`总阻塞时间: ${formatTime(metrics.totalBlockingTime)}`);
  }

  if (metrics.timeToInteractive) {
    lines.push(`可交互时间: ${formatTime(metrics.timeToInteractive)}`);
  }

  // 添加性能分数（如果有）
  if (data.scores && data.scores.performance) {
    lines.push(`性能分数: ${data.scores.performance}/100`);
  }

  lines.push(
    '',
    '--- 资源统计 ---',
    `总资源数: ${resources.total}`,
    `总传输大小: ${formatSize(resources.size)}`,
    '',
    '--- 资源类型明细 ---'
  );

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
