const mongoose = require("mongoose");
module.exports.renderLanguageVersion = async (req, res, model, singlePath, path) => {
  if (!!model && !!model.language && model.language.title !== 'en' && !req.session.locale) {
    res.redirect(`/${path}/${model.languageVersion.slug}`)
  } else if (!!model && !!req.session.locale && model.language.title !== req.session.locale) {
    res.redirect(`/${path}/${model.languageVersion.slug}`)
  } else if (model) {
    res.render(`${singlePath}`, {
      model
    });
  } else {
    res.redirect(`/${path}`)
  }
}
