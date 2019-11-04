require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Story = require("../../models/story");
const {isAdmin} = require("../../helpers/helper");
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const fs = require('fs');

// to catch the error if 'IMAGE_UPLOAD_DIR' path not exist in .env file
if(!process.env.IMAGE_UPLOAD_DIR) {
  console.error("IMAGE_UPLOAD_DIR MISSING")
  process.exit()
}

module.exports.getStories = async function (req, res) {
  //here we get the whole collection and sort by order
  const query = isAdmin(req) ? {userId: req.user._id} : {}
  
  let stories = await Story.find(query)
    .sort("order")
    .exec();

  res.render("admin/stories", {
    stories: stories
 
  });
}


module.exports.getSingleStory = async (req, res) => {
  try {
    const story = await Story.findOne({ "slug": req.params.slug })
    res.render(`story`, {
      story
    });
  } catch (err) {
    console.log(err);
  }
}
module.exports.editStory = async function (req, res) {
  const query = isAdmin(req) ? {userId: req.user._id, slug: req.params.slug} : {slug: req.params.slug}
  let stories = await Story.find({})
    .sort("order")
    .exec();
  const story = await Story.findOne(query)
  
  const shiftStoryBack = stories.length + 1

  res.render("admin/editStory", {
    story,
    maxOrder: shiftStoryBack
  });
}
module.exports.createStory = async (req, res) => {
  var story = new Story(); // create a new instance of the story model
  //TODO this could be refactored
  story.title = req.body.title; // set the stories title (comes from the request)
  story.subtitle = req.body.subtitle; // set the stories subtitle (comes from the request)
  story.workPosition = req.body.workPosition; // set the stories work position (comes from the request)
  story.excerpt = req.body.excerpt; // set the stories excerpt (comes from the request)
  story.content = req.body.content; // set the stories content (comes from the request)
  story.order = req.body.order; // set the stories order (comes from the
  story.avatar = req.files.avatar ? req.body.avatar : story.avatar;
  story.companylogo = req.files.companylogo ? req.body.companylogo : story.companylogo;
  
  story.userId = isAdmin(req) ? req.user.id : null

  // save the story and check for errors
  story.save(function (err) {
    if (err) res.send(err);
    req.flash("success", `Successfully created ${story.title}`);    
    
    res.redirect("/admin/stories");
  });
}
module.exports.deleteStory = async (req, res) => {
  try {
    const query = isAdmin(req) ? {userId: req.user._id, slug: req.params.slug} : {slug: req.params.slug}
    const story = await Story.remove(query)
    req.flash("success", `Successfully deleted ${story.title}`);
    res.redirect("/admin/stories");
  } catch (err) {
    console.log(err);
  }
}

module.exports.updateStory = async function (req, res) {
  const query = isAdmin(req) ? {userId: req.user._id, slug: req.params.slug} : {slug: req.params.slug}

  let story = await Story.findOne(query).exec()
  
  story.title = req.body.title;
  story.subtitle = req.body.subtitle;
  story.slug = req.body.slug;
  story.workPosition = req.body.workPosition;
  story.excerpt = req.body.excerpt;
  story.content = JSON.parse(req.body.content);
  story.order = req.body.order;

  story.avatar = req.files.avatar ? req.body.avatar : story.avatar;
  story.companylogo = req.files.companylogo ? req.body.companylogo : story.companylogo;
  
  try {
    await story.save();
    req.flash("success", `Successfully updated ${story.title}`);
    res.redirect("/admin/stories/edit/" + story.slug);
  } catch (error) {
    console.log('error', error);
  }
}


// Storage settings for project images
const storage = multer.diskStorage({
  destination: function (request, file, next) {
    next(null, './temp')
  },
  filename: function (request, file, next) {
    next(null, uuid(4))
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
    request.body[singleFile[0].fieldname] = `${
      singleFile[0].filename
      }.${extension}`;
    try {

      const image = await jimp.read(singleFile[0].path);
      // await image.cover(350, 180);
      await image.write(
        `${process.env.IMAGE_UPLOAD_DIR}/${request.body[singleFile[0].fieldname]}`
      );
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
