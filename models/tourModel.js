const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
    },
    slug: String,
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a summary"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

/* 
    Virtual properties are properties that doesn't stored on database but can
  define on schemas.  We can access it as soon as we get the data from 
  database.
    We can not use any queries based on virtual properties.  Because it is not
  part of the data.
    We can have this logic in controller after querying the data itself.  But it
  is not a good practice.  We need to keep more business logic in model and 
  application logic in controller.  We need to keep that separated for better
  practices.
*/
tourSchema.virtual("durationWeeks").get(function () {
  /* 
    We are using regular function instead of a callback or an arrow function
    is we have the access of this keyword only inside regular function.  Here
    this refers to the current document.
  */
  return this.duration / 7;
});

/*
// Query middleware
tourSchema.pre(/^find/, function (next) {
  // Selecting documents which only has secretTour false
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // Post query exec logic;
  next();
});
*/

/*
// Document middleware
tourSchema.pre("save", function (next) {
  // Slugifying name for url purposes
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.post('', function(doc, next) {
  console.log('Saved successfully\n', doc);
  next();
})
*/

const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
