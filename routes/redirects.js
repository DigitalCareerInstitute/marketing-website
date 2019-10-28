const IndexController = require("../controllers/IndexController");

const express = require("express");
const router = express.Router();
router.get('/kurse/einzelcoaching', function(req, res) {
  res.redirect('/de/courses')
});
router.get('/kurse/jahreskurs', function(req, res) {
  res.redirect('/de/courses')
});
router.get(/^\/(\w{2}\/)?kurse\/orientierungskurs/, function(req, res) {
  console.log('BOOOM', );
  
  res.redirect('/courses/web-development-course')
});
router.get('/kurse', function(req, res) {
  res.redirect('/de/courses')
});
router.get('/jobs', function(req, res) {
  res.redirect('https://dci-jobs.personio.de')
});
router.get('/en/:path', function(req, res) {
  res.redirect(301, '/'+req.param('path'))
});

module.exports = router
