var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var LocationSchema   = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  street: {
    type: String
  },
  zip: {
    type: Number
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  updatedAt: {
    type: Date,
    default: Date.now 
  },
  createdAt: {
    type: Date,
    default: Date.now 
  }
});

module.exports = mongoose.model('Location', LocationSchema);
