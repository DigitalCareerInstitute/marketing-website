const Redirect = require("../../models/redirect");

module.exports.getRedirects = async (req, res) => {
  try {
    const redirects = await Redirect.find({})
    if (req.headers['content-type'] === 'application/json') {
      return res.json({
        redirects
      })
    } else {
      res.render("admin/adminRedirects", {
        redirects
      });
    }
  } catch (err) {
    console.log(err);
  }
};
module.exports.createRedirect = async (req, res) => {
  console.log(req.body);
  const createRedirect = await Redirect.create(req.body)
  res.json({ redirect: createRedirect })
};
module.exports.deleteRedirect = async (req, res, next) => {
  try {
    const redirect = await Redirect.findById(req.params.id)
    await redirect.remove()

    if (req.headers['content-type'] === 'application/json') {
      return res.json({ redirect })
    } else {
      req.flash("success", `Successfully deleted ${req.params.id}`);
      res.redirect("/admin/redirects");
    }
  } catch (err) {
    if (req.headers['content-type'] === 'application/json') {
      return res.json({ error: err, redirect })
    } else {
      req.flash("error", `Something wrong with ${req.params.id}`);
      res.redirect("/admin/redirects");
    }
  }
};
module.exports.updateRedirect = async (req, res) => {
  try {
    const result = await Redirect.findOneAndUpdate({ _id: req.body._id }, req.body).exec({});
    if (req.headers['content-type'] === 'application/json') {
      return res.json(result)
    } else {
      req.flash("success", `Successfully updated ${Object.values(req.body.id)}`);
      res.redirect("/admin/settings");
    }
  } catch (err) {
    console.log(err);
  }
};