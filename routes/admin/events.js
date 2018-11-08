const express = require('express')
const router = express.Router()

const EventsController = require('../../controllers/admin/AdminEventsController');

router.get('/', EventsController.getEvents)
router.get('/fetchevents', EventsController.fetchevents);
router.get('/deleteevents', EventsController.deleteevents);
router.get('/:location', EventsController.getEventsByLocation)

module.exports = router
