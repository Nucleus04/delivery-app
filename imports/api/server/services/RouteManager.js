import { profile } from "../../db";
import RiderService from "./RiderService";
import { Random } from "meteor/random";

class RouteManager {
    #db = null;
    constructor(db) {
        this.#db = db;

    }
    /**
     * method that will assign route on every available rider
     * @param { Object } routes Array of route object
     * @param { Object } riders Array of rider object
     * @returns 
     */
    assign(routes, riders) {
        const result = []
        const routeClass = Random.id();
        for (let i = 0; i < riders.length; i++) {
            const data = {
                riderId: riders[i].userid,
                route: routes[i],
                status: "pending",
                route_class: routeClass,
                created_at: new Date()
            }
            result.push(this.#db.insert(data));
            RiderService.updateRiderAvailability(profile, false, riders[i].userid);
        }
        return result;
    }
}



export default RouteManager;