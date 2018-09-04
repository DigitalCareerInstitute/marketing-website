'use strict';
const Post = require('../models/post');
const Contact = require('../models/contact');

const express = require('express')
const router = express.Router()

const nodemailer = require('nodemailer');

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({}).sort('order').exec({});
    res.render('index', {
      posts: posts
    })
  }
  catch(err) {
    console.log(err);
  }
});

router.post('/contact', async (req, res) => {
  var contact = new Contact(); // create a new instance of the contact model

  contact.name = req.body.name
  contact.email = req.body.email
  contact.body = req.body.body
  contact.createdAt = new Date()

  if (!contact.email){
    res.redirect(res.locals.domain+"?alert=error")
  }

  var contact = await contact.save()

  let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PW
      }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: contact.name, 
    to: 'tfkuhnert@gmail.com', 
    subject: `Message from ${contact.name}`, 
    text: `${contact.body}`,
    html: `${contact.body}`, 
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
        res.redirect(res.locals.domain+"?alert=error")
      }
      console.log('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      res.redirect(res.locals.domain+"?alert=success")
  });
});
module.exports = router