const baseDir = __dirname

module.exports = {
  env: {
    es2021: true,
    jest: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'prettier',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    createDefaultProgram: true,
    ecmaVersion: 12,
    project: ['./src/tsconfig.json'],
    sourceType: 'module',
    tsconfigRootDir: baseDir,
  },
  plugins: ['@typescript-eslint', 'prettier', 'simple-import-sort'],
  root: true,
  rules: {
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/member-ordering': [
      'error',
      {
        classes: ['public-static-field', 'public-instance-method'],
        default: ['signature', 'field', 'method'],
      },
    ],
    '@typescript-eslint/no-implied-eval': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/unbound-method': 'off',
    'linebreak-style': ['error', 'unix'],
    'no-template-curly-in-string': 'error',
    'prefer-template': 'error',
    'prettier/prettier': 'error',
    'require-await': 'error',
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': 'error',
    'sort-imports': 'off',
    'sort-keys': 'error',
  },
}
