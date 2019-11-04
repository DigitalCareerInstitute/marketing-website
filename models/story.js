var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  QuillDeltaToHtmlConverter = require("quill-delta-to-html")
    .QuillDeltaToHtmlConverter,
  URLSlugs = require('mongoose-url-slugs');

var StorySchema = new Schema({
  title: String,
  subtitle: String,
  workPosition: String,
  excerpt: String,
  content: Object,
  order: Number,
  avatar: String,
  companylogo: String,
  userId: String,
});
StorySchema.virtual("toHTML").get(function () {
  try {
    const content = this.content.ops;
    if (!content) {
      throw "is no quill data yet"
    }
    const converter = new QuillDeltaToHtmlConverter(content);
    return converter.convert();
  } catch (e) {
    console.log('error', e);
    return this.content;
  }
});
StorySchema.plugin(URLSlugs('title'));
module.exports = mongoose.model("Story", StorySchema);
