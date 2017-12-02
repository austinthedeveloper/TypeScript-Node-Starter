import { RetroService } from "./../services/retroService";
import { Request, Response } from "express";
const retroService = new RetroService();

export class RetroController {

    constructor() { }

    /**
     * GET /contact
     * Contact form page.
     */
    getContact(req: Request, res: Response) {
        res.render("contact", {
            title: "Contact"
        });
    }

    getUsers(req: Request, res: Response) {
      retroService.getTop10()
      .then((data) => {
          res.send(data);
      })
      .catch((err) => {
          console.log("error: ", err);
      });
    }
    getUser(req: Request, res: Response) {
      retroService.getUser(req.params.user)
      .then((data) => {
          res.send(data);
      })
      .catch((err) => {
          console.log("error: ", err);
      });
    }
    getUserSummary(req: Request, res: Response) {
      retroService.getUserSummary(req.params.user, 5)
      .then((data) => {
        // data.RecentlyPlayed = retroService.mapGames(data.RecentlyPlayed);
        data = retroService.mapAchievements(data);
        res.send(data);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
    }
    getUserFeed(req: Request, res: Response) {
      retroService.getUserFeed(req.params.user, 30)
      .then((data) => {
        data = retroService.mapFeed(data);
        res.send(data);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
    }
    getUserRecent(req: Request, res: Response) {
      retroService.getRecent(req.params.user)
      .then((data) => {
        data = retroService.mapGames(data);
        res.send(data);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
    }
    getUserProgress(req: Request, res: Response) {
      retroService.getGameProgress(req.params.user, req.params.game)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
    }
    getGame(req: Request, res: Response) {
      retroService.getGameInfo(req.params.game)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
    }
    getGameExt(req: Request, res: Response) {
      retroService.getGameInfoExtended(req.params.game)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
    }
    getConsoles(req: Request, res: Response) {
      retroService.getConsoleIds()
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
    }



}
