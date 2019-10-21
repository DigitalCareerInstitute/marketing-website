const express = require("express");
const router = express.Router();
const {
  ensureAuthenticated,
  redirectNonSuperAdmin
} = require("../../helpers/helper");

const AdminUsersController = require("../../controllers/admin/AdminUsersController");

router.get(
  "/",
  ensureAuthenticated,
  redirectNonSuperAdmin,
  AdminUsersController.getUsers
);

router.get(
  "/upgrade_user/:id",
  ensureAuthenticated,
  redirectNonSuperAdmin,
  AdminUsersController.upgradeUser
);

module.exports = router;
