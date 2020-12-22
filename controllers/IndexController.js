const Story = require('../models/story')
const Contact = require('../models/contact')
const Course = require('../models/course')
// const Event = require('../models/event')
const Location = require('../models/location')
const Partner = require('../models/partner')
const Employee = require('../models/employee')
const Setting = require('../models/setting')
const request = require('request')
const {sendMail, getAsyncRedis} = require('../helpers/helper')
const {getAvailableTranslations} = require('./AbstractController')
const fetchEventsByLocation = require("../helpers/fetch_events_by_location");
let redisClient = null;

module.exports.landingpage = async (req, res) => {

  let indexData = null
  try {
    if (process.env.USE_REDIS !== undefined && process.env.USE_REDIS === 'true') {
      // console.log('Redis enabled')
      redisClient = getAsyncRedis()
    } else if (process.env.USE_REDIS === 'false') {
      // console.log('Redis disabled')
    } else {
      console.error('USE_REDIS is not defined in .env')
      process.exit()
    }
    if (process.env.USE_REDIS === 'true') {
      try {
        const getNavData = await redisClient.getAsync(`indexData${req.session.locale}`)
        indexData = JSON.parse(getNavData)

      } catch (error) {
        console.error('Redis ERROR: Could not get IndexController data: ' + error)
      }
    }
    if (indexData === null) {
      let query = await getAvailableTranslations(req, res)

      const stories = Story
        .find({...query})
        .sort('order')
        .exec({})
      const contact_userRes = Employee
        .findOne({...query, contact_user: true})
        .exec()
      const locations = Location.find({})
        .sort({ order: 1 })
        .exec() 
      const partners = Partner.find({})
        .sort('order')
        .exec({})
      const courses = Course
        .find(query)
        .sort({order: 1})
        .exec()
      indexData = await Promise.all([stories, locations, partners, courses, contact_userRes])
      const events = await fetchEventsByLocation(true, res.locals.settings.landingpage_number_events);
      indexData.push(events)
      if (process.env.USE_REDIS === 'true') {
        try {
          await redisClient.setAsync(`indexData${req.session.locale}`, JSON.stringify(indexData))
        } catch (error) {
          console.error('Redis ERROR: Could not save IndexController data: ' + error)
        }
      }
    }
    const [storiesRes, locationsRes, partnersRes, coursesRes, contact_user, events] = indexData;

    res.render('index', {
      events,
      stories: storiesRes,
      partners: partnersRes,
      locations: locationsRes,
      contact_user,
      courses: coursesRes
    })
  } catch (err) {
    console.log(err)
  }
}
module.exports.contactLocations = async (req, res) => {
  const locations = await Location.find({}).sort({ order: 1 })
  const contact = req.body
  res.render('contactLocations', {
    locations,
    contact
  })
};
module.exports.contact = async (req, res, next) => {
  try {
    const { name, age, email, body, phone, locations, companytour, TermsofService, jobcenter } = req.body
    if (age) {
      console.log('Bot stepped into honeypot!')
      req.flash(
        'success',
        res.__(`Thanks for your message`)
      )
      res.redirect(req.headers.referer)
      next()
      return;
    }
    if (!email || !name || !body || !phone || !TermsofService) {
      req.flash('danger', 'Please fill out all form fields')
      res.redirect(req.headers.referer)
      next()
      return;
    }
    const contact = new Contact()
    contact.name = name
    contact.email = email
    contact.phone = phone.replace(/[a-z]/g, '')
    contact.track = req.headers.referer
    contact.body = body
    contact.jobcenter = !!jobcenter
    if (req.session.utmParams) {
      contact.utm_params = req.session.utmParams
    }
    contact.createdAt = new Date()
    contact.isCompany = companytour
    contact.locations = locations
    if (!contact.email) {
      res.redirect(req.headers.referer)
    }
    const location = await Location.findById(locations)
    const mailTemplate = `Contact from: <table>
    <tr>
      <td>Message send from: </td>
      <a href=${req.headers.referer}>${req.headers.referer}</a>
   </tr>
    <tr>
      <td>Name: </td>
      <td>${name}</td>
    </tr>
    <tr>
      <td>Phone: </td>
      <td>${phone}</td>
    </tr>
    <tr>
      <td>Email: </td>
      <td>${email}</td>
    </tr>
    ${!companytour && `<tr>
      <td>Is registered at Jobcenter:</td>
      <td>${!!jobcenter}</td>
    </tr>`}
    <tr>
      <td>Content: </td>
      <td>${body}</td>
    </tr>
    ${locations && `<tr> <td>Locations: </td> <td>${location.name}</td> </tr>`}
    </table>
  ` 
  const settings = await Setting.findOne()
  
    const mailOptions = {
      from: 'contact@digitalcareerinstitute.org',
      to: companytour
        ? settings.tourmailreceiver
        : settings.mailreceiver,
      subject: companytour
        ? 'Company Tour request from website'
        : 'Message on website',
      text: mailTemplate,
      html: mailTemplate
    }
    await contact.save()
    let hubspotPromise = new Promise(() => { })

    let remainingUtmParams = req.session.utmParams ? { ...req.session.utmParams } : []
    Object.keys(remainingUtmParams).map(q => q.startsWith('utm_') && delete remainingUtmParams[q])

    if (!!process.env.HUBSPOT_API_KEY) {
      var options = {
        method: 'POST',
        url: `https://api.hubapi.com/contacts/v1/contact/createOrUpdate/email/${email}`,
        qs: { hapikey: process.env.HUBSPOT_API_KEY },
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          properties:
            [
              { property: 'firstname', value: name.split(' ')[0] },
              { property: 'lastname', value: name.split(' ').slice(1).join(' ') },
              { property: 'email', value: email },
              { property: 'phone', value: phone },
              { property: 'utm_source', value: req.session.utmParams ? JSON.stringify(req.session.utmParams.utm_source) : "" },
              { property: 'utm_medium', value: req.session.utmParams ? JSON.stringify(req.session.utmParams.utm_medium) : "" },
              { property: 'utm_campaign', value: req.session.utmParams ? JSON.stringify(req.session.utmParams.utm_campaign) : "" },
              { property: 'utm_content', value: req.session.utmParams ? JSON.stringify(req.session.utmParams.utm_content) : "" },
              { property: 'utm_term', value: req.session.utmParams ? JSON.stringify(req.session.utmParams.utm_term) : "" },
              { property: 'afa_jc_registered_', value: !jobcenter ? "No" : "Yes" },
              {
                property: 'form_payload',
                value: JSON.stringify({
                  'track': req.headers.referer,
                  'locations': location,
                  'body': body,
                  'is_company': companytour,
                  'utm_params': remainingUtmParams 
                })
              }
            ],
        },
        json: true
      };
      hubspotPromise = request(options)
    }
    // to save time, mail get send out without waiting for the response
    const info = sendMail(res, req, mailOptions)
    const resolved = await Promise.all([hubspotPromise])

    if (req.headers['content-type'] === 'application/json') {
      const response = {
        message: res.__(`Thanks for your message`)
      }
      return res.json({
        response
      })
    } else {
      req.flash(
        'success',
        res.__(`Thanks for your message`)
      );
      res.redirect(req.headers.referer)
    }
    delete req.session.utmParams
    next()
  } catch (e) {
    console.error(`Error in /controllers/IndexController.js`)
    console.error(e)

    req.flash('danger', e.message);
    res.redirect(req.headers.referer)
  }
}
module.exports.tour = async (req, res) => {
  try {
    const query = await getAvailableTranslations(req, res)
    const partners = await Partner.find(query)
    .sort("-createdAt")
    .exec();
    res.locals.title = 'Become our Hiring Partner | DigitalCareerInstitute'
    res.render('tour', { companytour: true, partners })
  } catch (err) {
    console.log(err)
  }
}
module.exports.newsletter = (req, res) => {
  const {email} = req.body

  // Make sure fields are filled
  if (!email) {
    return res.status(422).json({
      code: 422,
      message: 'No valid email address given!'
    })
  }

  // Construct req data
  const data = {
    members: [
      {
        email_address: email,
        status: 'pending'
        // merge_fields: {}
      }
    ]
  }

  try {
    const postData = JSON.stringify(data)

    const options = {
      url: process.env.URL,
      method: 'POST',
      headers: {
        Authorization: process.env.AUTHORIZATION
      },
      body: postData
    }

    request(options, (err, response) => {
      if (err) {
        return res.json({
          code: response.statusCode,
          message: err.message
        })
      } else {
        const json = JSON.parse(response.body)
        if (response.statusCode === 200 && json.errors.length === 0) {
          return res.status(200).json({
            code: 200,
            message: 'Successfully subscribed to the newsletter!'
          })
        } else {
          return res.status(422).json({
            code: json.errors ? 422 : response.statusCode,
            message: json.errors
          })
        }
      }
    })
  } catch (err) {
    console.log(
      `A error occured in the newsletter subscription route \n\n ${err}`
    )
  }
}
module.exports.downloadCourseCurriculum = async (req, res, next) => {
  try {
    const { email, age, TermsofService } = req.body
    if (age) {
      console.log('Bot stepped into honeypot!')
      req.flash(
        'success',
        res.__(`Thanks for your message`)
      )
      res.redirect(req.headers.referer)
      next()
      return;
    }
    if (!email) {
      req.flash('danger', 'Please fill in your email')
      res.redirect(req.headers.referer)
      next()
      return;
    }
    if (!TermsofService) {
      req.flash('danger', 'Please accept the terms of service')
      res.redirect(req.headers.referer)
      next()
      return;
    }
    const course = await Course
      .findOne({ slug: req.headers.referer.match(/\/([^/]*)$/)[1] })
      .exec()
    const contact = new Contact()
    contact.email = email
    contact.track = req.headers.referer
    if (req.session.utmParams) {
      contact.utm_params = req.session.utmParams
    }
    contact.createdAt = new Date()
    const settings = await Setting.findOne()
    await contact.save()
    let hubspotPromise = new Promise(() => { })

    let remainingUtmParams = req.session.utmParams ? { ...req.session.utmParams } : []
    Object.keys(remainingUtmParams).map(q => q.startsWith('utm_') && delete remainingUtmParams[q])
    if (!!process.env.HUBSPOT_API_KEY) {
      var options = {
        method: 'POST',
        url: `https://api.hubapi.com/contacts/v1/contact/createOrUpdate/email/${email}`,
        qs: { hapikey: process.env.HUBSPOT_API_KEY },
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          properties:
            [
              { property: 'email', value: email },
              { property: 'utm_source', value: req.session.utmParams ? JSON.stringify(req.session.utmParams.utm_source) : "" },
              { property: 'utm_medium', value: req.session.utmParams ? JSON.stringify(req.session.utmParams.utm_medium) : "" },
              { property: 'utm_campaign', value: req.session.utmParams ? JSON.stringify(req.session.utmParams.utm_campaign) : "" },
              { property: 'utm_content', value: req.session.utmParams ? JSON.stringify(req.session.utmParams.utm_content) : "" },
              { property: 'utm_term', value: req.session.utmParams ? JSON.stringify(req.session.utmParams.utm_term) : "" },
              {
                property: 'form_payload',
                value: JSON.stringify({
                  'track': req.headers.referer,
                  'utm_params': remainingUtmParams
                })
              }
            ],
        },
        json: true
      };
      hubspotPromise = request(options)
    }
    const resolved = await Promise.all([hubspotPromise])

    if (req.headers['content-type'] === 'application/json') {
      const response = {
        message: res.__(`Thanks for your message`),
        filepath: course.curriculumPdf
      }
      return res.json({
        response
      })
    } else {
      req.flash(
        'success',
        res.__(`Thanks for your message`)
      );
      res.redirect(req.headers.referer)
    }
    delete req.session.utmParams
    next()
  } catch (e) {
    console.error(`Error in /controllers/IndexController.js`)
    console.error(e)
    req.flash('danger', e.message);
    res.redirect(req.headers.referer)
  }
}