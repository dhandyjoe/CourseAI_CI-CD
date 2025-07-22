module.exports = {
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	extends: [
		'eslint:recommended'
	],
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	env: {
		node: true,
		jest: true,
		es6: true,
	},
	rules: {
		'@typescript-eslint/no-unused-vars': 'warn',
		'@typescript-eslint/no-explicit-any': 'off', // Allow 'any' for vulnerable code demo
		'@typescript-eslint/no-empty-function': 'off',
		'no-console': 'off', // Allow console for demo purposes
		'no-unused-vars': 'warn', // Change to warning
		'no-unreachable': 'warn', // Change to warning
		'prefer-const': 'warn',
		'no-var': 'warn',
	},
	ignorePatterns: [
		'dist/',
		'node_modules/',
		'coverage/',
		'*.js'
	]
};
