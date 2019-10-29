const Course = require("../models/course");
const Language = require("../models/language");
const { renderLanguageVersion } = require("./AbstractController");

module.exports.getCourses = async (req, res) => {
  try {
    const currentLanguage = await Language.findOne(!!req.session.locale ? { title: req.session.locale } : { title: 'en' });
    const query = { language: !req.session.locale ? { $in: [currentLanguage._id, null] } : currentLanguage._id }
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
  renderLanguageVersion(req, res, course, 'course', 'courses')
};
