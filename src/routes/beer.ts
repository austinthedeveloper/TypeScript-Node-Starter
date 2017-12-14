

import * as express from "express";
const app = express();
import { BeerController } from "../controllers/beer";
const beerController = new BeerController();

const beerPath = "/api/beer/";
app.get(`${beerPath}brewery/search`, beerController.findBrewery);
app.get(`${beerPath}brewery/:id`, beerController.getBrewery);
app.get(`${beerPath}brewery/:id/beers`, beerController.getBreweryBeers);
app.post(`${beerPath}beers/save`, beerController.saveBeer);
app.post(`${beerPath}beers/delete`, beerController.deleteBeer);
app.get(`${beerPath}beers/:id`, beerController.savedBeers);
app.get(`${beerPath}beers/:id/details`, beerController.getBeerDetails);
