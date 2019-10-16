require("dotenv").config({ path: __dirname + "/../.env" });
const multer = require("multer");
const uuid = require("uuid");
const fs = require("fs");
const jimp = require("jimp");
const Location = require("../../models/location");
const courseFormConfig = require("../../formsConfig/courseFormConfig")();

const Course = require("../../models/course");

module.exports.getCourses = async function(req, res) {
  let courses = await Course.find({})
    .sort({ order: 1 })
    .exec();

  res.render("admin/adminCourses", {
    courses,
    courseFormConfig
  });
};

module.exports.getSingleCourse = function(req, res) {
  Course.findOne({ slug: req.params.slug }, function(err, course) {
    res.render("course", {
      course
    });
  });
};
module.exports.editCourse = async function(req, res) {
  const course = await Course.findOne({ slug: req.params.slug });
  const courses = await Course.find({})
    .sort("order")
    .exec();
  let alllocations = await Location.find({}).exec();
  all = alllocations.map(loc => {
    let match = course.locations
      .map(pcat => pcat.toString())
      .includes(loc._id.toString());

    if (match) {
      return Object.assign({ selected: true }, loc._doc);
    } else {
      return loc._doc;
    }
  });

  res.render("admin/editCourse", {
    course,
    courseFormConfig,
    locations: all
  });
};
module.exports.createCourse = async function(req, res) {
  var course = await new Course();
  course.headline = req.body.headline;
  course.title = req.body.title;
  course.subheading = req.body.subheading;
  course.subtitle = req.body.subtitle;
  course.order = req.body.order;
  course.locations = req.body.locations;
  course.icon = req.body.icon;
  course.archivements = [
    {
      icon: req.body.archivement_icon_1,
      description: req.body.archivement_description_1
    },
    {
      icon: req.body.archivement_icon_2,
      description: req.body.archivement_description_2
    },
    {
      icon: req.body.archivement_icon_3,
      description: req.body.archivement_description_3
    }
  ];
  course.timeline = [
    {
      title: req.body.timeline_title_1,
      subtitle: req.body.timeline_subtitle_1,
      time: req.body.timeline_time_1
    },
    {
      title: req.body.timeline_title_2,
      subtitle: req.body.timeline_subtitle_2,
      time: req.body.timeline_time_2
    },
    {
      title: req.body.timeline_title_3,
      subtitle: req.body.timeline_subtitle_3,
      time: req.body.timeline_time_3
    }
  ];
  course.features = [
    {
      icon: req.body.features_icon_1,
      subtitle: req.body.features_subtitle_1,
      title: req.body.features_title_1
    },
    {
      icon: req.body.features_icon_2,
      subtitle: req.body.features_subtitle_2,
      title: req.body.features_title_2
    },
    {
      icon: req.body.features_icon_3,
      subtitle: req.body.features_subtitle_3,
      title: req.body.features_title_3
    }
  ];

  // save the course and check for errors
  course.save(async function(err) {
    if (err) {
      console.log("error", err);

      req.flash("danger", `Error ${err}`);
      let courses = await Course.find({})
        .sort({ order: 1 })
        .exec();
      res.render("admin/adminCourses", {
        courses,
        course
      });
      return;
    }
    req.flash("success", `Successfully created ${course.title}`);
    res.redirect("/admin/courses");
  });
};
module.exports.deleteCourse = function(req, res) {
  Course.remove(
    {
      slug: req.params.slug
    },
    function(err, course) {
      if (err) res.send(err);
      req.flash("success", `Successfully deleted ${course.name}`);
      res.redirect("/admin/courses");
    }
  );
};
// Storage settings for project images
const storage = multer.diskStorage({
  destination: function(request, file, next) {
    next(null, "./temp");
  },
  filename: function(request, file, next) {
    next(null, uuid(4));
  }
});
module.exports.uploadImages = multer({
  storage,
  limits: {
    fileSize: 10000000 // 10 MB
  },
  fileFilter(req, file, next) {
    if (file.mimetype.startsWith("image/")) {
      next(null, true);
    } else {
      next({ message: "That filetype is not allowed!" }, false);
    }
  }
}).fields([
  { name: "icon", maxCount: 1 },
  { name: "archivement_icon_1", maxCount: 1 },
  { name: "archivement_icon_2", maxCount: 1 },
  { name: "archivement_icon_3", maxCount: 1 },
  { name: "features_icon_1", maxCount: 1 },
  { name: "features_icon_2", maxCount: 1 },
  { name: "features_icon_3", maxCount: 1 }
]);

