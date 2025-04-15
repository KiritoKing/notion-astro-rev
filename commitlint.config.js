// ES Module 格式的 commitlint 配置
export default {
  extends: ['@commitlint/config-conventional'],
  // 自定义规则
  rules: {
    // 类型枚举
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 bug
        'docs', // 文档变更
        'style', // 代码格式（不影响功能，例如空格、分号等）
        'refactor', // 重构（既不是新增功能，也不是修改 bug 的代码变动）
        'perf', // 性能优化
        'test', // 增加测试
        'chore', // 构建过程或辅助工具的变动
        'revert', // 回退
        'build', // 打包构建
        'ci', // CI 相关变更
      ],
    ],
    // 提交消息标题最大长度
    'header-max-length': [2, 'always', 72],
    // 提交消息标题为句子，以小写字母开头，不以标点符号结尾
    'subject-case': [0],
  },
};
