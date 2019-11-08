require("dotenv").config({ path: __dirname + "/../.env" });
const multer = require("multer");
const uuid = require("uuid");
const fs = require("fs");
const jimp = require("jimp");
const Location = require("../../models/location");
const courseFormConfig = require("../../formsConfig/courseFormConfig")();

const Course = require("../../models/course");
const Story = require("../../models/story");

module.exports.getCourses = async function(req, res) {
  let courses = await Course.find({})
    .sort({ order: 1 })
    .exec();
  const storys = await Story.find()
    .select("title slug")
    .exec();

  res.render("admin/adminCourses", {
    courses,
    courseFormConfig,
    storys
  });
};

module.exports.getSingleCourse = function (req, res) {
  Course.findOne({ slug: req.params.slug }, function (err, course) {
    res.render("course", {
      course,
      courseFormConfig
    });
  });
};
module.exports.editCourse = async function (req, res) {
  const course = await Course.findOne({ slug: req.params.slug }).populate("successStory");
  const storys = await Story.find()
    .select("title slug")
    .exec();
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
    storys,
    courseFormConfig,
    locations: all
  });
};
module.exports.createCourse = async function (req, res) {
  const storys = await Story.find()
    .select("title slug")
    .exec();
  var course = await new Course();
  course.headline = req.body.headline;
  course.title = req.body.title;
  course.subheading = req.body.subheading;
  course.subtitle = req.body.subtitle;
  course.order = req.body.order;
  course.locations = req.body.locations;
  course.icon = req.body.icon;
  course.massnahmeNumber = req.body.massnahmenummer;
  course.massnahmeDetails = req.body.massnahmedetails;


  course.successStory = req.body.successStory;

  course.archivements = [1, 2, 3, 4, 5].map(item => {
    return {
      icon: req.body[`archivement_icon_${item}`],
      description: req.body[`archivement_description_${item}`]
    };
  });

  course.timeline = [1, 2, 3, 4, 5].map(item => {
    return {
      title: req.body[`timeline_title_${item}`],
      subtitle: req.body[`timeline_subtitle_${item}`],
      time: req.body[`timeline_time_${item}`]
    };
  });

  course.features = [1, 2, 3, 4, 5].map(item => {
    return {
      icon: req.body[`features_icon_${item}`],
      subtitle: req.body[`features_subtitle_${item}`],
      title: req.body[`features_title_${item}`]
    };
  });

  course.curriculumPdf = req.body.curriculumPdf;

  // save the course and check for errors
  course.save(async function (err) {
    if (err) {
      console.log("error", err);

      req.flash("danger", `Error ${err}`);
      let courses = await Course.find({})
        .sort({ order: 1 })
        .exec();
      res.render("admin/adminCourses", {
        courses,
        storys,
        course,
        courseFormConfig
      });
      return;
    }
    req.flash("success", `Successfully created ${course.title}`);
    res.redirect("/admin/courses");
  });
};
module.exports.deleteCourse = function (req, res) {
  Course.remove(
    {
      slug: req.params.slug
    },
    function (err, course) {
      if (err) res.send(err);
      req.flash("success", `Successfully deleted ${course.name}`);
      res.redirect("/admin/courses");
    }
  );
};
// Storage settings for project images
const storage = multer.diskStorage({
  destination: function (request, file, next) {
    next(null, "./temp");
  },
  filename: function (request, file, next) {
    next(null, uuid(4));
  }
});
module.exports.uploadImages = multer({
  storage,
  limits: {
    fileSize: 10000000 // 10 MB
  },
  fileFilter(req, file, next) {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      next(null, true);
    } else {
      next({ message: "That filetype is not allowed!" }, false);
    }
  }
}).fields([
  { name: "curriculumPdf", maxCount: 1 },
  { name: "icon", maxCount: 1 },
  { name: "archivement_icon_1", maxCount: 1 },
  { name: "archivement_icon_2", maxCount: 1 },
  { name: "archivement_icon_3", maxCount: 1 },
  { name: "archivement_icon_4", maxCount: 1 },
  { name: "archivement_icon_5", maxCount: 1 },
  { name: "features_icon_1", maxCount: 1 },
  { name: "features_icon_2", maxCount: 1 },
  { name: "features_icon_3", maxCount: 1 },
  { name: "features_icon_4", maxCount: 1 },
  { name: "features_icon_5", maxCount: 1 }
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
      if (singleFile[0].mimetype === "application/pdf") {
        const pdfFile = fs.readFileSync(singleFile[0].path);
        fs.writeFileSync(
          `${process.env.IMAGE_UPLOAD_DIR}/${
            request.body[singleFile[0].fieldname]
          }`,
          pdfFile
        );
      }
      if (singleFile[0].mimetype.startsWith("image/")) {
        const image = await jimp.read(singleFile[0].path);
        await image.cover(500, 500);
        await image.write(
          `${process.env.IMAGE_UPLOAD_DIR}/${
            request.body[singleFile[0].fieldname]
          }`
        );
        fs.unlinkSync(singleFile[0].path);
      }
    } catch (error) {
      console.log(error);
    }
  }
  next();
};

