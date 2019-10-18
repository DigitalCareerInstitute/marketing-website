"use strict";
require("dotenv").config({
  path: __dirname + "/.env"
});
const fs = require("fs");
const path = require("path");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGOURL, {
  useNewUrlParser: true,
  useCreateIndex: true
});
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises

const Story = require("./models/story");
const User = require("./models/user");
const Menulocation = require("./models/menulocation");
const Contact = require("./models/contact");
const Employee = require("./models/employee");
const Course = require("./models/course");
const Location = require("./models/location");
const Partner = require("./models/partner");
const Page = require("./models/page");
const Event = require("./models/event");
const Language = require("./models/language");

const EventsController = require("./controllers/admin/AdminEventsController");

const IMAGE_UPLOAD_DIR = process.env.IMAGE_UPLOAD_DIR;

const {
  menulocations,
  stories,
  pages,
  pagesgerman,
  courses,
  users,
  events,
  partners,
  adminUser,
  contacts,
  employees,
  languages
} = require("./seeddata");
const imageUploadDir = IMAGE_UPLOAD_DIR;

async function deleteData() {
  const files = await fs.readdirSync(imageUploadDir);
  let images = [];
  for (const file of files) {
    console.log('file', file);
    
    if (file !== ".gitignore") {
      images.push(fs.unlinkSync(path.join(imageUploadDir, file)));
    }
  }
  console.log("files", images);
  
  await Promise.all(images);

  console.log("😢 Goodbye Data...");
  await Story.deleteMany();
  await Menulocation.deleteMany();
  await Location.deleteMany();
  await Partner.deleteMany();
  await Employee.deleteMany();
  await Course.deleteMany();
  await Contact.deleteMany();
  await Page.deleteMany();
  await User.deleteMany();
  await Event.deleteMany();
  await Language.deleteMany();
  console.log("Data Deleted. To load sample data, run\n\n\t npm run seeds\n\n");
  process.exit();
}

async function seedRandomNtoN(arrayOfRecords, relationship, model) {
  arrayOfRecords.map((record, index) => {
    var randomSetter = Math.floor(
      Math.random(relationship.length) * relationship.length + 1
    );
    record[model.collection.name] = [];
    for (let i = 0; i < randomSetter; i++) {
      return (record[model.collection.name][i] = relationship[
        randomSetter - 1
      ]._id.toString());
    }
  });
  return arrayOfRecords;
}

async function seedRandomImages() {
  var images = [
    "./assets/media/bg1.jpg",
    "./assets/media/bg2.jpg",
    "./assets/media/bg3.jpg"
  ];
  let index = 0;
  var promises = [];
  for await (let image of images) {
    index++;
    await fs.copyFileSync(image, `${imageUploadDir}example_image_${index}.jpg`);
  }
  return promises;
}
async function loadData() {
  try {
    await Promise.all(await seedRandomImages());
    console.log(`Images saved to ${imageUploadDir}`);
    await EventsController.fetchevents();

    const createdMenulocations = await Menulocation.insertMany(menulocations);
    const createdLocations = await Location.find();
    await Course.insertMany(courses);
    await Employee.insertMany(employees);
    await Story.insertMany(stories);
    await Partner.insertMany(partners);
    const createdLanguages = await Language.insertMany(languages);

    await User.create(adminUser);
    console.log(`You can now login as: `);
    console.log(`Email: ${adminUser.email} Password: password`);

    var associatedMenulocations = await seedRandomNtoN(
      pages,
      createdMenulocations,
      Menulocation
    );
    var associatedLocations = await seedRandomNtoN(
      contacts,
      createdLocations,
      Location
    );
    var associatedEmployees = await seedRandomNtoN(
      employees,
      createdLocations,
      Location
    );

    await Page.insertMany(associatedMenulocations);
    await Page.insertMany(pagesgerman);
    const devugees = await Page.find({title: "Devugees"})
    devugees[0].languageVersion = devugees[1]._id;
    devugees[0].language = createdLanguages[0]._id;
    devugees[1].languageVersion = devugees[0]._id;
    devugees[1].language = createdLanguages[1]._id;
    await devugees[0].save()
    await devugees[1].save()
    await Contact.insertMany(associatedLocations);
    await Employee.insertMany(associatedEmployees);

    console.log("👍 Done!\n\n Successfully loaded sample data");
    process.exit();
  } catch (e) {
    console.log(
      "\n👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n"
    );
    console.log(e);
    process.exit();
  }
}
if (process.argv.includes("--delete")) {
  deleteData();
} else {
  loadData();
}
