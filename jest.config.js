module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['lib/', 'node_modules/'],
  rootDir: 'src',
  coverageDirectory: './coverage',
};
