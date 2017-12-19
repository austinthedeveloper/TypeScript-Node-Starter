/**
 * Module dependencies.
 */
import * as express from "express";
import * as compression from "compression";  // compresses requests
import * as session from "express-session";
import * as expressValidator from "express-validator";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as errorHandler from "errorhandler";
import * as lusca from "lusca";
import * as dotenv from "dotenv";
import * as mongo from "connect-mongo";
import * as flash from "express-flash";
import * as path from "path";
import * as mongoose from "mongoose";
import * as passport from "passport";
import * as cors from "cors";

const MongoStore = mongo(session);

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env.example" });


/**
 * Controllers (route handlers).
 */
import * as homeController from "./controllers/home";
import * as userController from "./controllers/user";
import * as userApiController from "./controllers/user.api";
import { ApiController } from "./controllers/api";
import { ContactController } from "./controllers/contact";
import { RetroController } from "./controllers/retro";
import { BeerController } from "./controllers/beer";
import { BreweryController } from "./controllers/brewery";
const contactController = new ContactController();
const apiController = new ApiController();
const retroController = new RetroController();
const beerController = new BeerController();
const breweryController = new BreweryController();

/**
 * API keys and Passport configuration.
 */
import * as passportConfig from "./config/passport";

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
// mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI, {
  useMongoClient: true
});
mongoose.connection.on("error", () => {
  console.log("MongoDB connection error. Please make sure MongoDB is running.");
  process.exit();
});

/**
 * Express configuration.
 */
app.set("port", process.env.PORT || 8080);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(logger("dev"));
app.use(cors({
  origin: ["http://localhost:4200", "https://beer-wall.herokuapp.com/"],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== "/login" &&
    req.path !== "/signup" &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
    req.path == "/account") {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get("/", homeController.index);
app.get("/login", userController.getLogin);
app.post("/login", userController.postLogin);
app.get("/logout", userController.logout);
app.get("/forgot", userController.getForgot);
app.post("/forgot", userController.postForgot);
app.get("/reset/:token", userController.getReset);
app.post("/reset/:token", userController.postReset);
app.get("/signup", userController.getSignup);
app.post("/signup", userController.postSignup);
app.get("/contact", contactController.getContact);
app.post("/contact", contactController.postContact);
app.get("/account", passportConfig.isAuthenticated, userController.getAccount);
app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post("/account/delete", passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get("/account/unlink/:provider", passportConfig.isAuthenticated, userController.getOauthUnlink);

/**
 * API User routes
 */
app.post("/api/login", userApiController.postLogin);
app.get("/api/logout", userApiController.logout);
app.post("/api/forgot", userApiController.postForgot);
app.get("/api/reset/:token", userApiController.getReset);
app.post("/api/reset/:token", userApiController.postReset);
app.post("/api/signup", userApiController.postSignup);
app.get("/api/contact", contactController.getContact);
app.post("/api/contact", contactController.postContact);
app.post("/api/account/profile", passportConfig.isAuthenticatedApi, userApiController.postUpdateProfile);
app.post("/api/account/password", passportConfig.isAuthenticatedApi, userApiController.postUpdatePassword);
app.post("/api/account/delete", passportConfig.isAuthenticatedApi, userApiController.postDeleteAccount);
app.get("/api/account/unlink/:provider", passportConfig.isAuthenticatedApi, userApiController.getOauthUnlink);
app.get("/api/users", passportConfig.isAuthenticatedApi, userApiController.list);
app.route("/api/user/:id")
  .get(passportConfig.isAuthenticatedApi, userApiController.show)
  .delete(passportConfig.isAuthenticatedApi, userApiController.remove);

/**
 * API examples routes.
 */
app.get("/api", apiController.getApi);
app.get("/api/facebook", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);

const retroPath = "/api/retro/";
app.get(`${retroPath}users`, retroController.getUsers)
  .get(`${retroPath}user/:user`, retroController.getUser)
  .get(`${retroPath}user/:user/summary`, retroController.getUserSummary)
  .get(`${retroPath}user/:user/feed`, retroController.getUserFeed)
  .get(`${retroPath}user/:user/recent`, retroController.getUserRecent)
  .get(`${retroPath}user/:user/game/:game`, retroController.getUserProgress)
  .get(`${retroPath}game/:game`, retroController.getGame)
  .get(`${retroPath}game/:game/extended`, retroController.getGameExt)
  .get(`${retroPath}console-ids`, retroController.getConsoles);

const beerPath = "/api/beer/";
app.post(`${beerPath}save`, passportConfig.isAuthenticated, beerController.saveBeer)
  .post(`${beerPath}delete`, passportConfig.isAuthenticated, beerController.deleteBeer)
  .get(`${beerPath}:id`, beerController.savedBeers)
  .get(`${beerPath}:id/details`, beerController.getBeerDetails);

const breweryPath = "/api/brewery/";
app.get(`${breweryPath}search`, breweryController.findBrewery)
  .get(`${breweryPath}:id`, breweryController.getBrewery)
  .get(`${breweryPath}`, breweryController.getBreweries)
  .get(`${breweryPath}:id/beers`, breweryController.getBreweryBeers);

app.route(`${beerPath}crud/:id/edit`)
  // Get single
  .get(beerController.show)
  // Update
  .put(beerController.update)
  // Remove
  .delete(beerController.remove);


// Company
const companyPath = "/api/company/";
import { CompanyController } from "./controllers/company";
const companyController = new CompanyController();

app.route(`${companyPath}`)
  // Get full list
  .get(companyController.list)
  // Create item
  .post(companyController.create);
app.route(`${companyPath}:id`)
  // Get single
  .get(companyController.show)
  // Update
  .put(companyController.update)
  // Remove
  .delete(companyController.remove);
app.route(`${companyPath}:id/users`)
  .get(userApiController.getUsers);


// CRUD Template
const crudPath = "/api/crud-template/";
import { CrudController } from "./controllers/crud-template";
const crudController = new CrudController();
/*
 * GET
 */
app.route(`${crudPath}`)
  // Get full list
  .get(crudController.list)
  // Create item
  .post(crudController.create);
app.route(`${crudPath}:id`)
  // Get single
  .get(crudController.show)
  // Update
  .put(crudController.update)
  // Remove
  .delete(crudController.remove);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email", "public_profile"] }));
app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
  res.redirect(req.session.returnTo || "/");
});


/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get("port"), () => {
  console.log(("  App is running at http://localhost:%d in %s mode"), app.get("port"), app.get("env"));
  console.log("  Press CTRL-C to stop\n");
});

module.exports = app;
