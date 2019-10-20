const passport = require("passport");
const { check, validationResult } = require("express-validator");
const uuid = require("uuid");

const User = require("../models/user");
const { sendMail, getRequestUrl } = require("../helpers/helper");

module.exports.renderLogin = (req, res) => {
  if (req.user) {
    res.redirect("/admin");
  }
  res.render("login");
};
module.exports.renderRegister = (req, res) => {
  if (req.user) {
    res.redirect("/admin");
  }
  res.render("register");
};
sendVerificationMail = async (res, req, userToken) => {
  const verificationLink = `${getRequestUrl(req)}/users/verify/${userToken}`;
  const mailOptions = {
    from: "verification@digitalcareerinstitute.org",
    to: req.body.email,
    subject: "Verify your account on digitalcareerinstitute.org",
    text: `By clicking on the following link, you verify your account <a href="${verificationLink}">${verificationLink}</a>`,
    html: `By clicking on the following link, you verify your account <a href="${verificationLink}">${verificationLink}</a>`
  };
  return await sendMail(res, req, mailOptions);
};
module.exports.register = async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  // Validation
  //TODO validate user registration input
  // check("email", "Email is required").notEmpty();
  check("email", "Email is not valid").isEmail();
  // check("username", "Username is required").notEmpty();
  // check("password", "Password is required").notEmpty();
  // check("password2", "Passwords do not match").equals(req.body.password);

  const errors = validationResult(req);
  console.log("errors", errors);
  if (!errors.isEmpty()) {
    req.flash(
      "danger",
      errors
        .array()
        .map(i => i.msg)
        .join(", ")
    );
    res.render("register");
  } else {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      req.flash("danger", `Email already taken`);
      res.redirect("/users/register");
    } else {
      const userToken = uuid(4);
      const newUser = new User({
        email: email,
        username: username,
        password: password,
        token: userToken
      });

      User.createUser(newUser, async (err, user) => {
        if (err) throw err;
        try {
          const response = await sendVerificationMail(res, req, userToken);
          req.flash(
            "success",
            `Email ${email} registered. Please check your mails for verification.`
          );
          res.redirect("/users/login");
        } catch (e) {
          req.flash("danger", `A error occured, please try it later again!`);
          res.redirect(req.headers.referer);
        }
      });
    }
  }
};
module.exports.login = function(req, res, next) {
  passport.authenticate("local", function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("danger", `${info.message}`);
      return res.redirect("/users/login");
    } else if (!user.verifiedAt) {
      req.flash("danger", `Account not verified`);
      return res.redirect("/users/login");
    } else {
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        req.flash("success", `Welcome ${user.username}!`);
        return res.redirect("/admin/contacts");
      });
    }
  })(req, res, next);
};

module.exports.verify = async function(req, res, next) {
  const user = await User.findOne({ token: req.params.token });
  if (!user) {
    req.flash("danger", `Token ${req.parmas.token} not found!`);
    return res.redirect("/users/register");
  } else {
    user.verifiedAt = new Date();
    req.flash("success", `Email ${user.email} verified!`);
    await user.save();
    return res.redirect("/users/login");
  }
};
module.exports.logout = (req, res) => {
  req.logout();
  res.redirect("/users/login");
};
