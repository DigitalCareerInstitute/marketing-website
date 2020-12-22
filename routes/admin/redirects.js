const express = require("express");
const router = express.Router();
const { ensureAuthenticated, redirectNonSuperAdmin } = require('../../helpers/helper')

const AdminRedirectsController = require("../../controllers/admin/AdminRedirectsController")
router.get("/",
  ensureAuthenticated,
  redirectNonSuperAdmin,
  AdminRedirectsController.getRedirects);
router.post("/",
  ensureAuthenticated,
  redirectNonSuperAdmin,
  AdminRedirectsController.createRedirect);
router.post("/delete/:id",
  ensureAuthenticated,
  redirectNonSuperAdmin,
  AdminRedirectsController.deleteRedirect);
router.post("/update",
  ensureAuthenticated,
  redirectNonSuperAdmin,
  AdminRedirectsController.updateRedirect);

module.exports = router;
