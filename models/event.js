var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var EventSchema   = new Schema({
    eventbride_id: String,
    name: String,
    text: String,
    start: Date,
    location: { type: Schema.ObjectId, ref: "Location" },
    url: String
});

module.exports = mongoose.model('Event', EventSchema);
