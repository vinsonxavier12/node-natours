const fs = require('fs');

exports.checkId = (req, res, next, val) => {
  console.log(`ID is ${val}`);
  if (val * 1 > tours.length) {
    return res.status(404).json({
      status: 'failed',
      message: 'ID not found',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'failed',
      message: 'invalid request',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.json({
    status: 'success',
    requestedAt: req.requestTime,
    // results: tours.length,
    // data: {
    //   tours,
    // }, 
  });
};

exports.getTour = (req, res) => {
  // const tour = tours.find((ele) => {
  //   return ele.id == req.params.id;
  // });
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour,
  //   },
  // });
};

exports.createTour = (req, res) => {
  res.status(201).json({
    status: 'success',
    // data: {
    //   tour: newTour,
    // },
  });
};

exports.updateTour = (req, res) => {
  let indexPos = undefined;
  let tour = tours.find((ele, index) => {
    if (ele.id == req.params.id) {
      indexPos = index;
      return true;
    }
  });
  const updatedData = Object.assign(req.body, tour);
  tours[indexPos] = updatedData;
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: updatedData,
        },
      });
    }
  );
};

exports.deleteTour = (req, res) => {
  let indexPos = undefined;
  let tour = tours.find((ele, index) => {
    if (ele.id == req.params.id) {
      indexPos = index;
      return true;
    }
  });
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
