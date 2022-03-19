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
}