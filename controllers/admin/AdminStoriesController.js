require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Story = require("../../models/story");
const { isAdmin } = require("../../helpers/helper");
const multer = require('multer');
const path = require("path");
const jimp = require('jimp');
const uuid = require('uuid');
const fs = require('fs');
const AbstractController = require("./AbstractController");

// to catch the error if 'IMAGE_UPLOAD_DIR' path not exist in .env file
if (process.env.NODE_ENV !== "test" && !process.env.IMAGE_UPLOAD_DIR) {
  console.error("IMAGE_UPLOAD_DIR MISSING")
  process.exit()
}

module.exports.getStories = async function (req, res) {
  //here we get the whole collection and sort by order
  const query = !isAdmin(req) ? { userId: req.user._id } : {}

  let stories = await Story.find(query)
    .sort("order")
    .populate("language")
    .populate("languageVersion")
    .exec();

  res.render("admin/stories", {
    stories: stories
  });
}

module.exports.editStory = async function (req, res) {
  const query = !isAdmin(req) ? { userId: req.user._id, slug: req.params.slug } : { slug: req.params.slug }
  let stories = await Story.find({})
    .sort("order")
    .exec();
  const story = await Story
    .findOne(query)
    .populate("language")
    .populate("languageVersion")

  if (story) {
    const shiftStoryBack = stories.length + 1
    res.render("admin/editStory", {
      story,
      maxOrder: shiftStoryBack
    });
  } else {
    req.flash("danger", `Not allowed`);
    res.redirect("/admin/stories");
  }
}
module.exports.createStory = async (req, res) => {
  try {
    var story = new Story(); // create a new instance of the story model
    //TODO this could be refactored
    story.title = req.body.title; // set the stories title (comes from the request)
    story.subtitle = req.body.subtitle; // set the stories subtitle (comes from the request)
    story.workPosition = req.body.workPosition; // set the stories work position (comes from the request)
    story.excerpt = req.body.excerpt; // set the stories excerpt (comes from the request)
    story.content = req.body.content; // set the stories content (comes from the request)
    story.order = req.body.order; // set the stories order (comes from the
    story.isCompanyStory = !!req.body.isCompanyStory; // set the stories order (comes from the
    story.avatar = req.files.avatar ? req.body.avatar : story.avatar;
    story.avatarSmall = req.files.avatar ? req.body.avatar : story.avatarSmall;
    story.avatarMedium = req.files.avatar ? req.body.avatar : story.avatarMedium;
    story.companylogo = req.files.companylogo ? req.body.companylogo : story.companylogo;

    story.userId = !isAdmin(req) ? req.user.id : null

    // save the story and check for errors
    story.save(function (err) {
      if (err) res.send(err);
      req.flash("success", `Successfully created ${story.title}`);

      res.redirect("/admin/stories");
    });
  } catch (err) {
    console.log(err);
    req.flash("danger", `Error: ${err}`);
    res.redirect("/admin/stories");
  }
}
module.exports.deleteStory = async (req, res, next) => {
  try {
    const query = !isAdmin(req) ? { userId: req.user._id, slug: req.params.slug } : { slug: req.params.slug }
    Story.findOne(query)
      .populate('language')
      .populate('languageVersion')
      .exec((err, doc) => {
        if (err) res.send(err);
        doc.remove(next);
        req.flash("success", `Successfully deleted ${doc.title}`);
        res.redirect("/admin/stories");
      })
  } catch (err) {
    req.flash("danger", `Not allowed`);
    res.redirect("/admin/stories");
    console.log(err);
  }
}

