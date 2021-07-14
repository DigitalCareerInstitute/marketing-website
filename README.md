# DCI marketing website

[![Build Status](https://travis-ci.org/DigitalCareerInstitute/marketing-website.svg?branch=master)](https://travis-ci.org/DigitalCareerInstitute/marketing-website)

![Screenshot](screenshot.png)

### Architecture:

NodeJs/Express/Passport/Pug/Redis, React in the backend

[Live version](https://digitalcareerinstitute.org)  

## Installation:
1. Install `NodeJS/npm`
1. Install `MongoDB` locally or run in a docker container `docker run --name dci-mongo -d mongo:latest`
1. Install `Redis` or run it in a docker container `docker run --name dci-redis -d redis`
1. copy the `.env.example` to `.env` and fill in the neccessary real secret keys what an admin eventually provides you.
1. It can happend that it complains about a missing global `webpack` and `webpack-cli`. Just un\/install them global: `npm i webpack webpack-cli -g`


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

### Databasecontents

#### Use seeds

Insert example data:  
`npm run seed`

Remove all seeds from database:  
`npm run seed:delete`

#### Get a DB dump and restore (replace `DIRNAME` by the folderpath containing the .bson files)

`mongorestore -h localhost:27017 -d marketing-website DIRNAME --drop`

### Backendaccess

To get access to the admin-area, you need to create a user.
Go to [register](http://localhost:3000/users/register) and submit the form. You should then have a database users record which needs to be `verified` and then `activated`. Finally you want to make yourself a `admin` and `superadmin`. Use the following command to accomplish all.

```
db.users.findOneAndUpdate({email: "user@digitalcareerinstitute.org"}, {$set: {admin: "true", superAdmin: "true", verifiedAt: ISODate(), activatedAt: ISODate()}})
```
Then you can login per [login](http://localhost:3000/users/login)


### Contribution
- Check out the [Issues](https://github.com/DigitalCareerInstitute/marketing-website/issues) for a `good first issue` and let yourself invite to Trello by [@spielhoelle](mailto:thomas.kuhnert@digitalcareerinstitute.org)
- And read  the [Contribution Guidelines](CONTRIBUTING.md)
- Be nice to each other and follow the [Code of Conduct](https://github.com/digitalcareerinstitute/marketing-website/CODE_OF_CONDUCT.md)


### Run in docker dev environment  
`docker-compose up`

### Deployment
If you push to the staging-branch, a github action triggers a new release in the [staging environment](https://staging.digitalcareerinstitute.org). 
For more control over the deployment porcess, acquire access to the private [infrastructure repo](https://github.com/DigitalCareerInstitute/infrastructure) and make sure to have ssh-access to the prod/staging env. Here we manage the deployment and the server provision per [Ansible](https://www.ansible.com/). 


## Server & database access
Let a admin add your ssh key to the server. Then map the live-mongo db to an alternative local port:

`ssh dci@95.217.184.232  -L 27018:localhost:27017`

Then connect to the live mongo-db from another terminal window:

`mongo --port 27018`

Then you can run normal mongo commands in your local mongo-terminal towards the remote production mongo instance. 

Eg. update a users admin privileges:
```
db.users.findOneAndUpdate({email: "user@digitalcareerinstitute.org}, {$set: {admin: "true", superAdmin: "true", activatedAt: ISODate()}})
```

## Data-consistency

To keep the database according to the changes to the model over time, you can create migrations to batch over all records. 

Run them for example with `nodemon migration/runner.js MIGRATION_FILE_NAME.js`
## Features

For some actions you need a superadmin account, for some a normal admin role is enough. Contact [@spielhoelle](mailto:thomas.kuhnert@digitalcareerinstitute.org) or [@ majofi](https://github.com/majofi) for extended access rights.

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
Offers posibility to show a prominent box on the page frontend. If not set, bos is not visible.

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

