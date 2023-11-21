import { Meteor } from "meteor/meteor";
import { PUBLICATION } from "../../common";
import { route } from "../../db";


class RoutePublication {
    publication() {
        return Meteor.publish(PUBLICATION.GET_ROUTE, (riderId) => {
            console.log(riderId);
            return route.find({ riderId: riderId });
        })
    }
}


export default new RoutePublication;