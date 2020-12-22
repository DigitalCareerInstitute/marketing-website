const Course = require('../models/course')
const { renderLanguageVersion, getAvailableTranslations } = require('./AbstractController')

module.exports.getCourses = async (req, res) => {
  try {
    const query = await getAvailableTranslations(req, res)
    const courses = await Course
      .find(query)
      .sort({order: 1})
      .exec()
    res.render('courses', { courses })
  } catch (err) {
    console.log(err)
  }
}

module.exports.getSingleCourse = async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug })
    .populate('language')
    .populate('languageVersion')
    .populate('locations')
    .populate('successStory')
    .exec()
  renderLanguageVersion(req, res, course, 'course', 'courses')
}

module.exports.financingOptions = async (req, res) => {
    res.render('financingOptions')
}
