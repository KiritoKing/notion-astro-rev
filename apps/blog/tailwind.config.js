import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';
import typographyPlugin from '@tailwindcss/typography';
import daisyui from 'daisyui';
import tailwindAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--aw-font-sans, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--aw-font-serif, ui-serif)', ...defaultTheme.fontFamily.serif],
        heading: ['var(--aw-font-heading, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
      },
      animation: {
        fade: 'fadeInUp 1s both',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: 0,
            transform: 'translateY(2rem)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            // 标题相关配置
            h1: {
              fontFamily: theme('fontFamily.heading'),
              fontWeight: theme('fontWeight.bold'),
              letterSpacing: theme('letterSpacing.tighter'),
              lineHeight: theme('lineHeight.tighter'),
              scrollMarginTop: '80px',
            },
            h2: {
              fontFamily: theme('fontFamily.heading'),
              fontWeight: theme('fontWeight.bold'),
              letterSpacing: theme('letterSpacing.tighter'),
              lineHeight: theme('lineHeight.tighter'),
              scrollMarginTop: '80px',
            },
            h3: {
              // ... 其他标题级别可以相同配置
            },

            // 链接配置
            a: {
              color: theme('colors.primary'),
              '&:hover': {
                color: theme('colors.primary'),
              },
            },

            // 列表项配置
            li: {
              marginTop: '0',
              marginBottom: '0',
            },

            // 图片配置
            img: {
              borderRadius: theme('borderRadius.md'),
              boxShadow: theme('boxShadow.lg'),
              cursor: 'zoom-in',
            },
          },
        },
        // 暗色模式配置
        invert: {
          css: {
            h1: {
              color: theme('colors.slate.300'),
            },
            h2: {
              color: theme('colors.slate.300'),
            },
            h3: {
              color: theme('colors.slate.300'),
            },
            a: {
              color: theme('colors.blue.400'),
              '&:hover': {
                color: theme('colors.blue.400'),
              },
            },
          },
        },
      }),
    },
  },
  plugins: [
    typographyPlugin,
    plugin(({ addVariant }) => {
      addVariant('intersect', '&:not([no-intersect])');
    }),
    tailwindAnimate,
    daisyui,
  ],
  darkMode: ['selector', '[data-theme="night"]'],
};
