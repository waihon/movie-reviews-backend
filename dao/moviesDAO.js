import mongodb from 'mongodb';

const ObjectId = mongodb.ObjectId;

let movies;

export default class MoviesDAO {
  static async injectDB(conn) {
    if (movies) {
      return;
    }
    try {
      movies = await conn.db(process.env.MOVIEREVIEWS_NS).collection('movies');
      console.log('Injected database client to MoviesDAO');
    }
    catch (e) {
      console.error(`Unable to connect in MoviesDAO: ${e}`);
    }
  }

  static async getMovies({
    // A filters object might look something like:
    // {
    //   title: 'dragon', // search titles with 'dragon' in it
    //   rated: 'G'       // search ratings with 'G'
    // }
    filters = null,
    page = 0,
    moviesPerPage = 20,
  } = {}) {
    let query;
    console.log('In MoviesDAO');
    console.log(filters);
    if (filters) {
      if ('title' in filters) {
        // $search allows us to query for documents with specified field
        // containing the user specified search terms.
        // $text allows us to query for documents with specified field matching
        // any of multiple words (logical OR) separated by spaces, e.g.
        // 'kill dragon'.
        // We also have to later specify in MongoDB Atlas that we want to
        // enable text searches on the desired field, title in this case.
        query = { $text: { $search: filters['title'] } };
      } else if ('rated' in filters) {
        query = { 'rated': { $eq: filters['rated'] } };
        // Alternative: query = { 'rated': filters['rated'] }
      }

      console.log(query);

      let cursor;
      try {
        // Our query can potentially match very larget set of documents,
        // a cursor fetches these documents in batches to reduce both memory
        // consumption and network bandwidth usage.
        cursor = await movies
          .find(query)
          // When skip and limit is used together, the skip applies first
          // and the limit only applies to the documents left over after
          // the skip.
          .limit(moviesPerPage)
          .skip(moviesPerPage * page);
        const moviesList = await cursor.toArray();
        const totalNumMovies = await movies.countDocuments(query);
        return { moviesList, totalNumMovies };
      }
      catch (e) {
        console.error(`Unable to issue find command, ${e}`);
        return { moviesList: [], totalNumMovies: 0 };
      }
    }
  }

  static async getMovieById(id) {
    try {
      // We use aggregate to provide a sequence of data aggregation operations.
      // In our case, the first operation is $match, where we look for the
      // move document that matches the specified id.
      // Next, we use the $lookup operator to perform an equility join using
      // the _id field from the movie document with the movie_id field from
      // reviews collection.
      return await movies.aggregate([
        {
          $match: {
            _id: new ObjectId(id),
          }
        },
        {
          $lookup: {
            from: 'reviews', // collection to join
            localField: '_id', // field from the input document
            foreignField: 'movie_id', // field from the documents of the "from" collection
            as: 'reviews', // output array field
          }
        }
      ]).next();
    }
    catch(e) {
      console.error(`Something went wrong in getMovieById: ${e}`);
      throw e;
    }
  }

  static async getRatings() {
    let ratings = [];
    try {
      // We use movies.distinct to get all the distinct rated values from the
      // movies collection.
      ratings = await movies.distinct('rated');
      return ratings;
    }
    catch(e) {
      console.error(`Unable to get ratings, ${e}`);
      return ratings;
    }
  }
}