import Watcher from "./Watcher";
import Client from "./Client";
import { ROUTING } from "../../common";


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
}


export default new RouteWatcher(Client);