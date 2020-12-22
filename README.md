# DCI marketing website

[![Build Status](https://travis-ci.org/DigitalCareerInstitute/marketing-website.svg?branch=master)](https://travis-ci.org/DigitalCareerInstitute/marketing-website)

![Screenshot](screenshot.png)

### Architecture:

NodeJs/Express/Passport/Pug/Redis, React in the backend

[Live version](https://digitalcareerinstitute.org)  

## Installation:
1. Install `NodeJS/npm`
1. Install `MongoDB`
1. Install caching `Redis`. [Install info](https://redis.io/download#installation)
1. copy the `.env.example` to `.env` and fill in the neccessary secret keys (you get them from an admin): ``
1. It can happend that it complains about a missing global `webpack` and `webpack-cli`. Just install them global: `npm i webpack webpack-cli -g`


#### Example .env:
```
PORT=3000
MONGOURL=mongodb://localhost:27017/marketing-website
DOMAIN=localhost
EVENTBRIDE_API_KEY=XXXXXXXXXXXXXXXXXXXX
MAILHOST=XXXXXX.XXXXXXXXXX.com
MAILUSER=XXXXXXXXXXXX
MAILPW=XXXXXXXXXXXXXX
MAILPORT=587
MAILRECEIVER=developer@digitalcareerinstitute.org
TOURMAILRECEIVER=developer@digitalcareerinstitute.org
IMAGE_UPLOAD_DIR=uploads/images/
USE_REDIS=true
AUTHORIZATION='auth xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us14'
URL='https://us14.api.mailchimp.com/3.0/lists/xxxxxxxxxx'
CRONINTERVAL="0 0 * * *"
CLIENT_ID="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
CLIENT_SECRET="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
SESSION_KEY=digitalcareerinstitute
SESSION_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
HUBSPOT_API_KEY=XXXXXXXX-00XX-0000-0000-XXXXXXXXXXXX

```

### Run the app

Start normal: `npm start`  
Start development: `npm run dev`

### Insert example data in database

##### Create a few Stories and Menulocations in the selected DB.

Insert example data:  
`npm run seed`

Remove all seeds from database:  
`npm run seed:delete`

### Contribution
- Check out the [Issues](https://github.com/DigitalCareerInstitute/marketing-website/issues) for a `good first issue` and let yourself invite to Trello by [@spielhoelle](mailto:thomas.kuhnert@digitalcareerinstitute.org)
- And read  the [Contribution Guidelines](CONTRIBUTING.md)
- Be nice to each other and follow the [Code of Conduct](https://github.com/digitalcareerinstitute/marketing-website/CODE_OF_CONDUCT.md)


### Run in docker dev environment  
`docker-compose up`

### Deployment
In the private [infrastructure repo](https://github.com/DigitalCareerInstitute/infrastructure) we manage the deployment and the server provision per [Ansible](https://www.ansible.com/). If you need to deploy, require ssh access to the live environment from an admin.


## Server & database access
Let a admin add your ssh key to the server. Then map the live-mongo db to an alternative local port:

`ssh dci@95.217.184.232  -L 27018:localhost:27017`

Then connect to the live mongo-db from another terminal window:

`mongo --port 27018`

Then you can run normal mongo commands in your local mongo-terminal towards the remote production mongo instance. 

Eg. update a users admin privileges:
```
db.users.findOneAndUpdate({email: "user@digitalcareerinstitute.org}, {$set: {admin: "true", superAdmin: "true"}})
```

## Features

For some actions you need a superadmin account, for some a normal admin role is enought. Contact [@spielhoelle](mailto:thomas.kuhnert@digitalcareerinstitute.org) or [@LeandroDCI](https://github.com/LeandroDCI) for extended access rights.

### Events from eventbrite

Events will be automatically fetched once a night per a automated task. It is possible to  manually delete all of them and refetch in case of urgent update. Go on [/admin/events](https://digitalcareerinstitute.org/admin/events) and use the appropriate interface action for just refetch, or first purge all.
![Events screenshot](/docs/events.png)

### Multilang
Todo

### Usermanagement
Todo

### Partners
Todo

### Employees
Todo

### Pages
> Static-sites are main content deliverers and can serve as landingpages, general information

`Slug`
When creating a page, the slug (url/permalink) derives from the title. Eg. a page with the title *Our students* generates a slug like *our-studets*. The slug is important for SEO, should kept consistent and would confuse google crawler if changed later on.

`Order and page location`
Pagelocation defines where and whether the page should be visible in a menu. Prominent shows the page in the main header-navigation - otherwise its in the *GET INVOLVED* submenu sorted by order. If page location is not set, the page will be created, but not in a menu - so kind of invisible, but reachable per direct link.
*Order* Defines the position of the pages amongst their location (header-page => 1, 2, 3 ... | footer-pages => 1, 2, 3)

`Call to action`
Offers posiibility to show a prominent box on the page frontend. If not set, bos is not visible.

`Translations`
By default all entries are created in a english namespace and are also just visible on the english version in the frontend. If you translate a entry, it creates a clone and links the original with the translated pendant. All fields are individual editable. If you switch in the frontend the language, the adequate version will be displayed.

`Rich-text-editor`
[This page](https://digitalcareerinstitute.org/pages/test) offers a lot of the build in mechanics to make pages more visually attractive. We use [Quill rich text editor](https://quilljs.com/) with some basic features to not overkill the content.

### Stories
Todo
`Slug` see [Pages -> Slug](https://github.com/DigitalCareerInstitute/marketing-website/#pages)

`Translation` see [Pages -> Translation](https://github.com/DigitalCareerInstitute/marketing-website/#pages)

`Excerpt` Preview of the content. Shows up storyslider on the landingpage to prevent overlapping text. Use it for granular summary of the story in case the story content itself has a lyrical, very long or unconnected beginning content

### Locations/Campuses
Todo

### Menu + menulocations
Todo

### Contacts
Todo

### Courses
Todo

### Add an item
Todo

