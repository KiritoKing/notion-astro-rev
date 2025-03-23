import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        ...eslint.configs.recommended.languageOptions.globals,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'import': importPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {},
      },
    },
    rules: {
      // Match Biome's semicolons: "asNeeded"
      'semi': ['error', 'never'],
      'semi-style': ['error', 'first'],
      
      // Match Biome's quotes: "single"
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'jsx-quotes': ['error', 'prefer-single'],
      
      // Match Biome's trailingCommas: "all"
      'comma-dangle': ['error', 'always-multiline'],
      
      // Match Biome's arrowParentheses: "asNeeded"
      'arrow-parens': ['error', 'as-needed'],
      
      // Import organization (Biome has organizeImports enabled)
      'import/order': ['error', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
      }],
      
      // Additional common rules
      'no-console': ['warn'],
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'src/config.ts'],
  }
);
