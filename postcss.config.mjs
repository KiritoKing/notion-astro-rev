import postcssImport from 'postcss-import';
import tailwindcss from 'tailwindcss';

/** @type {import('postcss').Config} */
const config = {
  plugins: {
    'postcss-import': postcssImport, // to combine multiple css files
    // 禁用nesting功能，因为我们已经移除了所有嵌套语法
    // 'tailwindcss/nesting': postcssNesting,
    tailwindcss: tailwindcss,
  },
};

export default config;
