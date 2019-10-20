const Users = require("../../models/user");

module.exports.getUsers = async function(req, res) {
  let users = await Users.find({})
    .sort("-createdAt")
    .exec();

  res.render("admin/users", { users });
};
