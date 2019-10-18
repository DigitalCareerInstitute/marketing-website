const express = require("express");
const router = express.Router();
const i18n = require("i18n");

router.all(/^\/(\w{2}\/)+(.*)/, handleLangUrl);
function handleLangUrl(req, res, next) {
  var lang = req.params[0].slice(0, 2);
  if (lang === i18n.getLocales()[0] || req.path.indexOf('users') !== -1 || req.path.indexOf('admin') !== -1) {
    delete req.session.locale
    res.redirect(`/${req.params[1]}`);
  } else {
    req.session.locale = lang
    var type = req.params[1];
    req.url = req.url.replace(lang + "/", "");
    if (type !== 'javascript' && type !== 'img' && type !== 'css') {
      i18n.setLocale(lang.slice(0, 2));
    }
    next();
  }
}
router.get("/i18n/:locale", changeLang);
function changeLang(req, res, next) {
  if (req.headers.referer) {
    if (req.params.locale === i18n.getLocales()[0]) {
      const pathWithLocale = req.headers.referer.replace(/\/\w{2}\//, "/")
      delete req.session.locale
      res.redirect(pathWithLocale);
    } else {
      req.session.locale = req.params.locale;
      const pathWithLocale = req.headers.referer.split(req.headers.host)[0] + req.headers.host + "/" + req.params.locale + req.headers.referer.split(req.headers.host)[1]
      res.redirect(pathWithLocale);
    }
  }
  else res.redirect("/");
}
router.get(/^[^.]*$/, setUrlIfSession);
function setUrlIfSession(req, res, next) {
  if (req.session.locale && req.path.indexOf('users') === -1 && req.path.indexOf('admin') === -1) {
    res.setLocale(req.session.locale);
    if (req.originalUrl.indexOf(req.session.locale + "/") === -1) {
      res.redirect("/" + req.session.locale + req.originalUrl);
    }
  }
  next();
}
module.exports = router;
