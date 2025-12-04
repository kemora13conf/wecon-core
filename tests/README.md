# @wecon/core - Test Suite

Comprehensive test suite for the @wecon/core package, ensuring quality and reliability for production use.

## 📊 Test Coverage

This test suite covers the following units:

### ✅ Error Classes (`tests/errors/`)

- **ConfigError** - Configuration error handling with metadata
- **RequestError** - Request error handling for runtime issues

### ✅ Library Classes (`tests/lib/`)

- **PostmanForRoute** - Postman request-level configuration
- **PostmanForRoutes** - Postman folder/collection configuration
- **RoutesParam** - Route parameter validation and middleware

### ✅ Utilities (`tests/utils/`)

- **RaiMatcher** - Route matching with caching and performance optimization

### 🚧 Pending (To be added)

- **Route** - Individual route endpoint testing
- **Routes** - Route group and hierarchy testing
- **Wecon** - Main framework class testing
- **ErrorCatcher** - Base class utilities testing

## 🚀 Running Tests

### Run All Tests

```bash
yarn test
```

### Run Tests in Watch Mode

```bash
yarn test:watch
```

### Run Tests with Coverage

```bash
yarn test:coverage
```

### Run Tests with Verbose Output

```bash
yarn test:verbose
```

### Run Development Test File

```bash
yarn test:dev
```

## 📁 Test Structure

```
tests/
├── errors/              # Error class tests
│   ├── ConfigError.test.ts
│   └── RequestError.test.ts
├── lib/                 # Core library tests
│   ├── PostmanForRoute.test.ts
│   ├── PostmanForRoutes.test.ts
│   └── RoutesParam.test.ts
└── utils/               # Utility tests
    └── RaiMatcher.test.ts
```

## 🧪 Test Categories

### Unit Tests

Each class is tested in isolation with comprehensive coverage:

1. **Constructor Tests** - Verify proper initialization
2. **Property Tests** - Ensure properties are set correctly
3. **Method Tests** - Validate method behavior
4. **Validation Tests** - Check error handling and validation
5. **Edge Cases** - Test boundary conditions
6. **Integration Points** - Verify class interactions

### Test Patterns

#### ConfigError & RequestError

- Instance creation and type checking
- Message and metadata handling
- Stack trace capture
- Prototype chain maintenance
- Error throwing and catching
- Edge cases (empty strings, special characters, long messages)

#### PostmanForRoute & PostmanForRoutes

- Basic property initialization
- Postman schema v2.1.0 compliance
- Authentication configurations (Bearer, API Key, Basic, OAuth2)
- Variable handling (string, number, boolean, any)
- Event handling (pre-request, test scripts)
- Protocol profile behavior
- Complex configurations with all properties

#### RoutesParam

- Path and middleware initialization
- UUID generation and uniqueness
- Pattern validation (RegEx)
- Length validation (min/max)
- Custom validator functions
- Combined validation rules
- Edge cases (empty strings, unicode, long values)

#### RaiMatcher

- Exact route matching
- Dynamic route matching (parameters)
- HTTP method differentiation
- Route specificity and priority
- Caching functionality
- Performance characteristics
- Error handling
- Edge cases (root path, deep nesting, long values)

## 📈 Current Test Statistics

- **Total Test Suites**: 6
- **Total Tests**: 160+
- **Pass Rate**: 100%
- **Coverage Goal**: 80%+

## 🔧 Configuration

### Jest Configuration (`jest.config.js`)

- **Preset**: ts-jest with ESM support
- **Environment**: Node.js
- **Test Match**: `**/*.test.ts` and `**/*.spec.ts`
- **Coverage**: Excludes types and test files
- **Timeout**: 10 seconds per test

### ESM Support

Tests use ESM modules with the `--experimental-vm-modules` flag for Node.js compatibility.

## ✍️ Writing New Tests

### Template for New Test File

```typescript
import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import YourClass from "../../src/lib/YourClass.js";

describe("YourClass", () => {
  describe("Constructor", () => {
    it("should create an instance", () => {
      const instance = new YourClass(config);
      expect(instance).toBeInstanceOf(YourClass);
    });
  });

  describe("Method Name", () => {
    it("should do something specific", () => {
      // Arrange
      const instance = new YourClass(config);

      // Act
      const result = instance.method();

      // Assert
      expect(result).toBe(expectedValue);
    });
  });

  describe("Edge Cases", () => {
    it("should handle edge case", () => {
      // Test edge case
    });
  });
});
```

### Best Practices

1. **Use Descriptive Test Names**: Test names should clearly describe what is being tested
2. **Follow AAA Pattern**: Arrange, Act, Assert
3. **Test One Thing**: Each test should verify one specific behavior
4. **Use beforeEach/afterEach**: For setup and teardown
5. **Mock External Dependencies**: Isolate the unit under test
6. **Test Edge Cases**: Empty values, null, undefined, very large values
7. **Test Error Scenarios**: Ensure errors are thrown when expected

## 🐛 Debugging Tests

### Run Specific Test File

```bash
yarn test tests/errors/ConfigError.test.ts
```

### Run Specific Test Suite

```bash
yarn test -t "ConfigError"
```

### Run with Node Inspector

```bash
node --inspect-brk --experimental-vm-modules node_modules/jest/bin/jest.js
```

## 📝 Coverage Reports

Coverage reports are generated in the `coverage/` directory:

- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Report**: `coverage/lcov.info`
- **Text Summary**: Console output

### View Coverage

```bash
yarn test:coverage
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
```

## 🔍 CI/CD Integration

### Pre-publish Tests

Tests automatically run before publishing:

```bash
yarn prepublishOnly  # Runs build, which should include tests
```

### Recommended CI Workflow

```yaml
- name: Run Tests
  run: yarn test

- name: Check Coverage
  run: yarn test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## 🎯 Quality Standards

- **All tests must pass** before merging
- **No skipped tests** in main branch
- **Coverage must be ≥ 80%** for core modules
- **New features must include tests**
- **Bug fixes must include regression tests**

## 🤝 Contributing

When adding new features or fixing bugs:

1. Write tests first (TDD approach)
2. Ensure all existing tests pass
3. Add tests for new functionality
4. Update this README if adding new test suites
5. Verify coverage hasn't decreased

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
