const nextJest = require('next/jest')

// Provide the path to your Next.js app to load next.config.js and .env files in your test environment
const createJestConfig = nextJest({
  dir: './',
})

// Add any custom config to be passed to Jest
const config = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Use jsdom for a browser-like testing environment
  testEnvironment: 'jest-environment-jsdom',
  
  // If you use module path aliases (like @/components)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Adjust this if your code isn't in a 'src' folder
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config)
