const express = require("express");
require("express-async-errors");
require("dotenv").config();
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGO_URI;
const passport = require("passport");
const passportInit = require("./passport/passportInit");
const secretWordRouter = require("./routes/secretWord");
const auth = require("./middleware/auth");
const cookieParser = require('cookie-parser');
const csrf = require('host-csrf');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(csrf());
app.use(helmet());
app.use(xss());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

const store = new MongoDBStore({
    uri: url,
    collection: "mySessions",
});
store.on("error", function (error) {
    console.log(error);
});
const sessionParams = {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: { secure: false, sameSite: "strict" },
};

if (app.get("evn") === "production") {
    app.set("trust proxy", 1);
    sessionParams.cookie.secure = true;
}
app.use(session(sessionParams));
app.use(require("connect-flash")());
app.use(require("./middleware/storeLocals"));
app.get("/", (req, res) => {
    res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));
passportInit();
app.use(passport.initialize());
app.use(passport.session());
app.use("/secretWord", auth, secretWordRouter);



app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));

let secretWord = "syzygy";
app.get("/secretWord", (req, res) => {
    if (!req.session.secretWord) {
        req.session.secretWord = "syzygy";
    }
    res.render("secretWord", { secretWord: req.session.secretWord });
    console.log('Cookies: ', req.cookies)
});
app.post("/secretWord", (req, res) => {
    if (req.body.secretWord.toUpperCase()[0] == "P") {
        req.flash("error", "That word won't work!");
        req.flash("error", "You can't use words that start with p.");
    } else {
        req.session.secretWord = req.body.secretWord;
        req.flash("info", "The secret word was changed.");
    }
    res.redirect("/secretWord");
});

app.use((req, res) => {
    res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
    res.status(500).send(err.message);
    console.log(err);
});

const port = process.env.PORT || 5000;

const start = async () => {
    try {
        await require("./db/connect")(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}...`)
        })
    } catch (error) {
        console.log(error);
    }
};

start();