// Resize the images with different thumbnail sizes
//
exports.resizeImages = async (request, response, next) => {
  if (!request.files) {
    next();
    return;
  }
  for await (const singleFile of Object.values(request.files)) {
    const extension = singleFile[0].mimetype.split("/")[1];
    request.body[
      singleFile[0].fieldname
    ] = `${singleFile[0].filename}.${extension}`;
    try {
      const image = await jimp.read(singleFile[0].path);
      await image.cover(500, 500);
      await image.write(
        `${process.env.IMAGE_UPLOAD_DIR}/${
          request.body[singleFile[0].fieldname]
        }`
      );
      fs.unlinkSync(singleFile[0].path);
    } catch (error) {
      console.log(error);
    }
  }
  next();
};

module.exports.updateCourse = async function(req, res) {
  let course = await Course.findOne({ slug: req.params.slug });

  //TODO thats fucking verbose
  course.icon = req.body.icon ? req.body.icon : course.icon;
  course.headline = req.body.headline;
  course.title = req.body.title;
  course.subheading = req.body.subheading;
  course.order = req.body.order;
  course.locations = req.body.locations;

  course.icon = req.files.icon ? req.body.icon : course.icon;
  course.archivements[0].icon = req.files.archivement_icon_1
    ? req.body.archivement_icon_1
    : course.archivements[0].icon;
  course.archivements[0].description = req.body.archivement_description_1
    ? req.body.archivement_description_1
    : course.archivements[0].description;
  course.archivements[1].icon = req.files.archivement_icon_2
    ? req.body.archivement_icon_2
    : course.archivements[1].icon;
  course.archivements[1].description = req.body.archivement_description_2
    ? req.body.archivement_description_2
    : course.archivements[1].description;
  course.archivements[2].icon = req.files.archivement_icon_3
    ? req.body.archivement_icon_3
    : course.archivements[2].icon;
  course.archivements[2].description = req.body.archivement_description_3
    ? req.body.archivement_description_3
    : course.archivements[2].description;

  course.timeline[0].title = req.body.timeline_title_1
    ? req.body.timeline_title_1
    : course.timeline[0].title;
  course.timeline[0].subtitle = req.body.timeline_subtitle_1
    ? req.body.timeline_subtitle_1
    : course.timeline[0].subtitle;
  course.timeline[0].time = req.body.timeline_time_1
    ? req.body.timeline_time_1
    : course.timeline[0].time;

  course.timeline[1].title = req.body.timeline_title_2
    ? req.body.timeline_title_2
    : course.timeline[1].title;
  course.timeline[1].subtitle = req.body.timeline_subtitle_2
    ? req.body.timeline_subtitle_2
    : course.timeline[1].subtitle;
  course.timeline[1].time = req.body.timeline_time_2
    ? req.body.timeline_time_2
    : course.timeline[1].time;

  course.timeline[2].title = req.body.timeline_title_3
    ? req.body.timeline_title_3
    : course.timeline[2].title;
  course.timeline[2].subtitle = req.body.timeline_subtitle_3
    ? req.body.timeline_subtitle_3
    : course.timeline[2].subtitle;
  course.timeline[2].time = req.body.timeline_time_3
    ? req.body.timeline_time_3
    : course.timeline[2].time;

  course.features[0].title = req.body.features_title_1
    ? req.body.features_title_1
    : course.features[0].title;
  course.features[0].subtitle = req.body.features_subtitle_1
    ? req.body.features_subtitle_1
    : course.features[0].subtitle;
  course.features[0].icon = req.body.features_icon_1
    ? req.body.features_icon_1
    : course.features[0].icon;

  course.features[1].title = req.body.features_title_2
    ? req.body.features_title_2
    : course.features[1].title;
  course.features[1].subtitle = req.body.features_subtitle_2
    ? req.body.features_subtitle_2
    : course.features[1].subtitle;
  course.features[1].icon = req.body.features_icon_2
    ? req.body.features_icon_2
    : course.features[1].icon;

  course.features[2].title = req.body.features_title_3
    ? req.body.features_title_3
    : course.features[2].title;
  course.features[2].subtitle = req.body.features_subtitle_3
    ? req.body.features_subtitle_3
    : course.features[2].subtitle;
  course.features[2].icon = req.body.features_icon_3
    ? req.body.features_icon_3
    : course.features[2].icon;

  await course.save();

  req.flash("success", `Successfully updated ${course.title}`);

  res.redirect("/admin/courses/edit/" + req.params.slug);
};
