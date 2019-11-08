const Course = require("../models/course");
const Language = require("../models/language");
const { renderLanguageVersion, getAvailableTranslations } = require("./AbstractController");

module.exports.getCourses = async (req, res) => {
  try {
    const query = await getAvailableTranslations(req, res);
    const courses = await Course
      .find(query)
      .exec();
    res.render("courses");
  } catch (err) {
    console.log(err);
  }
};

module.exports.getSingleCourse = async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug })
    .populate('language')
    .populate('languageVersion')
    .exec();
  renderLanguageVersion(req, res, course, 'course', 'courses')

  try {
    const course = await Course
    .findOne({ slug: req.params.course })
    .populate(
      "locations"
    ).populate(
      "successStory"
    ).exec();
    if(course){
      res.render(`course`, {
        course
      });
    } else {
      res.redirect("/courses")
    }
  } catch (err) {
    console.log(err);
  }
};
