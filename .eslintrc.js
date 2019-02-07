module.exports = {
  extends: [
    'eslint:recommended',
    'pedant',
    'plugin:flowtype/recommended',
    'plugin:unicorn/recommended',
    'google'
  ],
  parser: 'babel-eslint',
  plugins: [
    'flowtype'
  ],
  parserOptions: {
    ecmaVersion: 9
  },
  env: {
    node: true,
    es6: true,
  },
  rules: {
    'flowtype/no-types-missing-file-annotation': 0,
    'no-console': 0,
    'unicorn/filename-case': 0,
    'curly': ['error', 'multi-line'],
    'no-inline-comments': 0,
    'max-len': ['error', {'code': 120}],
    'no-else-return': 'error',
    'padding-line-between-statements': [
      'error',
      {'blankLine': 'always', 'prev': '*', 'next': 'return'}
    ]
  }
};
