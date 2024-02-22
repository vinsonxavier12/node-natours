const Tour = require("../models/tourModel");
const AppError = require("../utilities/appError");
const catchAsyncError = require("../utilities/catchAsyncError");
const factory = require("./handlerFactory");

exports.aliasTopTours = (req, res, next) => {
  const query = {
    limit: "5",
    fields: "name,price,ratingsAverage,summary,diffuculty",
    sort: "-ratingsAverage,price",
  };
  req.query = query;
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: "reviews" });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsyncError(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    {
      $match: { _id: { $ne: "EASY" } },
    },
  ]);
  res.status(200).json({
    status: "success",
    stats,
  });
});

exports.getMonthlyPlan = catchAsyncError(async (req, res, next) => {
  const year = req.params.year;
  const monthlyPlan = await Tour.aggregate([
    {
      /* 
          Unwind is like deconstructing array to a single document. For eg,
          if we have 3 values in startDates. For each startDates item, we 
          will get a new document and so for all items in the array
        */
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          // Here we are filtering for the given year
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        /* 
            Here, we are grouping by month of startDates. startDates is in date
            format. Since mongo provides some aggregation operators for date, we
            can use $month operator to extract month from a date.
          */
        _id: { $month: "$startDates" },
        numOfTours: { $sum: 1 }, // Adding 1 for each of document for sum
        // We are pushing each document in tours array. Mongoose takes care of it
        tours: { $push: "$name" },
      },
    },
    {
      // We are adding a field named month with the value of _id which is month
      $addFields: { month: "$_id" },
    },
    {
      // Project is like what records to show or what records to hide
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numOfTours: -1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: monthlyPlan,
  });
});

exports.getToursWithin = catchAsyncError(async (req, res, next) => {
  const { distance, latlong, unit } = req.params;
  const [lat, long] = latlong.split(",");
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !long)
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat,long",
        400,
      ),
    );
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[long, lat], radius] } },
  });
  res.status(200).json({
    status: "success",
    results: tours.length,
    tours,
  });
});
