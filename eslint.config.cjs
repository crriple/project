const vue = require('eslint-plugin-vue')
const ts = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')
const vueParser = require('vue-eslint-parser')

module.exports = [
	{ ignores: ['node_modules/**', 'dist/**'] },
	// Vue SFC files
	{
		files: ['**/*.vue'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tsParser,
				sourceType: 'module',
				ecmaVersion: 'latest',
				extraFileExtensions: ['.vue'],
			},
		},
		plugins: { vue, '@typescript-eslint': ts },
		rules: {
			...vue.configs['flat/recommended'].rules,
			...ts.configs.recommended.rules,
			'vue/multi-word-component-names': 'off',
		},
	},
	// TS files
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 'latest',
			},
		},
		plugins: { '@typescript-eslint': ts },
		rules: {
			...ts.configs.recommended.rules,
		},
	},
	// d.ts overrides
	{
		files: ['**/*.d.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
		},
	},
] 