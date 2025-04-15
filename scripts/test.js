#!/usr/bin/env node

/**
 * 综合测试运行脚本
 *
 * 这个脚本提供了一个便捷的方式来运行项目中的各种测试
 * 支持运行特定类型的测试或一次性运行所有测试
 *
 * 使用方法:
 *   npm run test            - 显示帮助信息
 *   npm run test:all        - 运行所有测试
 *   npm run test:e2e        - 运行所有 E2E 测试
 *   npm run test:e2e:basic  - 运行基础页面测试
 *   npm run test:e2e:urls   - 运行 URL 重定向测试
 *   npm run test:e2e:perf   - 运行性能测试
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// 颜色输出函数
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// 测试类型配置
const testTypes = {
  basic: {
    name: '基础页面测试',
    description: '测试关键页面是否能正常加载',
    command: 'npx playwright test tests/e2e/basic-pages.spec.ts',
    color: colors.green,
  },
  urls: {
    name: 'URL 重定向测试',
    description: '测试 URL 重定向是否正常工作',
    command: 'npx playwright test tests/e2e/url-redirects.spec.ts',
    color: colors.blue,
  },
  perf: {
    name: '性能测试',
    description: '测试页面加载性能和资源使用情况',
    command: 'npx playwright test tests/e2e/performance.spec.ts',
    color: colors.magenta,
  },
};

// 确保测试结果目录存在
function ensureDirectoriesExist() {
  const dirs = [join(process.cwd(), 'test-results'), join(process.cwd(), 'test-results', 'performance-reports')];

  dirs.forEach((dir) => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });
}

// 运行单个测试
function runTest(type, options = {}) {
  const { headed = false, debug = false } = options;
  const testConfig = testTypes[type];

  if (!testConfig) {
    console.error(`${colors.red}未知的测试类型: ${type}${colors.reset}`);
    return false;
  }

  console.log(`\n${testConfig.color}${colors.bright}运行${testConfig.name}${colors.reset}`);
  console.log(`${colors.dim}${testConfig.description}${colors.reset}\n`);

  let command = testConfig.command;

  if (headed) {
    command += ' --headed';
  }

  if (debug) {
    command += ' --debug';
  }

  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`\n${colors.green}✓ ${testConfig.name}完成${colors.reset}\n`);
    return true;
  } catch (e) {
    console.error(e);
    console.error(`\n${colors.red}✗ ${testConfig.name}失败${colors.reset}\n`);
    if (!options.continueOnError) {
      process.exit(1);
    }
    return false;
  }
}

// 运行所有测试
function runAllTests(options = {}) {
  console.log(`\n${colors.cyan}${colors.bright}运行所有测试${colors.reset}\n`);

  let allPassed = true;
  const testOptions = { ...options, continueOnError: true };

  // 按顺序运行测试
  allPassed = runTest('basic', testOptions) && allPassed;
  allPassed = runTest('urls', testOptions) && allPassed;
  allPassed = runTest('perf', testOptions) && allPassed;

  if (allPassed) {
    console.log(`\n${colors.green}${colors.bright}✓ 所有测试通过${colors.reset}\n`);
  } else {
    console.error(`\n${colors.red}${colors.bright}✗ 部分测试失败${colors.reset}\n`);
    process.exit(1);
  }
}

// 显示帮助信息
function showHelp() {
  console.log(`
${colors.cyan}${colors.bright}Fuwari 博客测试脚本${colors.reset}

使用方法:
  ${colors.bright}npm run test${colors.reset}            - 显示此帮助信息
  ${colors.bright}npm run test:all${colors.reset}        - 运行所有测试
  ${colors.bright}npm run test:e2e${colors.reset}        - 运行所有 E2E 测试 (同 test:all)
  ${colors.bright}npm run test:e2e:basic${colors.reset}  - 运行基础页面测试
  ${colors.bright}npm run test:e2e:urls${colors.reset}   - 运行 URL 重定向测试
  ${colors.bright}npm run test:e2e:perf${colors.reset}   - 运行性能测试

选项:
  ${colors.bright}--headed${colors.reset}                - 显示浏览器 (默认隐藏)
  ${colors.bright}--debug${colors.reset}                 - 启用调试模式
  `);
}

// 主函数
function main() {
  ensureDirectoriesExist();

  const args = process.argv.slice(2);
  const options = {
    headed: args.includes('--headed'),
    debug: args.includes('--debug'),
  };

  // 移除选项参数
  const testArgs = args.filter((arg) => !arg.startsWith('--'));

  if (testArgs.length === 0 || testArgs[0] === 'help') {
    showHelp();
    return;
  }

  const testType = testArgs[0];

  if (testType === 'all' || testType === 'e2e') {
    runAllTests(options);
  } else if (Object.keys(testTypes).includes(testType)) {
    runTest(testType, options);
  } else {
    console.error(`${colors.red}未知的测试类型: ${testType}${colors.reset}`);
    showHelp();
    process.exit(1);
  }
}

// 运行主函数
main();
