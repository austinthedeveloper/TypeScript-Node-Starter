import { BeerService } from "./../services/beerService";
import { Request, Response } from "express";
import * as request from "request-promise";
import { default as Brewery, BreweryModel } from "../models/Brewery";
import { default as BeerDetails, BeerDetailsModel } from "../models/Beer-Details";
import { default as Beer, BeerModel } from "../models/Beer";
const beerService = new BeerService();

export class BeerController {

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
        // const beer = new BeerDetails(data.data);
        BeerDetails.create(data.data);
        res.send(data.data);
      })
      .catch((err) => {
        return res.status(500).send({
          message: err
        });
      });
  }

  saveBeerDetails(req: Request, res: Response) {
    const body = req.body;
    BeerDetails.findOne({ id: body.id }, (err, data) => {
      if (err) {
        return res.status(500).send({
          message: err
        });
      } else if (!data) {
        const beer = new BeerDetails(body);
        beer.save((err) => {
          if (err) {
            return res.status(500).send({
              message: err
            });
          } else {
            return res.send({ message: "success" });
          }
        });
      } else {
        return res.status(500).send({
          message: "Already exists"
        });
      }
    });
  }

  saveBeer(req: Request, res: Response) {
    const body = req.body;
    Beer.findOne({ id: body.id }, (err, data) => {
      if (err) {
        return res.status(500).send({
          message: err
        });
      } else if (!data) {
        const beer = new Beer(body);
        beer.save((err, data) => {
          if (err) {
            return res.status(500).send({
              message: err
            });
          } else {
            return res.send({ data });
          }
        });
      } else {
        return res.status(500).send({
          message: "Already exists"
        });
      }
    });
  }

  deleteBeer(req: Request, res: Response) {
    const body = req.body;
    Beer.remove({ id: body.id, user: body.userId }, (err) => {
      if (err) {
        return res.status(500).send({
          message: err
        });
      } else {
        return res.send({ message: "success" });
      }
    });
  }

  savedBeers(req: Request, res: Response) {
    const userId = req.params.id;
    Beer.find({ user: userId }, (err, data) => {
      if (err) {
        return res.status(500).send({
          message: err
        });
      } else {
        return res.send(data);
      }
    });
  }

  getBeerDetails(req: Request, res: Response) {
    const id = req.params.id;
    BeerDetails.findOne({ id: id }, (err, data) => {
      if (err) {
        return res.status(500).send({
          message: err
        });
      } else if (!data) {
        const options = beerService.options(`beer/${id}`);
        request(options)
          .then((data) => {
            // save beer
            const beer = new BeerDetails(data);
            beer.save();
            return res.send(data.data);
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

}
