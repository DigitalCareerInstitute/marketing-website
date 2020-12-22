const mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  URLSlugs = require("mongoose-url-slugs");

const PartnerSchema = new Schema({
  title: String,
  link: String,
  order: Number,
  partnerlogo: {
    type: String
  },
  testimonial_name: String,
  testimonial_content: String,
  testimonial_job: String,
  testimonial_show: Boolean,
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  language: { type: Schema.ObjectId, ref: "Language" },
  languageVersion: { type: Schema.ObjectId, ref: "Partner" }
});
PartnerSchema.plugin(URLSlugs("title"));
module.exports = mongoose.model("Partner", PartnerSchema);
