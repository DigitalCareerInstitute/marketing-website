var express = require("express");
var router = express.Router();
var UserController = require("../controllers/UserController");

router.get("/register", UserController.renderRegister);

router.get("/login", UserController.renderLogin);

router.get("/verify/:token", UserController.verify);

router.post("/register", UserController.register);

router.post("/login", UserController.login);

router.get("/logout", UserController.logout);

module.exports = router;
