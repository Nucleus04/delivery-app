import Client from "./Client";
import Watcher from "./Watcher";
import { route } from "../../db";
import { RIDER } from "../../common";
import { Meteor } from "meteor/meteor";


class RiderWatcher extends Watcher {
    constructor(parent) {
        super(parent);
    }

    getRoutes() {
        return route.find({}).fetch();
    }

    updateRidersGeojson(routeId, geojson) {
        return new Promise((resolve, reject) => {
            this.Parent.callFunc(RIDER.UPDATE_GEOJSON, { routeId: routeId, geojson: geojson }).then((result) => {
                console.log(result);
                resolve(result);
            }).catch((error) => {
                console.log(error);
            })
        })
    }


    updateDeliveryStatus(routeId, status) {
        return new Promise((resolve, reject) => {
            this.Parent.callFunc(RIDER.UPDATE_STATUS, { routeId: routeId, status: status }).then((result) => {
                console.log(result);
            }).catch((error) => {
                console.log(error);
            })
        })
    }
}

export default new RiderWatcher(Client);