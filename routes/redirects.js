const IndexController = require("../controllers/IndexController");

const express = require("express");
const router = express.Router();
router.get('/kurse/einzelcoaching', function(req, res) {
  res.redirect('/courses')
});
router.get('/kurse/jahreskurs', function(req, res) {
  res.redirect('/courses')
});
router.get('/kurse/orientierungskurs', function(req, res) {
  res.redirect('/courses')
});
router.get('/kurse', function(req, res) {
  res.redirect('/courses')
});
router.get('/jobs', function(req, res) {
  res.redirect('https://dci-jobs.personio.de')
});
router.get('/en/:path', function(req, res) {
  res.redirect(301, '/'+req.param('path'))
});

module.exports = router
