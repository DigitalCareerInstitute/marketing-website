const mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  QuillDeltaToHtmlConverter = require("quill-delta-to-html")
    .QuillDeltaToHtmlConverter,
  URLSlugs = require("mongoose-url-slugs");

const PageSchema = new Schema({
  title: String,
  content: Object,
  order: Number,
  menulocations: [{ type: Schema.ObjectId, ref: "Menulocation" }]
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

module.exports = mongoose.model("Page", PageSchema);
