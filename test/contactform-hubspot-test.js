require("dotenv").config({ path: __dirname + "/../.env" });
const Location = require("../models/location");
const request = require("request");
const puppeteer = require('puppeteer');
const email = "testuser@digitalcareerinstitute.org";
const assert = require('assert');
const supertest = require("supertest");
const { url } = require("../helpers/helper.js");
const mongoose = require("mongoose");

const server = require("../server");
(async () => {
    let hubspotContactID
    describe('Contactform and hubspot contact existence', function () {
        before(function (done) {
            mongoose.connection.on("error", console.error.bind(console, "connection error"));
            mongoose.connection.once("open", function () {
                console.log("We are connected to test database!");
                new Location({
                    name: "Berlin",
                    street: "Vulkanstrasse 1",
                    zip: "10243"
                });
                done();
            });
        });
        it('Fills the contact form and submits it', async function () {
            const browser = await puppeteer.launch({
                defaultViewport: null,
            });
            const serverInstance = supertest(server).get("/")
            const page = await browser.newPage();
            await page.goto(serverInstance.url, { waitUntil: 'networkidle2' });
            const name = await page.$eval('.mainHome h1.display-1', el => el.innerText)
            await page.$eval('.contactlinktext', e => e.click());
            await page.type('#name', 'Testuser');
            await page.type('#email', email)
            await page.type('#body', 'Testmessage')
            await page.type('#phone', '0987654321')
            const secondLocation = await page.$eval('#contactFormModal select#location option:nth-child(2)', el => el.value)
            await page.select('#location', secondLocation)
            await page.select('#jobcenter', '1')
            let checkboxStatus = await page.$eval('input[name="TermsofService"]', input => { return input.checked })
            await page.$eval('input[name="TermsofService"]', check => check.checked = true);
            checkboxStatus = await page.$eval('input[name="TermsofService"]', input => { return input.checked })
            await page.$eval('#contactFormModal button[type="submit"]', e => e.click());
            await page.waitForSelector('.flash')
            const responseMsg = await page.$eval('.flash', el => el.innerText)
            assert.equal(responseMsg.includes('Thanks for your message'), true)
            await browser.close()
        })
        it('Checks if Hubspot contains the new contact and the jobcenter field', async function () {
            var options = {
                method: 'GET',
                url: `https://api.hubapi.com/contacts/v1/contact/email/${email}/profile`,
                qs: { hapikey: process.env.HUBSPOT_API_KEY }
            }
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                assert.equal(JSON.parse(body).properties.afa_jc_registered_.value, 'Yes')
                assert.equal(JSON.parse(body).properties.phone.value, '0987654321')
                assert.equal(JSON.parse(body).properties.firstname.value, 'Testuser')
                hubspotContactID = JSON.parse(body).vid
                var options = {
                    method: 'DELETE',
                    url: `https://api.hubapi.com/contacts/v1/contact/vid/${hubspotContactID}`,
                    qs: { hapikey: process.env.HUBSPOT_API_KEY }
                }
                request(options, function (errorDelete, responseDelete, bodyDelete) {
                    if (errorDelete) throw new Error(errorDelete);
                    assert.equal(JSON.parse(bodyDelete).vid, hubspotContactID)
                });
            });
        });
    });
})();