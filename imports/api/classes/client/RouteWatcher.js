import Watcher from "./Watcher";
import Client from "./Client";
import { PUBLICATION, ROUTING } from "../../common";
import { route } from "../../db";


class RouteWatcher extends Watcher {
    constructor(parent) {
        super(parent);
    }

    assign(routes) {
        return new Promise((resolve, reject) => {
            this.Parent.callFunc(ROUTING.ASSIGN, routes).then((result) => {
                console.log(result);
                alert("Route assigned successfully");
            }).catch((error) => {
                console.log(error);
                alert('Insufficient available riders.');
            });
        });
    }

    get TrackingRider() {
        return route.find({}).fetch();
    }

    getRoutes(routeClass) {
        console.log(routeClass);
        if (routeClass) {
            return route.find({ route_class: routeClass }).fetch();
        } else {
            return route.find({}, { sort: { created_at: -1 } }).fetch();
        }
    }
}


export default new RouteWatcher(Client);