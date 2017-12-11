import * as _ from "lodash";
import * as request from "request-promise";

export class BeerService {
    private beerUrl = "http://api.brewerydb.com/v2/";

    // constructor() {}
    options(uri: string, params?: any) {
        const res = {
            method: "GET",
            qs: {
              key: process.env.beer
            },
            uri: `${this.beerUrl}${uri}`,
            json: true
        };
        res.qs = params ? _.assign(res.qs, params) : res.qs;
        return res;
    }

}
