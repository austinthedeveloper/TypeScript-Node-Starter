

import * as express from "express";
const app = express();
import { BeerController } from "../controllers/beer";
import { BreweryController } from "../controllers/brewery";
const beerController = new BeerController();
const breweryController = new BreweryController();

const beerPath = "/api/beer/";
app.post(`${beerPath}save`, beerController.saveBeer)
  .post(`${beerPath}delete`, beerController.deleteBeer)
  .get(`${beerPath}:id`, beerController.savedBeers)
  .get(`${beerPath}:id/details`, beerController.getBeerDetails);

const breweryPath = "/api/brewery/";
app.get(`${breweryPath}search`, breweryController.findBrewery)
  .get(`${breweryPath}:id`, breweryController.getBrewery)
  .get(`${breweryPath}:id/beers`, breweryController.getBreweryBeers);

app.route(`${beerPath}crud/:id/edit`)
  // Get single
  .get(beerController.show)
  // Update
  .put(beerController.update)
  // Remove
  .delete(beerController.remove);
