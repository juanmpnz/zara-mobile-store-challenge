import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import globals from 'globals';
import query from '@tanstack/eslint-plugin-query';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'src/routeTree.gen.ts'] },
  ...query.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
      },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '(^|/)\\.\\.(/|$)',
              message: 'Use @/ for imports outside the current directory.',
            },
          ],
        },
      ],
      'react-refresh/only-export-components': [
        'error',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['src/routes/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': [
        'error',
        { allowConstantExport: true, allowExportNames: ['Route'] },
      ],
    },
  },
  {
    files: ['*.config.ts'],
    languageOptions: { globals: globals.node },
  },
);
