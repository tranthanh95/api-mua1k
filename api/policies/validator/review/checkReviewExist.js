"use strict";

module.exports = asyncWrap(async (req, res, next) => {
    let reviewId = req.params.reviewid;

    if (! sails.helpers.isMongoId(reviewId))
        return res.badRequest(sails.errors.idMalformed);

    let isReviewExist = await Review.count({_id: reviewId});
    if (! isReviewExist)
        return res.badRequest(sails.errors.reviewNotFound);

    next();
});
