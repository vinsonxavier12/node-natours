class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    // BASIC FILTERING
    const queryObj = { ...this.queryStr };
    const excludedFields = ["page", "fields", "sort", "limit"];
    excludedFields.forEach((ele) => {
      delete queryObj[ele];
    });

    // ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => {
      return `$${match}`;
    });
    this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    // SORTING
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      // query = query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    // FIELD LIMITING
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    // PAGINATION
    // THIS TRICK IS USED TO CONVERT A STRING TO A NUMBER. IE, MULTIPLY A STRING BY 1
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
