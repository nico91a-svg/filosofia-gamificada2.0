import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
    { ignores: ['dist/**', 'dist-e2e/**', 'android/**', 'ios/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'] },
    js.configs.recommended,
    {
        files: ['src/**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: 'module',
            globals: { ...globals.browser },
            parserOptions: { ecmaFeatures: { jsx: true } }
        },
        plugins: { 'react-hooks': reactHooks },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^React$' }],
            'no-redeclare': 'error',
            'no-prototype-builtins': 'off'
        }
    },
    {
        files: ['*.{js,mjs}', 'scripts/**', 'tests/**', 'e2e/**'],
        languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: { ...globals.node, ...globals.browser } }
    }
];
