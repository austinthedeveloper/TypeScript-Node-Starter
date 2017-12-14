import { BeerService } from "./../services/beerService";
import { Request, Response } from "express";
import * as request from "request-promise";
import { default as Brewery, BreweryModel } from "../models/Brewery";
import { default as BeerDetails, BeerDetailsModel } from "../models/Beer-Details";
const beerService = new BeerService();

export class BreweryController {

    constructor() { }

  findBrewery(req: Request, res: Response) {
    const breweryName = req.query.name;
    const options = beerService.options(`breweries`, { name: breweryName});
    request(options)
      .then((data) => {
        return res.send(data.data);
      })
      .catch((err) => {
        return res.status(500).send({
          message: err
        });
      });
  }

  getBrewery(req: Request, res: Response) {
    const id = req.params.id;
    Brewery.findOne({id: id}, (err, data) => {
      if (err) {
        return res.status(500).send({
          message: `Error`
        });
      } else if (!data) {
        const options = beerService.options(`brewery/${id}`);
        request(options)
        .then((data) => {
          const brewery = new Brewery(data.data);
          brewery.save((err) => {
            if (err) {
              // console.log("err", err);
            }
          });
          res.send(data.data);
        })
        .catch((err) => {
          return res.status(500).send({
            message: err
          });
        });
      } else {
        return res.send(data);
      }
    });

  }

  getBreweryBeers(req: Request, res: Response) {
    const options = beerService.options(`brewery/${req.params.id}/beers`);
    request(options)
      .then((data) => {
        BeerDetails.create(data.data);
        res.send(data.data);
      })
      .catch((err) => {
        return res.status(500).send({
          message: err
        });
      });
  }

}
