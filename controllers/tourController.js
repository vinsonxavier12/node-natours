const fs = require("fs");
const Tour = require("../models/tourModel");
const APIFeatures = require("../utilities/apiFeatures");

exports.aliasTopTours = (req, res, next) => {
  const query = {
    limit: "5",
    fields: "name,price,ratingsAverage,summary,diffuculty",
    sort: "-ratingsAverage,price",
  };
  req.query = query;
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // QUERY EXECUTION
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "failed",
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(200).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        tour: updatedTour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "failed",
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "failed",
      message: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err,
    });
  }
};
