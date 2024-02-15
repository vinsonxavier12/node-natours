const mongoose = require("mongoose");
const slugify = require("slugify");

const User = require("./userModel");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      minlength: [10, "A tour name must have more or equal than 10 characters"],
      maxLength: [40, "A tour name must have less or equal than 40 characters"],
      // validate: [validator.default.isAlpha, 'A tour must contain only alphabetical characters']
    },
    slug: String,
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current document on new document creation
          // Doesn't work on update
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be lesser than regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a summary"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      // Min and max also works for dates
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
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
      // This is a shorthand syntax. Full syntax used in difficulty enum
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        // This is the normal syntax. In above I used array syntax it is a shorthand syntax
        values: ["easy", "medium", "hard"],
        message: "Difficulty must be either easy, medium or hard",
      },
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
    startLocation: {
      // geoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
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

// Query middleware
tourSchema.pre(/^find/, function (next) {
  // Selecting documents which only has secretTour false
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v",
  });
  next();
});

// Document middleware: runs before .save() and .create()
tourSchema.pre("save", function (next) {
  // Slugifying name for url purposes
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre("aggregate", function (next) {
  // .unshift() inserts data to start of an array
  // filtering secretTour to not to show
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