module.exports.updateCourse = async function (req, res) {
  let course = await Course.findOne({ slug: req.params.slug });
  course.icon = req.body.icon ? req.body.icon : course.icon;
  course.headline = req.body.headline;
  course.title = req.body.title;
  course.subheading = req.body.subheading;
  course.order = req.body.order;
  course.locations = req.body.locations;
  course.massnahmeNumber = req.body.massnahmenummer;
  course.massnahmeDetails = req.body.massnahmedetails;
  course.curriculumPdf = req.body.curriculumPdf;
 course.icon = req.files.icon ? req.body.icon : course.icon;

  course.successStory = !!req.body.successStory ? req.body.successStory : undefined;
  course.curriculumPdf = req.body.curriculumPdf;

  course.icon = req.files.icon ? req.body.icon : course.icon;

  function verbose(inputs) {
    let items = [];
    let { itemsAmount, model, titles } = inputs;
    for (let i = 1; i <= itemsAmount; i++) {
      items.push(i);
    }

    if (items.length == itemsAmount) {
      items.map((_, i) => {
        titles.map(title => {
          if (!course[model][i]) {
            course[model][i] = {
              icon: "",
              description: ""
            };
          }
          course[model][i][title.dbChild] = req[
            model == "archivements" && title.dbChild == "icon"
              ? "files"
              : "body"
          ][`${title.reqChild}${i + 1}`]
            ? req.body[`${title.reqChild}${i + 1}`]
            : course[model][i][title.dbChild];
        });
      });
    }
  }
  const archivements = {
    itemsAmount: 5,
    model: "archivements",
    titles: [
      {
        dbChild: "icon",
        reqChild: "archivement_icon_"
      },
      {
        dbChild: "description",
        reqChild: "archivement_description_"
      }
    ]
  };

  const timeline = {
    itemsAmount: 3,
    model: "timeline",
    titles: [
      {
        dbChild: "title",
        reqChild: "timeline_title_"
      },
      {
        dbChild: "subtitle",
        reqChild: "timeline_subtitle_"
      },
      {
        dbChild: "time",
        reqChild: "timeline_time_"
      }
    ]
  };

  const features = {
    itemsAmount: 5,
    model: "features",
    titles: [
      {
        dbChild: "title",
        reqChild: "features_title_"
      },
      {
        dbChild: "subtitle",
        reqChild: "features_subtitle_"
      },
      {
        dbChild: "icon",
        reqChild: "features_icon_"
      }
    ]
  };
  verbose(archivements);
  verbose(timeline);
  verbose(features);
  try {
    await course.save();
    req.flash("success", `Successfully updated ${course.title}`);
    
  } catch (error) {
    req.flash("danger", JSON.stringify(error));
    console.debug('error', error);
  }


  res.redirect("/admin/courses/edit/" + req.params.slug);
};
