require("dotenv").config({ path: __dirname + "/../.env" });
const multer = require("multer");
const fs = require("fs");
const jimp = require("jimp");
const Employee = require("../../models/employee");
const Location = require("../../models/location");
const uuid = require("uuid");
const AbstractController = require("./AbstractController");

module.exports.getEmployees = async function(req, res) {
  try {
    let employees = await Employee.find({})
      .populate('language')
      .populate('languageVersion')
      .populate("locations")
      .sort("-createdAt")
      .exec();

    res.render("admin/employees", {
      employees
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.deleteEmployee = async function (req, res, next) {
  Employee.findOne({ slug: req.params.slug})
    .populate('language')
    .populate('languageVersion')
    .exec((err, doc) => {
      if (err) res.send(err);
      doc.remove(next);
      req.flash("success", `Successfully deleted ${doc.name}`);
      res.redirect("/admin/employees");
    })
};

module.exports.editEmployee = async function(req, res) {
  const employee = await Employee
  .findOne({ slug: req.params.slug})
  .populate('language')
  .populate('languageVersion')
  .exec()

  let alllocations = await Location.find({}).exec();
  all = alllocations.map(loc => {
    let match = employee.locations
      .map(pcat => pcat.toString())
      .includes(loc._id.toString());

    if (match) {
      return Object.assign({ selected: true }, loc._doc);
    } else {
      return loc._doc;
    }
  });

  res.render("admin/editEmployee", {
    employee: employee,
    locations: all
  });
};

module.exports.updateEmployee = async (req, res) => {
  const employee = await Employee.findOne({ slug: req.params.slug})
  employee.name = req.body.name;
  employee.position = req.body.position;
  employee.content = req.body.content;
  employee.locations = req.body.locations;
  employee.avatar = req.body.avatar ? req.body.avatar : employee.avatar;
  employee.avatar = req.files.avatar ? req.body.avatar : employee.avatar;
  await employee.save()
  req.flash("success", `Successfully updated ${employee.name}`);
  res.redirect("/admin/employees/edit/" + employee.slug);
};

module.exports.createEmployee = async function(req, res) {
  var employee = await new Employee();
  
  employee.name = req.body.name;
  employee.locations = req.body.locations;
  employee.position = req.body.position;
  employee.avatar = req.body.avatar ? req.body.avatar : employee.avatar;

  const result = await employee.save()
  req.flash("success", `Successfully created ${employee.title}`);
  res.redirect("/admin/employees");
}
const storage = multer.diskStorage({
  destination: function(request, file, next) {
    next(null, "./temp");
  },
  filename: function(request, file, next) {
    next(null, uuid(4));
  }
});

module.exports.uploadImages = multer({
  storage,
  limits: {
    fileSize: 10000000 // 10 MB
  },
  fileFilter(req, file, next) {
    if (file.mimetype.startsWith("image/")) {
      next(null, true);
    } else {
      next({ message: "That filetype is not allowed!" }, false);
    }
  }
}).fields([
  { name: "avatar", maxCount: 1 }
]);

exports.resizeImages = async (request, response, next) => {
  if (!request.files) {
    next();
    return;
  }
  for await (const singleFile of Object.values(request.files)) {
    const extension = singleFile[0].mimetype.split("/")[1];
    request.body[singleFile[0].fieldname] = `${
      singleFile[0].filename
    }.${extension}`;
    try {
      const image = await jimp.read(singleFile[0].path);
      await image.cover(600, 600);
      await image.write(
        `${process.env.IMAGE_UPLOAD_DIR}/${
          request.body[singleFile[0].fieldname]
        }`
      );
      fs.unlinkSync(singleFile[0].path);
    } catch (error) {
      console.log(error);
    }
  }
  next();
};
module.exports.setL18n = async (req, res) => {
  AbstractController.cloneSite(req, res, Employee)
};