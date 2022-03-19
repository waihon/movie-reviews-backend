import app from './server.js';
import mongodb from 'mongodb';
import dotenv from 'dotenv';
import MoviesDAO from './dao/moviesDAO.js'

async function main() {
  // Load in the environment variables
  dotenv.config();

  const client = new mongodb.MongoClient(
    process.env.MOVIEREVIEWS_DB_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  );
  const port = process.env.PORT || 8000;

  try {
    // client.connect() connects to the MongoDB cluster. Since it returns a
    // promise, we use await to block further execution until that operation
    // has completed.
    await client.connect();
    console.log('Connected to MongoDB');
    await MoviesDAO.injectDB(client);

    // app.listen starts the server and listens via the specified port.
    // The callback function provided in the 2nd argument is executed when
    // the server starts listening.
    app.listen(port, () => {
      console.log('Server is running on port: ' + port);
    });
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

// Call the main() function and send any errors to the console.
main().catch(console.error);
