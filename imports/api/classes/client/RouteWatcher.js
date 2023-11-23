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
            }).catch((error) => {
                console.log(error);
            });
        });
    }

    get TrackingRider() {
        return route.find({}).fetch();
    }
}


export default new RouteWatcher(Client);