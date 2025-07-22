// Mock database untuk testing
export const mockDb = {
	run: jest.fn(),
	all: jest.fn(),
	get: jest.fn()
};

export const getDb = jest.fn(() => mockDb);
export const executeQuery = jest.fn();
export const initDb = jest.fn();
export const checkDbConnection = jest.fn(() => true);

// Helper untuk reset mocks
export const resetDatabaseMocks = () => {
	mockDb.run.mockClear();
	mockDb.all.mockClear();
	mockDb.get.mockClear();
	getDb.mockClear();
	executeQuery.mockClear();
	initDb.mockClear();
	checkDbConnection.mockClear();
};
