import { Meteor } from "meteor/meteor";
import mapbox from "../../classes/server/services/mapbox";
import { METHODS } from "../../../common";

class SearchDirection {
    constructor() {

    }


    methods() {
        return Meteor.methods({
            [METHODS.DIRECTION]: async function (query) {
                console.log("Searching direction", query);
                try {
                    let MapBox = new mapbox(query.profile);
                    let direction = await MapBox.search_direction(query.start, query.destination, query.depart_at);
                    direction.depart_at = query.depart_at;
                    return direction;
                } catch (error) {
                    console.log(error);

                }
            }
        })
    }
}


export default new SearchDirection;