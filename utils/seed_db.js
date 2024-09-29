const Job = require("../models/Job");
const User = require("../models/User");
const faker = require("@faker-js/faker").fakerEN_US;
const FactoryBot = require("factory-bot");
require("dotenv").config();

const testUserPassword = faker.internet.password();
const factory = FactoryBot.factory;
const factoryAdapter = new FactoryBot.MongooseAdepter();
factory.setAdapter = new FactoryBot.MongooseAdepter();
factory.setAdapter(factoryAdapter);
factory.define("job", Job, {
    company: () => faker.company.name(),
    position: () => faker.person.jobTitle(),
    status: () => 
    ["interview", "declined", "pending"][Math.floor(3 * Math.random())],
});
factory.define("user", User, {
    name: () => faker.person.fullName(),
    email: () => faker.internet.email(),
    password: () => faker.internet.password(),
});

const seed_db = async () => {
    let testUser = null;
    try {
        const mongoURL = process.env.MONGO_URI_TEST;
        await Job.deleteMany({});
        await User.deleteMany({});
        testUser = await factory.create("user", { password: testUserPassword });
        await factory.createMany("job", 20, { createBy: testUser._id });
    } catch (e) {
        console.log("database error");
        console.log(e.message);
        throw e;
    }
    return testUser;
};

module.exports = { testUserPassword, factory, seed_db };