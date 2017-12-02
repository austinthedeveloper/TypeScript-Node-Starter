import { BeerService } from "./../services/beerService";
import { RetroService } from "./../services/retroService";
import { Request, Response } from "express";
import * as request from "request-promise";
const beerService = new BeerService();

export class BeerController {

    constructor() { }

  getBrewery(req: Request, res: Response) {
    const options = beerService.options(`brewery/${req.params.brewery}`);
    request(options)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  }

  getBreweryBeers(req: Request, res: Response) {
    const options = beerService.options(`brewery/${req.params.brewery}/beers`);
    request(options)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  }



}
