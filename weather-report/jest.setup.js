// Jest setup file
// Mock console to reduce noise in tests
const originalConsole = global.console;

global.console = {
	...originalConsole,
	log: jest.fn(),
	error: jest.fn(),
	warn: jest.fn(),
};

// Reset console mocks before each test
beforeEach(() => {
	jest.clearAllMocks();
});
