const mongoose = require("mongoose");
module.exports.renderLanguageVersion = async (req, res, model, singlePath, path) => {
  try {
    if (!!model.language && model.language.title !== 'en' && !req.session.locale) {
      res.redirect(`/${path}/${model.languageVersion.slug}`)
    } else if (!!req.session.locale && model.language.title !== req.session.locale) {
      res.redirect(`/${path}/${model.languageVersion.slug}`)
    } else if (model) {
      res.render(`${singlePath}`, {
        model
      });
    } else {
      res.redirect(`/${path}`)
    }
  } catch (err) {
    console.log(err);
  }
}
