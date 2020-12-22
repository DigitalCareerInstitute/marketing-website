var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var SettingSchema = new Schema({
  landingpage_archivements_students: Number,
  landingpage_archivements_courses: Number,
  landingpage_archivements_tours: Number,
  landingpage_archivements_locations: Number,
  landingpage_number_events: Number,
  landingpage_calltoaction: {type: Schema.ObjectId, ref: "Page"},
  announcement_banner_string: String,
  announcement_banner_cta: String,
  tourmailreceiver: String,
  mailreceiver: String,
  show_language_markers: Boolean,
  careersuccesspage_alumni: Number,  
  careersuccesspage_students: Number,  
  careersuccesspage_companypartners: Number,
  careersuccesspage_employmentrate: Number,
});

module.exports = mongoose.model("Setting", SettingSchema);
