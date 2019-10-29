var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  URLSlugs = require("mongoose-url-slugs");
var CourseSchema = new Schema({
  icon: {
    type: String
  },
  headline: {
    type: String,
    trim: true,
    required: "Please enter a headline!"
  },
  subheading: {
    type: String,
    trim: true,
    required: "Please enter a subheading !"
  },
  title: {
    type: String
  },
  curriculumPdf: {
    type: String
  },
  order: {
    type: Number
  },
  subtitle: {
    type: String
  },
  locations: [{ type: Schema.ObjectId, ref: "Location" }],
  archivements: [
    {
      icon: String,
      description: String
    }
  ],
  features: [
    {
      title: String,
      subtitle: String,
      icon: String
    }
  ],
  timeline: [
    {
      title: String,
      subtitle: String,
      time: String
    }
  ],
  language: { type: Schema.ObjectId, ref: "Language" },
  languageVersion: { type: Schema.ObjectId, ref: "Page"}
});

CourseSchema.plugin(URLSlugs("headline"));

module.exports = mongoose.model("Course", CourseSchema);
