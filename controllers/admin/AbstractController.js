const mongoose = require("mongoose");
const Language = require("../../models/language");
module.exports.cloneSite = async(req, res, Model) => {
  try {
    const model = await Model.findOne({ slug: req.params.slug });
    const language = await Language.findOne({ title: 'en' });
    const languageDe = await Language.findOne({ title: 'de' });

    var modelClone = new Model(model);
    modelClone._id = mongoose.Types.ObjectId();
    modelClone.isNew = true; 
    modelClone.title = `${ model.title } de`;    
    modelClone.slug = `${ model.slug }-de`;
    modelClone.languageVersion = model._id;
    model.languageVersion = modelClone._id;
    model.language = language._id;
    modelClone.language = languageDe._id;
    
    await model.save();
    await modelClone.save();
    req.flash("success", `Successfully created ${modelClone._id}`);
    //req.flash("success", `Successfully updated ${modelClone.title}`);
    res.redirect(req.baseUrl+"/edit/" + modelClone.slug);
  } catch (err) {
    console.log(err);
  }
}
