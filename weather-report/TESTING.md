# Weather App - Unit Tests

## 🧪 Testing Overview

Unit tests telah dibuat untuk semua fungsi utama dalam aplikasi weather checker ini menggunakan Jest dan TypeScript.

## 📁 Test Structure

```
source/
├── __tests__/
│   ├── weatherService.test.ts    # Test untuk weather service functions
│   ├── weatherController.test.ts # Test untuk controller endpoints  
│   └── apiUtils.test.ts         # Test untuk utility functions
└── __mocks__/
    └── database.ts              # Mock database untuk testing
```

## 🎯 Test Coverage

### WeatherService Tests (`weatherService.test.ts`)
- ✅ `getWeatherForCity()` - 8 test cases
  - Valid city data generation
  - Database saving functionality
  - API key exposure logging (vulnerability test)
  - Error handling
  - SQL injection in city names
  - Random data generation verification

- ✅ `getHistoricalWeather()` - 6 test cases
  - Historical data retrieval with/without date filter
  - Database error handling
  - SQL injection vulnerabilities (security tests)
  - Empty results handling

- ✅ `processAndAnalyzeWeatherData()` - 8 test cases
  - Data analysis calculations (min, max, average)
  - Weather summary generation for different conditions
  - Edge cases (empty array, undefined values)
  - Mixed data handling

### WeatherController Tests (`weatherController.test.ts`)
- ✅ `getWeather()` - 5 test cases
  - Valid weather data endpoints
  - Missing parameter validation
  - Error handling with stack trace exposure (vulnerability)
  - SQL injection attempts
  - Integration tests

- ✅ `getCityHistory()` - 4 test cases
  - Historical data endpoints
  - Parameter validation
  - Date filter functionality
  - Error responses

- ✅ `getWeatherAnalysis()` - 6 test cases
  - Weather analysis with SQL injection vulnerabilities
  - No data found scenarios
  - Database error handling
  - Analysis error handling

- ✅ `adminLogin()` - 6 test cases
  - Hardcoded credentials vulnerability
  - Invalid credential handling
  - Missing parameter validation
  - Integration tests

### ApiUtils Tests (`apiUtils.test.ts`)
- ✅ `doStuff()` - 5 test cases
  - Deep object cloning
  - Primitive value handling
  - Array cloning
  - Complex nested structures

- ✅ `dynamicEval()` - 6 test cases
  - Mathematical expressions
  - String operations
  - Code injection vulnerabilities (security tests)
  - Global scope access vulnerability

- ✅ `formatDate()` & `dateFormat()` - 12+ test cases
  - Date formatting functionality
  - Invalid date handling
  - Error handling inconsistencies (code smell)
  - Duplicate code demonstration

- ✅ `calculateAverageTemperature()` - 7 test cases
  - Average calculations
  - Edge cases (empty array, negatives, decimals)
  - Large arrays and extreme values

- ✅ `calculateMedianTemperature()` - 9 test cases
  - Median calculations for odd/even arrays
  - Unsorted array handling
  - Array mutation prevention

- ✅ `getApiCredentials()` - 4 test cases
  - Hardcoded credentials exposure (vulnerability)
  - Plain text credential verification

## 🔧 Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run linting
npm run lint
```

## 📊 Coverage Targets
- **Functions:** 95%+ coverage
- **Lines:** 90%+ coverage  
- **Branches:** 85%+ coverage

## 🚨 Security & Code Quality Tests

### Security Vulnerabilities Tested:
- ✅ **SQL Injection** - Direct string concatenation in queries
- ✅ **API Key Exposure** - Hardcoded secrets in logs
- ✅ **Code Injection** - Dangerous use of `eval()`
- ✅ **Information Disclosure** - Stack traces in error responses
- ✅ **Hardcoded Credentials** - Plain text passwords and tokens

### Code Smells Tested:
- ✅ **Zombie Code** - Unused functions and commented code
- ✅ **Duplicate Code** - Similar functions with slight variations
- ✅ **Long Functions** - Functions with multiple responsibilities
- ✅ **Poor Naming** - Inconsistent variable and function names
- ✅ **Inconsistent Error Handling** - Different error handling approaches

## 🛠 Configuration Files

- **`jest.config.js`** - Jest configuration
- **`jest.setup.js`** - Test setup and mocks
- **`.eslintrc.js`** - ESLint rules for code quality
- **`tsconfig.json`** - TypeScript configuration updated for testing

## 📈 Test Results Example

```
PASS source/__tests__/weatherService.test.ts
PASS source/__tests__/weatherController.test.ts  
PASS source/__tests__/apiUtils.test.ts

Test Suites: 3 passed, 3 total
Tests:       50+ passed, 50+ total
Snapshots:   0 total
Time:        X.XXs
```

## 💡 Notes

- Tests include deliberate vulnerability testing to demonstrate security issues
- Mock implementations prevent actual API calls and database operations
- Console output is mocked to reduce test noise
- Integration tests verify end-to-end functionality
- Code coverage reports highlight areas needing attention

Semua test dirancang untuk mendemonstrasikan baik functionality yang benar maupun vulnerability yang sengaja dibuat untuk tujuan edukasi.
