const Course = require("../models/course");
module.exports.getCourses = async (req, res) => {
  try {
    res.render("courses", {});
  } catch (err) {
    console.log(err);
  }
};

module.exports.getSingleCourse = async (req, res) => {
  try {
    const course = await Course
    .findOne({ slug: req.params.course })
    .populate(
      "locations"
    ).exec();
    if(course){
      res.render(`course`, {
        course
      });
    } else {
      res.redirect("/course")
    }
  } catch (err) {
    console.log(err);
  }
};
