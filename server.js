import express from 'express';
import cors from 'cors';
import movies from './api/movies.route.js';

const app = express();

// Middleware
app.use(cors());
// express.json is the JSON parsing middleware to enable the server to
// read and accept JSON in a request's body.
app.use(express.json());

// Routes
// The subsequent specific routes are specified in the 2nd argument.
app.use('/api/v1/movies', movies);
// If someone tries to go to a route that doesn't exist, the wildcard
// route * returns a 404 page with the 'not found' message.
app.use('*', (_req, res) => {
  res.status(404).json({error: 'not found'});
});

// Export app as a module so that other files can import it.
export default app;
