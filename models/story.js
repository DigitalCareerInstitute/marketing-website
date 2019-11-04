var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  URLSlugs = require('mongoose-url-slugs');

var StorySchema = new Schema({
  title: String,
  subtitle: String,
  workPosition: String,
  excerpt: String,
  content: String,
  order: Number,
  avatar: String,
  companylogo: String,
  userId: String,
});

StorySchema.plugin(URLSlugs('title'));
module.exports = mongoose.model("Story", StorySchema);
