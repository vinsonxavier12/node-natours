const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    console.log('DB connected successfully!');
  });

const port = process.env.PORT || 3000;

const allTours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);
const refactoredAllTours = allTours.map((ele) => {
  delete ele.id;
  return ele;
});
Tour.insertMany(refactoredAllTours)
  .then((data) => {
    console.log(data);
    console.log('done raa');
  })
  .catch((err) => {
    console.log(err);
  });
