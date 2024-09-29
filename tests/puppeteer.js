const puppeteer = require("puppeteer");
require("../app");
const { seed_db, testUserPassword } = require("../util/seed_db");
const Job = require("../models/Job");

let testUser = null;
let page = null;
let browser = null;

describe("jobs-ejs puppeteer test", function () {
    before(async function () {
        this.timeout(10000);
        browser = await puppeteer.launch();
        page = await browser.newPage();
        await page.goto("Http://localhost:5000");
    });
    after(async function () {
        this.timeout(5000);
        await browser.close();
    });
    describe("got to site", function () {
        it("should have completed a connection", async function () {});
    });
    describe("index page test", function () {
        this.timeout(10000);
        it("finds the index page logon link", async () => {
            this.logonLink = await page.waitForSelector(
                "a ::-p-text(Click this link to logon)",
            );
        });
        it("gets to the logon page", async () => {
            await this.logonLink.click();
            await page.waitForNavigation();
            const email = await page.waitForSelector('input[name="email"]');
        });
    });
    describe("logon page test", function () {
        this.timeout(20000);
        it("resolves all the fields", async () => {
            this.email = await page.waitForSelector('input[name="email"]');
            this.password = await page.waitForSelector('input[name="password"]');
        });
        it("sends the logon", async () => {
            testUser = await seed_db();
            await this.email.type(testUser.email);
            await this.password.type(testUserPassword);
            await this.submit.click();
            await page.waitForNavigation();
            await page.waitForSelector(`p ::-p-text(change the secret)`);
            await page.waitForSelector('a[href="/secretWord"]');
            const copyr = await page.waitForSelector("p ::-p-text(copyright)");
            const copyrText = await copyr.evaluate((el) => el.textContent);
            console.log("copyright text: ", copyrText);
        });
    });
});