import * as _ from "lodash";
import * as request from "request-promise";

export class RetroService {
    private retroUrl = "http://retroachievements.org/API/";
    private retroImageUrl = "http://i.retroachievements.org";
    private activityTypes = {
        1: "Achievement",
        2: "Delete",
        3: "Started Playing"
    };

    // constructor() {}
    options(uri: string, params?: any) {
        const res = {
            method: "GET",
            qs: {
                y: process.env.retro,
                z: "foleykoontz",
            },
            uri: `${this.retroUrl}${uri}.php`,
            json: true
        };
        res.qs = params ? _.assign(res.qs, params) : res.qs;
        return res;
    }

    getUser(user: string) {
        const params = {
            u: user,
        };
        const options = this.options("API_GetUserRankAndScore", params);
        return request(options);
    }

    getTop10() {
        const options = this.options("API_GetTopTenUsers");
        return request(options);
    }

    getUserSummary(user: string, games: number = 3) {
        const params = {
            u: user,
            g: games,
            a: 5
        };
        const options = this.options("API_GetUserSummary", params);
        return request(options);
    }

    getUserFeed(user: string, count: number = 10, offset: number = 0) {
        const params = {
            u: user,
            c: count,
            o: offset
        };
        const options = this.options("API_GetFeed", params);
        return request(options);
    }

    getRecent(user: string) {
        const params = {
            u: user,
        };
        const options = this.options("API_GetUserRecentlyPlayedGames", params);
        return request(options);
    }

    getGameInfo(game: string) {
        const params = {
            i: game
        };
        const options = this.options("API_GetGame", params);
        return request(options);
    }

    getGameInfoExtended(game: string) {
        const params = {
            i: game
        };
        const options = this.options("API_GetGameExtended", params);
        return request(options);
    }

    getGameProgress(user: string, game: string) {
        const params = {
            u: user,
            g: game
        };
        const options = this.options("API_GetGameInfoAndUserProgress", params);
        return request(options);
    }

    getConsoleIds() {
        const options = this.options("API_GetConsoleIDs");
        return request(options);
    }

    mapGames(games: any[]) {
        games = _.chain(games)
          .map((game: any) => {
            game.ImageIcon = game.ImageIcon ? this.buildIcon(game.ImageIcon) : undefined;
            return game;
          })
          .value();
        return games;
    }

    mapAchievements(data: any) {
        data.UserPic = this.buildUserPic(data.UserPic);
        data.RecentlyPlayed = _.chain(data.RecentlyPlayed)
        .filter("Title")
        .map((game: any) => {
            game.ImageIcon = `${this.retroImageUrl}${game.ImageIcon}`;
            if (data.RecentAchievements && data.RecentAchievements[game.GameID]) {
                game.achievements = [];
                _.forEach(data.RecentAchievements[game.GameID], (i) => {
                    const tail = (i.IsAwarded === "1") ? "" : "_lock";
                    i.BadgeName = this.buildBadge(i.BadgeName, tail);
                    i.Combined = `${i.Title}: ${i.Description}`;
                    game.achievements.push(i);
                });
                game.achievementLength = game.achievements.length;
                game.achievements = _.groupBy(game.achievements, (i) => {
                    return i.IsAwarded;
                });
            }
            return game;
        })
        .value();
        delete data.RecentAchievements;
        return data;
    }
    mapFeed(data: any[]) {
        const res = _.chain(data)
            .filter("GameTitle")
            .map((i) => {
              i.GameIcon = i.GameIcon ? this.buildIcon(i.GameIcon) : undefined;
                switch (i.activitytype) {
                    case ("1"):
                        i.GameIcon = this.buildBadge(i.AchBadge);
                        i.message = `Achievement`;
                        break;
                    case ("3"):
                        i.message = `Started Playing`;
                        break;
                }
                return i;
            })
            .value();
        return res;
    }

    buildIcon(icon: string) {
        return `${this.retroImageUrl}${icon}`;
    }

    buildBadge(badge: string, tail: string = "") {
        return `${this.retroImageUrl}/Badge/${badge}${tail}.png`;
    }

    buildUserPic(icon: string) {
        return `http://retroachievements.org${icon}`;
    }
}
