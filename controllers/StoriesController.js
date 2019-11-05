require('dotenv').config({ path: __dirname + '/../.env' });
const Story = require("../models/story");
const Language = require("../models/language");
const { renderLanguageVersion } = require("./AbstractController");

module.exports.getStories = async function (req, res) {
  const currentLanguage = await Language.findOne(!!req.session.locale ? { title: req.session.locale } : { title: 'en' });
  const query = { language: !req.session.locale ? { $in: [currentLanguage._id, null] } : currentLanguage._id }
  const stories = await Story
    .find(query)
    .sort("order")
    .exec();

  res.render("stories", {
    stories
  });
}
module.exports.getSingleStory = async (req, res) => {
  const story = await Story.findOne({ slug: req.params.slug })
    .populate('language')
    .populate('languageVersion')
    .exec();
  renderLanguageVersion(req, res, story, 'story', 'stories')
}