module.exports.updateStory = async function (req, res) {
  const query = !isAdmin(req) ? { userId: req.user._id, slug: req.params.slug } : { slug: req.params.slug }
  let story = await Story.findOne(query).populate('languageVersion').exec()
  try {
    if (req.body.avatar && story.avatar && await fs.existsSync(path.resolve(process.env.IMAGE_UPLOAD_DIR, story.avatar))) {
      await fs.unlinkSync(path.resolve(process.env.IMAGE_UPLOAD_DIR, story.avatar));
    }
    if (req.body.companylogo && story.companylogo && await fs.existsSync(path.resolve(process.env.IMAGE_UPLOAD_DIR, story.companylogo))) {
      await fs.unlinkSync(path.resolve(process.env.IMAGE_UPLOAD_DIR, story.companylogo));
    }
    story.title = req.body.title;
    story.subtitle = req.body.subtitle;
    story.slug = req.body.slug;
    story.workPosition = req.body.workPosition;
    story.excerpt = req.body.excerpt;
    story.content = JSON.parse(req.body.content);
    story.order = req.body.order;
    story.isCompanyStory = !!req.body.isCompanyStory;

    story.avatar = req.files.avatar ? req.body.avatar : story.avatar;
    story.avatarSmall = req.files.avatar ? `${req.body.avatar.split('.').join('-small.')}` : story.avatarSmall;
    story.avatarMedium = req.files.avatar ? `${req.body.avatar.split('.').join('-medium.')}` : story.avatarMedium;
    story.companylogo = req.files.companylogo ? req.body.companylogo : story.companylogo;

    if (story.languageVersion) {
      story.languageVersion.isCompanyStory = story.isCompanyStory;
      await story.languageVersion.save();
    }
    if (story.avatar && fs.existsSync(`${story.avatar}.jpg`)) {
      await fs.unlinkSync(`${process.env.IMAGE_UPLOAD_DIR}${story.avatar}`)
    }
    if (story.avatarSmall && fs.existsSync(`${story.avatarSmall}.jpg`)) {
      await fs.unlinkSync(`${process.env.IMAGE_UPLOAD_DIR}${story.avatarSmall}`)
    }
    if (story.avatarMedium && fs.existsSync(`${story.avatarMedium}.jpg`)) {
      await fs.unlinkSync(`${process.env.IMAGE_UPLOAD_DIR}${story.avatarMedium}`)
    }
    await story.save();
    req.flash("success", `Successfully updated ${story.title}`);

    res.redirect("/admin/stories/edit/" + story.slug);

  } catch (err) {
    console.log(err);
    req.flash("danger", `Error: ${err}`);
    res.redirect("/admin/stories/edit/" + story.slug);
  }
}


// Storage settings for project images
const storage = multer.diskStorage({
  destination: function (request, file, next) {
    next(null, './temp')
  },
  filename: function (request, file, next) {
    next(null, `${uuid(4)}.jpg`)
  }
})


// Handle the image upload and filter by type
module.exports.uploadImages = multer({
  storage,
  limits: {
    fileSize: 10000000 // 10 MB
  },
  fileFilter(req, file, next) {
    if (file.mimetype.startsWith('image/')) {
      next(null, true)
    } else {
      next({ message: 'That filetype is not allowed!' }, false)
    }
  }
}).fields([
  { name: "avatar", maxCount: 1 },
  { name: "companylogo", maxCount: 1 }
]);

// Resize the images with different thumbnail sizes
exports.resizeImages = async (request, response, next) => {

  if (!request.files) {
    next();
    return;
  }
  for await (const singleFile of Object.values(request.files)) {
    const extension = singleFile[0].mimetype.split("/")[1];
    request.body[singleFile[0].fieldname] = `${singleFile[0].filename
      }`;
    try {

      const image = await jimp.read(singleFile[0].path);
      const imageSmall = await jimp.read(singleFile[0].path);
      const imageMedium = await jimp.read(singleFile[0].path);
      console.log(image.hash());
      await image
        // .quality(90)
        .write(`${process.env.IMAGE_UPLOAD_DIR}${request.body[singleFile[0].fieldname]}`);
      await imageSmall
        .scaleToFit(160, 160, jimp.RESIZE_NEAREST_NEIGHBOR)
        // .quality(90)
        .write(`${process.env.IMAGE_UPLOAD_DIR}${request.body[singleFile[0].fieldname].split('.').join('-small.')}`);
      await imageMedium
        .scaleToFit(400, 400)
        // .quality(80)
        .write(`${process.env.IMAGE_UPLOAD_DIR}${request.body[singleFile[0].fieldname].split('.').join('-medium.')}`);
      fs.unlinkSync(singleFile[0].path);
    } catch (error) {
      console.log(error);
    }
  }
  next();
};

// Validate profile data and save
exports.updateProfile = async (request, response) => {
  await User.findOneAndUpdate(
    { _id: request.story.slug },
    request.body,
    {
      new: true,
      runValidators: true
    }
  ).exec()

  response.redirect('/admin/stories/edit' + story.slug)
}

module.exports.setL18n = async (req, res) => {
  AbstractController.cloneSite(req, res, Story, ["isCompanyStory"])
};
