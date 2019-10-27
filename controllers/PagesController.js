require('dotenv').config({ path: __dirname + '/../.env' });
const Page = require("../models/page");
const { renderLanguageVersion } = require("./AbstractController");

module.exports.getPages = async function(req, res) {
  let pages = await Page.find({})
    .populate("menulocations")
    .sort("order")
    .exec();

  res.render("pages", {
    pages
  });
}
module.exports.getSinglePage = async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug })
    .populate('language')
    .populate('languageVersion')
  renderLanguageVersion(req, res, page, 'page', 'pages')
}
