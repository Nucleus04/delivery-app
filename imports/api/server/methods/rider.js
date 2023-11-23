import { Meteor } from "meteor/meteor";
import { RIDER } from "../../common";
import RiderService from "../services/RiderService";
import { route } from "../../db";


class RiderMethods {
    methods() {
        return Meteor.methods({
            [RIDER.UPDATE_GEOJSON]: function ({ riderId, geojson }) {
                console.log("Updating Rider position", riderId, geojson);
                return RiderService.updateRidersGeojson(route, geojson, riderId);
            },

            [RIDER.UPDATE_STATUS]: function ({ riderId, status }) {
                console.log("Updating status");
                return RiderService.updateDeliveryStatus(route, status, riderId);
            }
        })
    }
}



export default new RiderMethods;