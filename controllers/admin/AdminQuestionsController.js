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
    return jsonResponseObject(res, questions)
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
