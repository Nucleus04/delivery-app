import { Meteor } from "meteor/meteor";
import mapbox from "../../classes/server/services/mapbox";
import { METHODS } from "../../../common";

class SearchPlace {
    constructor() {

    }

    methods() {
        return Meteor.methods({
            [METHODS.SEARCH_START_POINT]: async function (query) {
                console.log(query);
                try {
                    let MapBox = new mapbox();
                    let data = await MapBox.search_place(query);
                    return data;
                } catch (error) {
                    console.log(error);
                }
            },
        })
    }
}


export default new SearchPlace;