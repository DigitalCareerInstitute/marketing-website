require("dotenv").config({ path: __dirname + "/../.env" });
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const requestPromise = require("request-promise");
const { jsonResponseObject } = require("../../helpers/helper");

module.exports.renderQuestions = async (req, res) => {
  try {
    const answers = await Answer
      .find()
      .exec()
    res.render("admin/adminQuestions", {
      answers
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.getQuestions = async (req, res) => {
  try {
    let questions = await Question.find()
    const response = {
      questions
    }
    if (req.session.passport && req.session.passport.user && req.headers.referer.indexOf('/admin') !== -1) {
      var options = {
        method: 'GET',
        url: `https://api.hubapi.com/properties/v1/contacts/properties`,
        qs: { hapikey: process.env.HUBSPOT_API_KEY },
        headers: {
          'Content-Type': 'application/json'
        },
        json: true
      };
      try {
        const hubspotCache = await requestPromise(options)
        response.hb_fields = hubspotCache
      } catch (error) {
        console.log('error', error);
      } finally {
        return jsonResponseObject(res, response)
      }
    } else {
      return jsonResponseObject(res, response)
    }
  } catch (err) {
    console.log(err);
  }
};
module.exports.getQuestion = async (req, res) => {
  try {
    let questions = await Question.findOne({ name: req.params.questions })
    const response = {
      questions
    }
    return jsonResponseObject(res, response)
  } catch (err) {
    console.log(err);
  }
};

module.exports.updateQuestion = async (req, res) => {
  try {
    let question
    if (req.body._id === "") {
      question = new Question({ name: req.body.name, model: req.body.model, active: false });
    } else {
      question = await Question.findById(req.body._id).exec({});
      if (question) {
        question.name = req.body.name
        question.model = req.body.model
        question.active = req.body.active
      }
    }
    await question.save()
    return jsonResponseObject(res, question)
  } catch (err) {
    return jsonResponseObject(res, "", err)
  }
};