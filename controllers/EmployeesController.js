require("dotenv").config({ path: __dirname + "/../.env" });
const { renderLanguageVersion, getAvailableTranslations } = require("./AbstractController");
const Employee = require("../models/employee");

module.exports.getEmployees = async function(req, res) {
  try {
    const query = await getAvailableTranslations(req, res);
    let employees = await Employee.find(query)
      .populate("locations")
      .sort("-createdAt")
      .exec();

    res.render("employees", {
      employees
    });
  } catch (err) {
    console.log(err);
  }
};
