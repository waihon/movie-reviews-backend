import MoviesDAO from '../dao/moviesDAO.js';

export default class MoviesController {
  static async apiGetMovies(req, res, _next) {
    // Example URL:
    // http://localhost:5000/api/v1/movies?title=dragon&moviesPerPage=15&page=0
    // Example query object:
    // {
    //   title: 'dragon',
    //   moviesPerPage: '15',
    //   page: '0'
    // }
    const moviesPerPage = req.query.moviesPerPage ?
          parseInt(req.query.moviesPerPage) : 20;
    const page = req.query.page ? parseInt(req.query.page) : 0;

    let filters = {};
    if (req.query.rated) {
      filters.rated = req.query.rated;
    }
    else if (req.query.title) {
      filters.title = req.query.title;
    }

    console.log('In MoviesController');
    console.log(filters);
    const { moviesList, totalNumMovies } = await MoviesDAO.getMovies(
      {
        filters,
        page,
        moviesPerPage
      }
    );

    let response = {
      movies: moviesList,
      page: page,
      filters: filters,
      entries_per_page: moviesPerPage,
      total_results: totalNumMovies,
    }

    res.json(response);
  }

  static async apiGetMovieById(req, res, _next) {
    try {
      // The id parameter is the value after the rightmost '/' in below URL:
      // http://localhost:5000/api/v1/movies/id/12345
      let id = req.params.id || {};
      let movie = await MoviesDAO.getMovieById(id);
      if (!movie) {
        res.status(404).json({ error: "not found" });
        return;
      }
      res.json(movie);
    }
    catch(e) {
      console.log(`api, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async apiGetRatings(req, res, _next) {
    try {
      let ratings = await MoviesDAO.getRatings();
      res.json(ratings);
    }
    catch(e) {
      console.log(`api, ${e}`);
      res.status(500).json({ error: e });
    }
  }
}