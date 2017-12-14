import { Request, Response } from "express";
import * as request from "request-promise";
import { default as Brewery, BreweryModel } from "../models/Brewery";

export class CrudController {

  constructor() { }

  objectProper = "brewery";

  /**
   * list
   */
  list(req: Request, res: Response) {
    Brewery.find((err, data) => {
      if (err) {
        return res.status(500).send({
          message: `Error getting ${this.objectProper}.`
        });
      }
      return res.send(data);
    });
  }

  /**
   * show
   */
  show(req: Request, res: Response) {
    const id = req.params.id;
    Brewery.findOne({ _id: id }, (err, data) => {
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
      return res.send(data);
    });
  }

  /**
   * create
   */
  create(req: Request, res: Response) {
    const brewery = new Brewery(req.body);

    brewery.save(function (err, data) {
      if (err) {
        return res.status(500).send({
          message: `Error saving ${this.objectProper}.`,
          error: err
        });
      }
      return res.send({
        message: "saved",
        _id: data._id
      });
    });
  }

  /**
   * update
   */
  update(req: Request, res: Response) {
    const id = req.params.id;
    Brewery.findOne({ _id: id }, (err, data) => {
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

  /**
   * remove
   */
  remove(req: Request, res: Response) {
    const id = req.params.id;
    Brewery.findByIdAndRemove(id, (err, data) => {
      if (err) {
        return res.status(500).send({
          message: `Error getting ${this.objectProper}.`
        });
      }
      return res.send(data);
    });
  }

}
