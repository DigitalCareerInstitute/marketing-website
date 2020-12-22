require("dotenv").config({ path: __dirname + "/../.env" });
const Page = require("../../models/page");
const Menulocation = require("../../models/menulocation");
const AbstractController = require("./AbstractController");

module.exports.getPages = async (req, res) => {
  try {
    let pages = await Page.find({})
      .sort("order")
      .populate("menulocations")
      .populate("language")
      .populate("languageVersion")
      .exec();
    let menulocations = await Menulocation.find({}).exec();


    res.render("admin/pages", {
      menulocations,
      pages
    });
  } catch (err) {
    console.log(err);
    req.flash("danger", JSON.stringify(err));
    res.redirect("/admin/pages");
  }
};

module.exports.getSinglePage = async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug })
    console.log('page', page);

    if (page) {
      res.render(`page`, {
        page
      });
    } else {
      req.flash("danger", `Page ${req.params.slug} not found`);
      res.redirect("/admin/pages");
    }
  } catch (err) {
    console.log(err);
    req.flash("danger", JSON.stringify(err));
    res.redirect("/admin/pages");
  }
};
module.exports.editPage = async (req, res) => {
  try {
    const page = await Page
      .findOne({ slug: req.params.slug })
      .populate("language")
      .populate("languageVersion");

    let pages = await Page.find({})
      .sort("order")
      .exec();
    let menulocations = await Menulocation.find({}).exec();
    let allmenulocations = await Menulocation.find({}).exec();

    all = allmenulocations.map(cat => {
      let match = page.menulocations
        .map(pcat => pcat.toString())
        .includes(cat._id.toString());

      if (match) {
        return Object.assign({ selected: true }, cat._doc);
      } else {
        return cat._doc;
      }
    });
    const shiftPageBack = pages.length + 1;

    res.render("admin/editPage", {
      page,
      menulocations: all,
      maxOrder: shiftPageBack
    });
  } catch (err) {
    console.log(err);
    req.flash("danger", JSON.stringify(err));
    res.redirect("/admin/pages");
  }
};

module.exports.createPage = async (req, res) => {
  try {
    var page = new Page();
    page.title = req.body.title;
    page.content = req.body.content;
    page.order = req.body.order;
    page.cta_button_url = req.body.cta_button_url;
    page.cta_button_text = req.body.cta_button_text;
    page.cta_text = req.body.cta_text;
    page.companypage = req.body.companypage === "on" ? true : false;
    page.metapage = req.body.metapage === "on" ? true : false;
    page.menulocations = req.body.menulocations;

    await page.save();
    req.flash("success", `Successfully created ${page.title}`);
    res.redirect("/admin/pages");
  } catch (err) {
    console.log(err);
    req.flash("danger", JSON.stringify(err));
    res.redirect("/admin/pages");
  }
};
module.exports.deletePage = async (req, res, next) => {
  try {
    Page.findOne({ slug: req.params.slug })
      .populate('language')
      .populate('languageVersion')
      .exec((err, doc) => {
        if (err) res.send(err);
        doc.remove(next);
        req.flash("success", `Successfully deleted ${doc.title}`);
        res.redirect("/admin/pages");
      })
  } catch (err) {
    console.log(err);
    req.flash("danger", JSON.stringify(err));
    res.redirect("/admin/pages");
  }
};
module.exports.updatePage = async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });

    page.title = req.body.title;
    page.content = JSON.parse(req.body.content);
    page.order = req.body.order;
    page.companypage = req.body.companypage === "on" ? true : false;
    page.metapage = req.body.metapage === "on" ? true : false;
    page.slug = req.body.slug;
    page.cta_button_url = req.body.cta_button_url;
    page.cta_button_text = req.body.cta_button_text ? req.body.cta_button_text : "GoGo gadget!";
    page.cta_text = req.body.cta_text;
    page.menulocations = req.body.menulocations;
    await page.save();

    req.flash("success", `Successfully updated ${page.title}`);
    res.redirect("/admin/pages/edit/" + page.slug);
  } catch (err) {
    console.log(err);
    req.flash("danger", JSON.stringify(err));
    res.redirect("/admin/pages");
  }
};
module.exports.setL18n = async (req, res) => {
  AbstractController.cloneSite(req, res, Page)
};
