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
}