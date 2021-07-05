require("dotenv").config({ path: __dirname + "/../.env" });
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const { getAsyncRedis, jsonResponseObject } = require("../../helpers/helper");

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
    let questions = await Question.findOne({})
    const response = {
      questions
    }
    if (req.session.passport.user && req.baseUrl.indexOf('/admin') === -1) {
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

module.exports.updateQuestion = async (req, res) => {
  try {
    let question = await Question.findOneAndUpdate({ model: req.body }).exec({});
    if (!question) {
      question = new Question({ model: req.body });
      responseMsg = `Successfully created`
    }
    await question.save()
    return jsonResponseObject(res, question)
  } catch (err) {
    console.log(err);
    return jsonResponseObject(res, err)
  }
};
