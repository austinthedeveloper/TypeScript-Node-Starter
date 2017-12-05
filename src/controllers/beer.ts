import { BeerService } from "./../services/beerService";
import { RetroService } from "./../services/retroService";
import { Request, Response } from "express";
import * as request from "request-promise";
import { default as Brewery, BreweryModel } from "../models/Brewery";
import { default as Beer, BeerModel } from "../models/Beer";
const beerService = new BeerService();

export class BeerController {

    constructor() { }

  findBrewery(req: Request, res: Response) {
    const breweryName = req.query.name;
    const options = beerService.options(`breweries`, { name: breweryName});
    request(options)
      .then((data) => {
        res.send(data.data);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  }

  getBrewery(req: Request, res: Response) {
    const id = req.params.id;
    Brewery.findOne({id: id}, (err, data) => {
      if (err) {
        res.send({message: "error"});
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
          console.log("error: ", err);
        });
      } else {
        res.send(data);
      }
    });

  }

  getBreweryBeers(req: Request, res: Response) {
    const options = beerService.options(`brewery/${req.params.id}/beers`);
    request(options)
      .then((data) => {
        res.send(data.data);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  }

  saveBeer(req: Request, res: Response) {
    const body = req.body;
    Beer.findOne({ id: body.id }, (err, data) => {
      if (err) {
        res.send({message: "Error saving beer"});
      } else if (!data) {
        const beer = new Beer(body);
        beer.save((err) => {
          if (err) {
            console.log("err", err);
          } else {
            res.send({ message: "success" });
          }
        });
      } else {
        res.send({message: "already exists"});
      }
    });
  }

}
