module.exports = {
	root: true,
	env: { browser: true, es2021: true, node: true },
	extends: [
		'eslint:recommended',
		'plugin:vue/vue3-recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
	],
	parser: 'vue-eslint-parser',
	parserOptions: {
		ecsmaVersion: 2021,
		sourceType: 'module',
		extraFileExtensions: ['.vue'],
		parser: '@typescript-eslint/parser',
	},
	rules: {
		'vue/multi-word-component-names': 'off',
	},
} 