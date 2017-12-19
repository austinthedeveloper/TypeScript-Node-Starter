import { Request, Response } from "express";
import * as request from "request-promise";
import { default as Company, CompanyModel } from "../models/Company";
import { default as User, UserModel } from "../models/User";
import * as _ from "lodash";
import * as mongoose from "mongoose";
export class CompanyController {

  constructor() { }

  objectProper = "company";

  /**
   * list
   */
  list(req: Request, res: Response) {
    const status = req.query.status || "draft";
    Company.find()
    .populate("owner")
    .exec((err, data: CompanyModel) => {
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
    Company.findOne({ _id: id })
    .populate("users")
    .exec((err, data: CompanyModel) => {
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
      console.log(data.users);
      return res.send(data);
    });
  }

  /**
   * create
   */
  create(req: Request, res: Response) {
    const company = new Company(req.body);
    company.save(function (err, data) {
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
    Company.findOne({ _id: id }, (err, data: CompanyModel) => {
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

  /**
   * remove
   */
  remove(req: Request, res: Response) {
    const id = req.params.id;
    Company.findByIdAndRemove(id, (err, data) => {
      if (err) {
        return res.status(500).send({
          message: `Error getting ${this.objectProper}.`
        });
      }
      // User
      // .find({company: id}, (err, data: UserModel[]) => {
      //   if (data) {
      //     console.log("data", data);
      //     _.forEach(data, res => {
      //       res.company = "";
      //       res.save();
      //     });
      //   }
      // });
      return res.send(data);
    });
  }

}
