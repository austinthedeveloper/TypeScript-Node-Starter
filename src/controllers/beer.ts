import { BeerService } from "./../services/beerService";
import { Request, Response } from "express";
import * as request from "request-promise";
import * as _ from "lodash";
import { default as BeerDetails, BeerDetailsModel } from "../models/Beer-Details";
import { default as Beer, BeerModel } from "../models/Beer";
const beerService = new BeerService();

export class BeerController {

    constructor() { }

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
        console.log("hit", body);
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

  /**
   * show
   */
  objectProper = "beer";
  show(req: Request, res: Response) {
    const id = req.params.id;
    Beer.findOne({ _id: id }, (err, data: BeerModel) => {
      if (err) {
        return res.status(500).send({
          message: `Error getting ${this.objectProper}.`
        });
      }
      if (!data) {
        return res.status(404).send({
          message: `No such ${this.objectProper}.`
        });
      }
      // Get the original obj
      BeerDetails.findOne({ id: data.id }, (err, detailsData: BeerDetailsModel) => {
        if (err) {
          return res.status(500).send({
            message: err
          });
        } else if (!detailsData) {
          return res.send({
            data: data
          });
        } else {
          return res.send({
            data: data,
            original: detailsData
          });
        }
      });
      // return res.send(data);
    });
  }

  /**
   * update
   */
  update(req: Request, res: Response) {
    const id = req.params.id;
    Beer.findOne({ _id: id }, (err, data: BeerModel) => {
      if (err) {
        return res.status(500).send({
          message: `Error saving ${this.objectProper}.`,
          error: err
        });
      }
      if (!data) {
        return res.status(404).send({
          message: `No such ${this.objectProper}.`
        });
      }

      data = _.extend(data, req.body);

      data.save((err, saved) => {
        if (err) {
          return res.status(500).send({
            message: `Error getting ${this.objectProper}.`
          });
        }
        if (!saved) {
          return res.status(404).send({
            message: `No such ${this.objectProper}.`
          });
        }
        return res.send(saved);
      });
    });
  }
  remove(req: Request, res: Response) {
    const id = req.params.id;
    Beer.findByIdAndRemove(id, (err, data) => {
      if (err) {
        return res.status(500).send({
          message: `Error getting ${this.objectProper}.`
        });
      }
      return res.send(data);
    });
  }

}
