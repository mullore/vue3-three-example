module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    // 'vue/setup-compiler-macros': true, // 使用setup语法糖
  },
  extends: [
    'prettier',
    'standard',
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  parser: 'vue-eslint-parser',
  plugins: ['vue', '@typescript-eslint', 'prettier'],
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-console': 0,
    'vue/comment-directive': 0,
    // key 为规则名，value 配置内容
    'no-cond-assign': ['error', 'always'],
    '@typescript-eslint/no-this-alias': 'warn',
    '@typescript-eslint/adjacent-overload-signatures': 'warn',
    'vue/singleline-html-element-content-newline': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    // 原始是warn 暂时关闭any检查后续恢复跳转
    '@typescript-eslint/no-explicit-any': ['off'],
    // 关闭驼峰命名规则验证(变量不允许下划线,常量除外)
    camelcase: [
      0,
      {
        properties: 'always',
      },
    ],
    // 忽略默认的禁令类型
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          // un-ban a type that's banned by default
          String: false,
          Boolean: false,
          Number: false,
          Symbol: false,
          '{}': false,
          Object: false,
          object: false,
          Function: false,
        },
        extendDefaults: true,
      },
    ],
    // 要求组件命称始终为多词组件名称
    'vue/multi-word-component-names': 'off',
    'vue/valid-template-root': 'off',
    'vue/html-self-closing': 'off',
    'prettier/prettier': 'off',
    // 'vue/html-self-closing': [
    //   'error',
    //   {
    //     html: {
    //       void: 'never',
    //       normal: 'always',
    //       component: 'always',
    //     },
    //     svg: 'always',
    //     math: 'always',
    //   },
    // ],
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: {
          max: 10,
        },
        multiline: {
          max: 1,
        },
      },
    ],
  },
};
