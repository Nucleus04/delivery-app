import { Meteor } from "meteor/meteor";
import { RIDER } from "../../common";
import RiderService from "../services/RiderService";
import { route } from "../../db";


class RiderMethods {
    methods() {
        return Meteor.methods({
            [RIDER.UPDATE_GEOJSON]: function ({ routeId, geojson }) {
                console.log("Updating Rider position", routeId, geojson);
                return RiderService.updateRidersGeojson(route, geojson, routeId);
            },

            [RIDER.UPDATE_STATUS]: function ({ routeId, status, riderId }) {
                console.log("Updating status", routeId, status, riderId);
                return RiderService.updateDeliveryStatus(route, status, routeId, riderId);
            }
        })
    }
}



export default new RiderMethods;