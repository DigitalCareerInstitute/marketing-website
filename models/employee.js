var mongoose = require("mongoose"),
  URLSlugs = require("mongoose-url-slugs"),
  Schema = mongoose.Schema;

var EmployeeSchema = new Schema({
  name: String,
  avatar: {
    type: String
  },
  locations: [{ type: Schema.ObjectId, ref: "Location" }],
  position: String,
  content: String,
  active: String,
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  language: { type: Schema.ObjectId, ref: "Language" },
  languageVersion: { type: Schema.ObjectId, ref: "Employee" }
});
EmployeeSchema.pre("save", function preSave(next) {
  const employee = this;
  employee.update({ updatedAt: Date.now() });
  next();
});
EmployeeSchema.plugin(URLSlugs("name"));
EmployeeSchema.pre("remove", function (next) {
  if (!!this.languageVersion) {
    this.languageVersion.update({ $unset: { language: 1, languageVersion: 1 } }, next);
  } else {
    next();
  }
});
module.exports = mongoose.model("Employee", EmployeeSchema);
