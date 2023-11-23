import { Meteor } from "meteor/meteor";
import SearchPlace from "../../api/server/methods/search_place";
import SearchDirection from "../../api/server/methods/search_direction";
import optimize_route from "../../api/server/methods/optimize_route";
import AccountMethods from "../../api/server/methods/account";
import RouteManager from "../../api/server/services/RouteManager";
import route_management from "../../api/server/methods/route_management";
import RoutePublication from "../../api/server/publications/routePublication";
import rider from "../../api/server/methods/rider";
class Server {
    _init() {
        return Meteor.startup(async () => {
            console.log("Meteor Server started");
            SearchPlace.methods();
            SearchDirection.methods();
            optimize_route.methods();
            AccountMethods.methods();
            route_management.methods();
            rider.methods();

            RoutePublication.publication();
            RoutePublication.trackingRider();
        })
    }
}


export default new Server;