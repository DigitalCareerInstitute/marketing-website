const StoriesController = require("../controllers/StoriesController");

const express = require("express");
const router = express.Router();

router.get("/", StoriesController.getStories);
router.get("/:slug", StoriesController.getSingleStory);

module.exports = router
