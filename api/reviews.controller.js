import ReviewsDAO from '../dao/reviewsDAO.js';

export default class ReviewController {
  static async apiPostReview(req, res, _next) {
    try {
      // In the frontend, we call this endpoint with something like:
      // axios.post('http://localhost:5000/api/v1/movies/review', data)
      // The data object generated in the frontend will look something like:
      // {
      //   review: 'Great movie!',
      //   name: 'Peter',
      //   user_id: '12345',
      //   movie_id: '684b2401g3024dbbcdc7334'
      // }
      const movieId = req.body.movie_id;
      const review = req.body.review;
      const userInfo = {
        name: req.body.name,
        _id: req.body.user_id
      };
      const date = new Date();

      await ReviewsDAO.addReview(
        movieId,
        userInfo,
        review,
        date
      );

      res.json({ status: "success" });
    }
    catch(e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiPutReview(req, res, _next) {
    try {
      const reviewId = req.body.review_id;
      const review = req.body.review;
      const userId = req.body.user_id;
      const date = new Date();

      const reviewResponse = await ReviewsDAO.updateReview(
        reviewId,
        userId,
        review,
        date
      );

      var { error } = reviewResponse;
      if (error) {
        res.status.json({ error });
      }

      // modifiedCount contains the number of modified documents
      if (reviewResponse.modifiedCount === 0) {
        throw new Error('Unable to update review. User may not be original reviewer.');
      }

      res.json({ status: "success" });
    }
    catch(e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiDeleteReview(req, res, _next) {
    try {
      const reviewId = req.body.review_id;
      const userId = req.body.user_id;
      const reviewResponse = await ReviewsDAO.deleteReview(reviewId, userId);

      var { error } = reviewResponse;
      console.log(error);
      if (error) {
        res.status.json({ error });
      }

      if (reviewResponse.deletedCount === 0) {
        throw new Error('Unable to delete review. User may not be original reviewer.');
      }

      res.json({ status: "success" });
    }
    catch(e) {
      res.status(500).json({ error: e.message} );
    }
  }
}