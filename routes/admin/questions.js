const express = require("express");
const router = express.Router();
const { ensureAuthenticated, redirectNonSuperAdmin } = require('../../helpers/helper')

const AdminQuestionsController = require("../../controllers/admin/AdminQuestionsController")
router
  .get("/",
    ensureAuthenticated,
    redirectNonSuperAdmin,
    AdminQuestionsController.renderQuestions)
  .get("/fetch", 
    // public because consumed by landingpage
    AdminQuestionsController.getQuestions)
router
  .post("/update",
    ensureAuthenticated,
    redirectNonSuperAdmin,
    AdminQuestionsController.updateQuestion)

module.exports = router;
