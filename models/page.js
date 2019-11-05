const mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  QuillDeltaToHtmlConverter = require("quill-delta-to-html")
    .QuillDeltaToHtmlConverter,
  URLSlugs = require("mongoose-url-slugs");

const PageSchema = new Schema({
  title: String,
  content: Object,
  order: Number,
  menulocations: [{ type: Schema.ObjectId, ref: "Menulocation" }],
  language: { type: Schema.ObjectId, ref: "Language" },
  languageVersion: { type: Schema.ObjectId, ref: "Page"}
});

PageSchema.plugin(URLSlugs("title"));

PageSchema.virtual("toHTML").get(function() {
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
PageSchema.pre("remove", function (next) {
  if (!!this.languageVersion) {
    this.languageVersion.update({ $unset: { language: 1, languageVersion: 1 } }, next)
  } else {
    next();
  }
});
module.exports = mongoose.model("Page", PageSchema);
