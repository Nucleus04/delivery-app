import { Meteor } from "meteor/meteor";
import { PUBLICATION } from "../../common";
import { route } from "../../db";


class RoutePublication {
    publication() {
        return Meteor.publish(PUBLICATION.GET_ROUTE, (riderId) => {
            console.log(riderId);
            return route.find({ riderId: riderId, status: { $in: ["pending", "ongoing"] } });
        })
    }


    trackingRider() {
        return Meteor.publish(PUBLICATION.TRACK_RIDER, () => {
            return route.find({ status: { $in: ["pending", "ongoing"] } });
        })
    }


    getRoutes() {
        return Meteor.publish(PUBLICATION.GET_ROUTES_ADMIN, () => {
            console.log('Getting all routes');
            console.log(route.find({}).fetch());
            return route.find({});
        })
    }
}


export default new RoutePublication;