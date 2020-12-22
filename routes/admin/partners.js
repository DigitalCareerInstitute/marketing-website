const express = require('express')
const router = express.Router()

const PartnersController = require('../../controllers/admin/AdminPartnersController');
const { ensureAuthenticated, redirectNonAdmin } = require("../../helpers/helper");

router.get("/", ensureAuthenticated, redirectNonAdmin, PartnersController.getPartners);

router.get(
  "/edit/:slug",
  ensureAuthenticated, redirectNonAdmin,
  PartnersController.editPartner
);

router.post(
  "/",
  ensureAuthenticated, redirectNonAdmin,
  PartnersController.uploadImages,
  PartnersController.resizeImages,
  PartnersController.createPartner
);

router.delete(
  "/delete/:slug",
  ensureAuthenticated, redirectNonAdmin,
  PartnersController.deletePartner
);
router.put(
  "/update/:slug",
  ensureAuthenticated, redirectNonAdmin,
  PartnersController.uploadImages,
  PartnersController.resizeImages,
  PartnersController.updatePartner
);
router.get("/:slug/l18n", ensureAuthenticated, redirectNonAdmin, PartnersController.setL18n);
module.exports = router;
