
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.ts'], // Укажите путь к вашим тестам
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Используйте ts-jest для трансформации TypeScript
  },
};