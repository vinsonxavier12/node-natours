const express = require("express");
const viewController = require("../controllers/viewController");

const router = express.Router();

router.get("/", viewController.overview);
router.get("/tour/:slug", viewController.tour);

module.exports = router;
