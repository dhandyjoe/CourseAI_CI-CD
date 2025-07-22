module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/source'],
	testMatch: [
		'**/__tests__/**/*.test.ts',
		'**/?(*.)+(spec|test).ts'
	],
	collectCoverageFrom: [
		'source/**/*.ts',
		'!source/**/*.test.ts',
		'!source/**/*.spec.ts',
		'!source/app.ts'
	],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'html'],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/source/$1'
	},
	clearMocks: true,
	resetMocks: true,
	restoreMocks: true
};
