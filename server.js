const { mongopath, getAsyncRedis } = require('./helpers/helper')
const express = require('express')
const app = express()
const i18n = require('i18n')

const path = require('path')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const session = require('express-session')
const passport = require('passport')
const MongoStore = require('connect-mongo')(session)
// const promisify = require('es6-promisify');
const { promisify } = require('util')
const Course = require('./models/course')
const Page = require('./models/page')
const Menulocation = require('./models/menulocation')
const Location = require('./models/location')
const Language = require('./models/language')
const Setting = require('./models/setting')
const { languages } = require('./seeddata')
const flash = require('connect-flash')
const cron = require('node-cron')
const EventsController = require('./controllers/admin/AdminEventsController') // const JobsController = require("./controllers/admin/AdminJobsController");
const EmployeesController = require('./controllers/admin/AdminEmployeesController')
const mongoose = require('mongoose')
const { getAvailableTranslations } = require('./controllers/AbstractController')
const compression = require('compression')
const { updateLocaleFile } = require('./helpers/helper')

// connect to redis server and get an extended client with promisified
// methods getAsync() and setAsync()
let redisClient = null;

(async () => {
  const en = Language.findOne({ title: 'en' })
  const de = Language.findOne({ title: 'de' })
  let createLocalesFile = updateLocaleFile();
  const res = await Promise.all([en, de, createLocalesFile])
  if (!res[0]) {
    console.log('no english language created. Seeding EN lang into mongoose')
    await Language.create(languages[0])
  }
  if (!res[1]) {
    console.log('no german language created. Seeding DE lang into mongoose')
    await Language.create(languages[1])
  }

  if (Object.keys(await Course.collection.getIndexes()).includes('order_1')) {
    await Course.collection.dropIndex('order_1')
  }
})()

if (process.env.HUBSPOT_API_KEY !== undefined) {
  console.error('HUBSPOT_API_KEY is not defined in .env')
  process.exit()
}
if (process.env.USE_REDIS !== undefined && process.env.USE_REDIS === 'true') {
  console.log('Redis enabled')
  redisClient = getAsyncRedis()
} else if (process.env.USE_REDIS === 'false') {
  console.log('Redis disabled')
} else {
  console.error('USE_REDIS is not defined in .env')
  process.exit()
}

mongoose.set('useCreateIndex', true)
try {
  mongoose.connect(mongopath, { useNewUrlParser: true, useUnifiedTopology: true }).then(res => {
  })
} catch (err) {
  console.log(`Please set a mongo path in your .env \n\n${err}`)
}

app.use(compression())

i18n.configure({
  objectNotation: true,
  locales: ['en', 'de'],
  queryParameter: 'lang',
  autoReload: true,
  directory: __dirname + '/locales'
})

