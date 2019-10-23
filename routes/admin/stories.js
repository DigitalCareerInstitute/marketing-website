const express = require("express");
const router = express.Router();
const { ensureAuthenticated, redirectNonAdmin } = require('../../helpers/helper')

const AdminStoriesController = require("../../controllers/admin/AdminStoriesController");
router.get("/", ensureAuthenticated, AdminStoriesController.getStories);

router.get("/edit/:slug", ensureAuthenticated, AdminStoriesController.editStory);

router.post("/", ensureAuthenticated, AdminStoriesController.uploadImages, AdminStoriesController.resizeImages, AdminStoriesController.createStory);

router.delete("/delete/:slug", ensureAuthenticated, AdminStoriesController.deleteStory);
router.put("/update/:slug", ensureAuthenticated, AdminStoriesController.uploadImages, AdminStoriesController.resizeImages, AdminStoriesController.updateStory);
router.get("/:slug/l18n", ensureAuthenticated, redirectNonAdmin, AdminStoriesController.setL18n);
module.exports = router;
