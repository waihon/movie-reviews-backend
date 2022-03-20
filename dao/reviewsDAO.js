import mongodb from 'mongodb';

// We need ObjectId to convert an id string to MongoDB Object id later on.
const ObjectId = mongodb.ObjectId;

let reviews;

export default class ReviewsDAO {
  static async injectDB(conn) {
    if (reviews) {
      return;
    }
    
    try {
      // If the reviews collection doesn't yet exist in the database,
      // MongoDB automatically creates it for us.
      reviews = await conn.db(process.env.MOVIEREVIEWS_NS).collection('reviews');
    }
    catch(e) {
      console.error(`Unable to establish connection handle in ReviewDAO: ${e}`);
    }
  }

  static async addReview(movieId, user, review, date) {
    try {
      const reviewDoc = {
        name: user.name,
        user_id: user._id,
        date: date,
        review: review,
        movie_id: ObjectId(movieId)
      };
      // Insert a single document into a collection
      return await reviews.insertOne(reviewDoc);
    }
    catch(e) {
      console.error(`Unable to post review: ${e}`);
      return { error: e };
    }
  }

  static async updateReview(reviewId, userId, review, date) {
    try {
      // Update a single document of a collection
      const updateResponse = await reviews.updateOne(
        // To filter for an existing review created by userId and with reviewId.
        { user_id: userId, _id: ObjectId(reviewId) },
        // If the review exists, we then update it with the second argument
        // wich contains the new review text and date.
        { $set: { review: review, date: date } }
      );
      return updateResponse;
    }
    catch(e) {
      console.error(`Unable to update review: ${e}`);
      return { error: e };
    }
  }

  static async deleteReview(reviewId, userId) {
    try {
      // To filter for an existing review created by userId and with reviewId.
      // If the review exists, we then delete it.
      const deleteResponse = await reviews.deleteOne({
        _id: ObjectId(reviewId),
        user_id: userId
      });
      return deleteResponse;
    }
    catch(e) {
      console.error(`Unable to delete review: ${e}`);
      return { error: e };
    }
  }
}