app.use(i18n.init)
app.use((req, res, next) => {
  // console.log('i18n lan ==> ',i18n.locale)
  res.setLocale(req.params.locale || '');
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'notaverysecuresecret',
    key: process.env.SESSION_KEY || 'notaverysecurekey',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
)
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

app.use(express.static('public'))
app.use('/assets', express.static(path.join(__dirname, 'node_modules/')))
app.use('/assets', express.static(path.join(__dirname, 'assets/css/')))
app.use('/assets', express.static(path.join(__dirname, 'assets/icons/')))
app.use('/fonts', express.static(path.join(__dirname, 'assets/fonts/')))
app.use('/media', express.static(path.join(__dirname, 'assets/media/')))
app.use('/images', express.static(path.join(__dirname, 'uploads/images')))


app.use(flash())

app.use(function (req, res, next) {
  (res.locals.messages = {
    danger: req.flash('danger'),
    warning: req.flash('warning'),
    success: req.flash('success')
  }),
    (app.locals.pathclass = req.url
      .replace(/^\/de/g, '')
      .replace(/^\/en/g, '')
      .replace(/^\//g, '')
      .replace(/\//g, '-')
      .replace(/\-$/g, '')
      .toLowerCase())
  let match = req.url.match('[^/]+(?=/$|$)')
  res.locals.title = 'DigitalCareerInstitute'
  app.locals.moment = require('moment')
  res.locals.live = req.headers.host.includes('digitalcareerinstitute.org')
  if (match) {
    match = match[0].replace(/\//g, ' ')
    res.locals.title =
      match.charAt(0).toUpperCase() + match.slice(1) + ' | ' + res.locals.title
  }
  console.log(req.method, req.headers.host + req.url)
  next()
})
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

app.use(passport.initialize())
app.use(passport.session())

app.use(async (req, res, next) => {
  let navData = null
  if (req.originalUrl.startsWith('/images') || req.headers['content-type'] === 'application/json') {
    next()
    return
  }
  if (process.env.USE_REDIS === 'true') {
    try {
      const getNavData = await redisClient.getAsync(`navData${req.session.locale}`)
      navData = JSON.parse(getNavData)
    } catch (error) {
      console.error('Redis ERROR: Could not get navigation data: ' + error)
    }
  }
  if (navData === null) {
    const query = await getAvailableTranslations(req, res)
    const courses = await Course
      .find(query)
      .sort({ order: 1 })
      .exec()
    const footerCat = await Menulocation.findOne({ name: 'footer' })
    const headerCat = await Menulocation.findOne({ name: 'header' })

    const [locations, settings, footerPages, headerPages] = await Promise.all([
      Location.find({}).exec(),
      Setting.findOne().populate({ path: 'calltoaction', populate: { path: 'languageVersion', model: 'Page' } }).exec({}),
      Page.find(Object.assign(query, { menulocations: { $in: [footerCat] } })).sort({ order: 1 }),
      Page.find(Object.assign(query, { menulocations: { $in: [headerCat] } })).sort({ order: 1 })
    ])
    if (!!req.session.locale && !!settings.calltoaction) {
      settings.calltoaction = settings.calltoaction.languageVersion
    }
    navData = {
      courses,
      locations,
      settings,
      headerPages,
      footerPages
    }

    try {
      if (process.env.USE_REDIS === 'true') {
        await redisClient.setAsync(`navData${req.session.locale}`, JSON.stringify(navData))
      }
    } catch (error) {
      console.error('Redis ERROR: Could not save navigation data: ' + error)
    }
  } else {
    console.log('using cached data')
  }

  const { courses, settings, locations, headerPages, footerPages } = navData

  res.locals.user = req.user || null
  const rawPath = req.path.replace(`${req.session.locale}/`, '')
  res.locals.currentPath = rawPath
  res.locals.locations = locations
  res.locals.courses = courses
  res.locals.settings = settings
  res.locals.headerPages = headerPages
  res.locals.footerPages = footerPages
  next()
})
app.use((req, res, next) => {
  req.login = promisify(req.login, req)
  next()
})
app.use((req, res, next) => {
  var start = new Date()
  if (res._responseTime) return next()
  res._responseTime = true
  res.on('header', function () {
    var duration = new Date() - start
    res.setHeader('X-Response-Time', duration + 'ms')
  })
  req.login = promisify(req.login, req)
  next()
})

const i18nRoutes = require('./routes/i18n')
const indexRoutes = require('./routes/index')
const usersRoutes = require('./routes/users')
const storiesRoutes = require('./routes/stories')
const pagesRoutes = require('./routes/pages')
// let jobsRoutes = require("./routes/jobs");
const employeesRoutes = require('./routes/employees')
const eventsRoutes = require('./routes/events')
const coursesRoutes = require('./routes/courses')
const redirects = require('./routes/redirects')

const menulocationAdminRoutes = require('./routes/admin/menulocations')
const storiesAdminRoutes = require('./routes/admin/stories')
const coursesAdminRoutes = require('./routes/admin/courses')
const pagesAdminRoutes = require('./routes/admin/pages')
const partnersAdminRoutes = require('./routes/admin/partners')
// let jobsAdminRoutes = require("./routes/admin/jobs");
const employeesAdminRoutes = require('./routes/admin/employees')
const locationsAdminRoutes = require('./routes/admin/locations')
const eventsAdminRoutes = require('./routes/admin/events')
const contactsAdminRoutes = require('./routes/admin/contacts')
const usersAdminRoutes = require('./routes/admin/users')
const settingsAdminRoutes = require('./routes/admin/settings')

app.use(i18nRoutes)
app.use('/', indexRoutes)
app.use('/users', usersRoutes)
app.use('/stories', storiesRoutes)
app.use('/pages', pagesRoutes)
// app.use("/jobs", jobsRoutes);
app.use('/about-us', employeesRoutes)
app.use('/events', eventsRoutes)
app.use('/courses', coursesRoutes)
app.use('/admin/stories', storiesAdminRoutes)
app.use('/admin/courses', coursesAdminRoutes)
app.use('/admin/pages', pagesAdminRoutes)
// app.use("/admin/jobs", jobsAdminRoutes);
app.use('/admin/partners', partnersAdminRoutes)
app.use('/admin/employees', employeesAdminRoutes)
app.use('/admin/locations', locationsAdminRoutes)
app.use('/admin/events', eventsAdminRoutes)
app.use('/admin/menulocations', menulocationAdminRoutes)
app.use('/admin/contacts', contactsAdminRoutes)
app.use('/admin/settings', settingsAdminRoutes)

app.use('/admin/users', usersAdminRoutes)

app.use('/admin*', contactsAdminRoutes)
app.use(redirects)
// app.get('*', function (req, res) {
//   res.redirect('/')
// })

app.set('views', path.join(__dirname, 'views/'))
app.set('view engine', 'pug')

async function worker() {
  try {
    // const jobsResponse = await JobsController.fetchJobs();
    // console.log(jobsResponse)
    const response = await EventsController.fetchevents()

    console.log('👍 Done! Successfully Fetching data\n')
  } catch (e) {
    console.log('👎 Error! The Error info is below !!!\n')
    console.log(e)
    process.exit()
  }
}

// scheduling cron job:
if (process.env.CRONINTERVAL) {
  console.log(`Cron scheduled for ${process.env.CRONINTERVAL}`)
  cron.schedule(
    process.env.CRONINTERVAL,
    () => {
      console.log(`${new Date()} Started Cronjobs`)
      worker()
    },
    {
      scheduled: true,
      timezone: 'Europe/Berlin'
    }
  )
} else {
  console.log('No cron interval set in the .env. No cron started.')
}

worker()
module.exports = app
