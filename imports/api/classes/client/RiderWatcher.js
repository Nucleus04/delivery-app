import Client from "./Client";
import Watcher from "./Watcher";
import { route } from "../../db";
class RiderWatcher extends Watcher {
    constructor(parent) {
        super(parent);
    }

    getRoutes() {
        return route.find({}).fetch();
    }
}

export default new RiderWatcher(Client);