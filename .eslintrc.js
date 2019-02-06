module.exports = {
    extends: ['pedant', 'plugin:flowtype/recommended'],
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
        'flowtype/no-types-missing-file-annotation': 0
    }
};
