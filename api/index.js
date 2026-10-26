// Single Vercel Serverless Function entry point for IMovies API
// This single file encapsulates the entire Express backend, ensuring the deployment
// counts as exactly ONE (1) Serverless Function, well within Vercel's 12-function Hobby plan limit.

const app = require('../server/app');

module.exports = app;
