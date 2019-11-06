const AdminEmployeesController = require("../../controllers/admin/AdminEmployeesController");

const express = require("express");
const router = express.Router();
const {
  ensureAuthenticated,
  redirectNonAdmin
} = require("../../helpers/helper");

router.get(
  "/",
  ensureAuthenticated,
  redirectNonAdmin,
  AdminEmployeesController.getEmployees
);
router.post(
  "/",
  ensureAuthenticated,
  redirectNonAdmin,
  AdminEmployeesController.uploadImages,
  AdminEmployeesController.resizeImages,
  AdminEmployeesController.createEmployee
);
router.get(
  "/edit/:slug",
  ensureAuthenticated,
  redirectNonAdmin,
  AdminEmployeesController.editEmployee
);
router.put(
  "/update/:slug",
  ensureAuthenticated,
  redirectNonAdmin,
  AdminEmployeesController.uploadImages,
  AdminEmployeesController.resizeImages,
  AdminEmployeesController.updateEmployee
);

router.delete(
  "/delete/:slug",
  ensureAuthenticated,
  redirectNonAdmin,
  AdminEmployeesController.deleteEmployee
);

router.get("/:slug/l18n", ensureAuthenticated, redirectNonAdmin, AdminEmployeesController.setL18n);
module.exports = router;
