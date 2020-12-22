require("dotenv").config({path: __dirname + "/../.env"});
const Stringtranslation = require("../../models/stringtranslation");
const Language = require("../../models/language");
const Page = require("../../models/page");
const Setting = require("../../models/setting");
const {getAsyncRedis} = require("../../helpers/helper");

module.exports.getSettings = async (req, res) => {
  try {
    let stringtranslations = await Stringtranslation.find({})
      .populate("translations.language")
      .sort("title")
      .exec();
    let languages = await Language.find({})
    let pages = await Page.find({})
      .exec();
    let settings = await Setting.findOne({})
    let settingsKeys = Object.entries(Setting.schema.paths).filter((s, k) => s[0] !== "_id" && s[0] !== "__v" && s[0] !== "slug").map(s => s[1])
    if (req.headers['content-type'] === 'application/json') {
      return res.json({
        settings,
        stringtranslations,
        settingsKeys,
        pages,
        languages
      })
    } else {
      res.render("admin/adminSettings", {
        settings,
        stringtranslations,
        settingsKeys,
        pages,
        languages
      });
    }
  } catch (err) {
    console.log(err);
  }
};
module.exports.createSetting = async (req, res) => {
  req.body.show_language_markers = req.body.show_language_markers === "on" ? true : false
  try {
    req.body.landingpage_calltoaction === "" ? ( req.body.landingpage_calltoaction = undefined) : req.body.landingpage_calltoaction
    let setting = await Setting.findOneAndUpdate({}, req.body).exec({});
    let responseMsg = `Successfully updated`
    if (!setting) {
      setting = new Setting(req.body);
      responseMsg = `Successfully created`
    }
    setting.save(async function (err) {
      if (err) {
        let settings = await Setting.findOne({})
          .populate("translations.language")
          .exec();
        let languages = await Language.find({})
          .exec();
        req.flash("danger", `Error ${err}`);
        res.render("admin/adminSettings", {
          settings,
          setting,
          languages,
        });
        return;
      }
      req.flash("success", responseMsg);
      res.redirect("/admin/settings");
    })
  } catch (err) {
    console.log(err);
  }
};
module.exports.createStringtranslation = async (req, res) => {
  try {
    var stringtranslation = new Stringtranslation();
    let languages = await Language.find({})
      .exec();
    stringtranslation.title = req.body.title;
    stringtranslation.translations = Object.keys(req.body.translations).map(trans => ({
      language: languages.find(l => l.title === trans)._id,
      title: req.body.translations[trans]
    }));
    return stringtranslation.save(async function (err) {
      if (req.headers['content-type'] === 'application/json') {
        if (err) {
          return res.json({error: err, stringtranslation})
        } else {
          return res.json({stringtranslation})
        }
      } else {
        if (err) {
          let stringtranslations = await Stringtranslation.find({})
            .populate("translations.language")
            .exec();
          let languages = await Language.find({})
            .exec();
          req.flash("danger", `Error ${err}`);
          res.render("admin/adminSettings", {
            stringtranslations,
            stringtranslation,
            languages,
          });
        } else {
          req.flash("success", `Successfully created ${stringtranslation.title}`);
          res.redirect("/admin/settings");
        }
      }
    })
  } catch (err) {
    console.log(err);
    return res.json({error: err})
  }
};
module.exports.deleteSetting = async (req, res, next) => {
  try {
    const setting = await Setting.findById(req.params.id)
    await setting.remove()
    req.flash("success", `Successfully deleted `);
    res.redirect("/admin/settings");
  } catch (err) {
    console.log(err);
  }
};

module.exports.deleteStringtranslation = async (req, res, next) => {
  try {
    const stringtranslation = await Stringtranslation.findById(req.params.id)
    await stringtranslation.remove()
    if (req.headers['content-type'] === 'application/json') {
      return res.json({_id: req.params.id})
    } else {
      req.flash("success", `Successfully deleted ${stringtranslation.translations[0].title}`);
      res.redirect("/admin/settings");
    }
  } catch (err) {
    console.log(err);
  }
};
module.exports.updateStringtranslation = async (req, res) => {
  try {
    const result = await Stringtranslation.findOneAndUpdate({_id: req.body._id}, req.body).exec({});
    if (req.headers['content-type'] === 'application/json') {
      return res.json(result)
    } else {
      req.flash("success", `Successfully updated ${Object.values(req.body.translations)[0]}`);
      res.redirect("/admin/settings");
    }
  } catch (err) {
    console.log(err);
  }
};
module.exports.clearCache = async (req, res) => {
  redisClient = getAsyncRedis()
  const getIndexData = await redisClient.getAsync(`indexData${req.session.locale}`)
  const getNavData = await redisClient.getAsync(`navData${req.session.locale}`)
  redisClient.flushdb(function (err, succeeded) {
    req.flash("success", `Successfully cleared the cache`);
    res.redirect(req.headers.referer)
  });
}

