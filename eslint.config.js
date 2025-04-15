// Node.js 内置模块
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ESLint 核心和兼容层
import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';

// ESLint 插件
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Compatibility layer for older ESLint plugins
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// 代码质量规则（不涉及代码风格）
const codeQualityRules = {
  'no-unused-vars': [
    'warn',
    {
      // 允许以下模式的未使用变量
      varsIgnorePattern: '^_', // 以下划线开头的变量
      argsIgnorePattern: '^_', // 以下划线开头的参数
    },
  ],
  'prefer-const': 'warn',
};

// 使用 .prettierrc.cjs 中的配置，不在这里重复定义
// 这样可以避免配置不同步的问题

// Import sorting rules
const importRules = {
  'import/order': [
    'warn',
    {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true },
    },
  ],
  'import/no-duplicates': 'warn',
};

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  // Base ESLint recommended rules
  eslint.configs.recommended,

  // Prettier configuration - using eslint-config-prettier to disable conflicting rules
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'warn',
    },
  },
  ...compat.extends('prettier'),

  // Global variables
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },

  // TypeScript configuration
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    ignores: ['tests/**/*.ts'], // 忽略测试文件，它们将使用单独的配置
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          // 对于下划线开头的变量和参数，以及 i18n 文件中的键，我们允许它们未被使用
          varsIgnorePattern:
            '^(_|home|about|archive|search|tags|categories|recentPosts|comments|untitled|uncategorized|noTags|wordCount|wordsCount|minuteCount|minutesCount|postCount|postsCount|themeColor|lightMode|darkMode|systemMode|more|author|publishedAt|license|Home|Archive|About|K)$',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },

  // Import plugin
  ...compat.extends('plugin:import/recommended', 'plugin:import/typescript'),
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      ...importRules,
      'import/no-unresolved': [
        'error',
        {
          ignore: ['^astro:.*'],
        },
      ],
    },
  },

  // React/JSX configuration
  ...compat.extends('plugin:react/recommended'),
  {
    files: ['**/*.jsx', '**/*.tsx'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Astro files - Disable linting for now since we need a proper parser
  {
    files: ['**/*.astro'],
    ignores: ['**/*.astro'],
  },

  // Svelte files - Disable linting for now since we need a proper parser
  {
    files: ['**/*.svelte'],
    ignores: ['**/*.svelte'],
  },

  // JavaScript/TypeScript common rules
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.mjs', '**/*.cjs'],
    rules: {
      ...codeQualityRules,
      // 使用 Prettier 处理代码风格，这里只保留代码质量相关规则
    },
  },

  // Config files
  {
    files: ['*.config.js', '*.config.mjs', '*.config.ts', '*.config.cjs'],
    rules: {
      'max-len': 'off',
      // 对于配置文件，我们允许更宽松的规则
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
    },
  },

  // 测试文件的 TypeScript 配置
  {
    files: ['tests/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tests/tsconfig.json',
      },
    },
    rules: {
      // 为测试文件设置更宽松的规则
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // Ignore patterns (also configured in .eslintignore file)
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.astro/**',
      '.vercel/**',
      'pnpm-lock.yaml',
      'src/env.d.ts',
      '**/*.astro',
      '**/*.svelte',
    ],
  },

  // 特殊文件处理
  {
    files: ['**/i18n/**/*.ts', '**/types/config.ts', '**/constants/link-presets.ts'],
    rules: {
      // 对于 i18n 文件和特定的配置文件，允许未使用的变量
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];

export default config;
