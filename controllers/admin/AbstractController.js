const Language = require("../../models/language");
module.exports.cloneSite = async(req, res, Model) => {
  try {
    const model = await Model.findOne({ slug: req.params.slug });
    const language = await Language.findOne({ title: 'en' });
    const languageDe = await Language.findOne({ title: 'de' });

    var modelClone = new Model(model);
    modelClone.title = `${ model.title } clone`;
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



var objectIdDel = function(copiedObjectWithId) {
  if (copiedObjectWithId != null && typeof(copiedObjectWithId) != 'string' &&
    typeof(copiedObjectWithId) != 'number' && typeof(copiedObjectWithId) != 'boolean' ) {
    //for array length is defined however for objects length is undefined
    if (typeof(copiedObjectWithId.length) == 'undefined') {
      delete copiedObjectWithId._id;
      for (var key in copiedObjectWithId) {
        objectIdDel(copiedObjectWithId[key]); //recursive del calls on object elements
      }
    }
    else {
      for (var i = 0; i < copiedObjectWithId.length; i++) {
        objectIdDel(copiedObjectWithId[i]);  //recursive del calls on array elements
      }
    }
  }
}
