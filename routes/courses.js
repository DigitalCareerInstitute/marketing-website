const Menulocation = require("../models/menulocation");
const CoursesController = require("../controllers/CoursesController");

const express = require("express");
const router = express.Router();

//COURSES ROUTING
router.get("/", CoursesController.getCourses);
router.get("/:slug", CoursesController.getSingleCourse);

module.exports = router;
