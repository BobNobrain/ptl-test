module.exports = {
    root: true,
    env: {
        browser: true,
        node: true
    },
    parserOptions: {
        parser: 'babel-eslint'
    },
    extends: [
        'standard'
    ],
    plugins: [
        'import'
    ],
    rules: {
        'comma-style': ['warn', 'last', {
            'exceptions': {
                'VariableDeclaration': true
            }
        }],
        'curly': ['off'],
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'semi': ['error', 'always'],
        'indent': ['warn', 4, {
            'SwitchCase': 1,
            'VariableDeclarator': 1,
            'outerIIFEBody': 1,
            'MemberExpression': 1,
            'FunctionDeclaration': { 'parameters': 1, 'body': 1 },
            'FunctionExpression': { 'parameters': 1, 'body': 1 },
            'CallExpression': { 'arguments': 1 },
            'ArrayExpression': 1,
            'ObjectExpression': 1,
            'ImportDeclaration': 1,
            'flatTernaryExpressions': false,
            'ignoreComments': false
        }],
        'no-multiple-empty-lines': ['error', {
            'max': 2,
            'maxEOF': 1,
            'maxBOF': 0
        }],
        'one-var': ['off'],
        'space-before-function-paren': ['error', {
            'anonymous': 'always',
            'named': 'never',
            'asyncArrow': 'always'
        }]
    }
}
