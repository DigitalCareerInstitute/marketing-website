const Users = require("../../models/user");

module.exports.getUsers = async function(req, res) {
  let users = await Users.find({})
    .sort("-createdAt")
    .exec();

  res.render("admin/users", { users });
};

module.exports.upgradeUser = async function(req, res) {
  let user = await Users.findById(req.params.id);
  user.admin = "true";
  await user.save();
  res.redirect("/admin/users");
};
