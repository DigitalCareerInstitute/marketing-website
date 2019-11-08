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
  massnahmeDetails: {
    type: String
  },
  massnahmeNumber: {
    type: String
  },
  curriculumPdf: {
    type: String
  },
  successStory: {
    type: Schema.ObjectId, ref: "Story",
  },
  order: {
    type: Number,
    unique: true
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
  ]
});

CourseSchema.plugin(URLSlugs("headline"));

module.exports = mongoose.model("Course", CourseSchema);
