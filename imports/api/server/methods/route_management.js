import { Meteor } from "meteor/meteor";
import { ROUTING } from "../../common";
import { profile, route } from "../../db";
import RouteManager from "../services/RouteManager";
import QueueManager from "../services/QueueManager";

class RouteManagement {
    methods() {
        return Meteor.methods({
            [ROUTING.ASSIGN]: function (routes) {
                try {
                    const queue = new QueueManager(profile);
                    const routeManager = new RouteManager(route);
                    let riderNeeded = routes.length;
                    const riders = queue.get_available_riders(riderNeeded);
                    console.log("Available Riders", riders);
                    return routeManager.assign(routes, riders);
                } catch (error) {
                    console.log(error);
                }
            }
        })
    }
}


export default new RouteManagement;