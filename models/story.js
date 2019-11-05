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
  language: { type: Schema.ObjectId, ref: "Language" },
  languageVersion: { type: Schema.ObjectId, ref: "Story"}
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
StorySchema.pre("remove", function (next) {
  if(!!this.languageVersion){
    this.languageVersion.update({ $unset: { language: 1, languageVersion: 1 } }, next);
  } else {
    next();
  }
});
module.exports = mongoose.model("Story", StorySchema);
