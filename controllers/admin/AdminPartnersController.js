require("dotenv").config({ path: __dirname + "/../.env" });
const multer = require("multer");
const fs = require("fs");
const jimp = require("jimp");
const Partner = require("../../models/partner");
const uuid = require("uuid");
const AbstractController = require("./AbstractController");

module.exports.getPartners = async function(req, res) {
  try {
    let partners = await Partner.find({})
      .sort("-createdAt")
      .populate("language")
      .populate("languageVersion")
      .exec();

    res.render("admin/partners", {
      partners
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.deletePartner = async function(req, res) {
  await Partner.deleteOne({
    slug: req.params.slug
  });

  req.flash("success", `Successfully deleted Partner`);
  res.redirect("/admin/partners");
};

module.exports.editPartner = async function(req, res) {
  const partner = await Partner
    .findOne({ slug: req.params.slug })
    .populate("language")
    .populate("languageVersion")
  res.render("admin/editPartner", {
    partner: partner
  });
};

module.exports.updatePartner = async (req, res) => {
  const partner = await Partner.findOne({ slug: req.params.slug })
  partner.title = req.body.title;
  partner.link = req.body.link;
  partner.partnerlogo = req.files.partnerlogo
    ? req.body.partnerlogo
    : partner.partnerlogo
  partner.testimonial_name = req.body.testimonial_name !== "" ? req.body.testimonial_name : ""
  partner.testimonial_content = req.body.testimonial_content !== "" ? req.body.testimonial_content : ""
  partner.testimonial_job = req.body.testimonial_job !== "" ? req.body.testimonial_job : ""
  partner.testimonial_show = req.body.testimonial_show === "on" ? true: false
  if (partner.partnerlogo && fs.existsSync(`${partner.partnerlogo}.jpg`)) {
    await fs.unlinkSync(`${process.env.IMAGE_UPLOAD_DIR}${partner.partnerlogo}`)
  }
  await partner.save();
  req.flash("success", `Successfully updated ${partner.title}`);
  res.redirect("/admin/partners/edit/" + partner.slug);
};

module.exports.createPartner = async function(req, res) {
  const partner = await new Partner();

  partner.title = req.body.title;
  partner.order = req.body.order;
  partner.link = req.body.link;
  partner.testimonial_name = req.body.testimonial_name
  partner.testimonial_content = req.body.testimonial_content
  partner.testimonial_job = req.body.testimonial_job
  partner.testimonial_show = req.body.testimonial_show === "on" ? true: false

  partner.partnerlogo = req.files.partnerlogo
    ? req.body.partnerlogo
    : partner.partnerlogo;

  try {
    await partner.save();
    req.flash("success", `Successfully created ${partner.title}`);
    res.redirect("/admin/partners");
  } catch (error) {
    console.log("Error trying to save Partner", error);
  }
};
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
}).fields([{ name: "partnerlogo", maxCount: 1 }]);

module.exports.resizeImages = async (request, response, next) => {
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
      await image.scaleToFit(150, 150);
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

module.exports.setL18n = async (req, res) => {
  AbstractController.cloneSite(req, res, Partner)
};