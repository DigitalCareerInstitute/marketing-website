const Contact = require("../../models/contact");

module.exports.getContacts = async function(req, res) {
  let contacts = await Contact.find({})
    .populate("locations")
    .sort("-createdAt")
    .exec();
  res.render("admin/contacts", {
    contacts
  });
};

module.exports.deleteContact = async function(req, res) {
  let contact = await Contact.findByIdAndRemove(req.params.id)
  res.redirect("admin/contacts");
};

module.exports.getContactsJson = async function(req, res) {
  let contacts = await Contact.find({})
    .populate("locations")
    .sort("-createdAt")
    .exec();
  res.json(contacts);
};
