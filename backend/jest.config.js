// This file is used to configure Jest for testing the backend
// Necessary because the backend uses ES modules, and Jest expects CommonJS by default
// This configuration allows Jest to run tests in a Node.js environment without needing to transform the code

export default {
  testEnvironment: "node",
  transform: {},
};