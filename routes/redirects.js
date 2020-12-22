const IndexController = require("../controllers/IndexController");

const express = require("express");
const router = express.Router();

let redirects
const Redirect = require("../models/redirect");
(async () => {
  redirects = await Redirect.find({});
})()
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
router.get('*', function (req, res) {
  const page = req.path.replace('/', ' ')
  const shouldRedirect = redirects.find(red => red.from === req.originalUrl)
  if (shouldRedirect) {
    return res.redirect(shouldRedirect.to)
  }
  if (req.originalUrl.startsWith('/images') || req.headers['content-type'] === 'application/json') {
    res.status(404).send('Not found');
  } else {
  return res.render('404', {
    page: page
  })
  }
});
module.exports = router
