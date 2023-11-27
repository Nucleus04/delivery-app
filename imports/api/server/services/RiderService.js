import { profile } from "../../db";



class RiderServices {

    updateDeliveryStatus(db, status, routeId, riderId) {
        if (status === "delivered") {
            this.updateRiderAvailability(profile, true, riderId);
        }
        return db.update({ _id: routeId }, { $set: { status: status } });
    }

    updateRidersGeojson(db, geojson, routeId) {
        return db.update({ _id: routeId }, { $set: { ["route.geojson"]: geojson } });
    }

    updateRiderAvailability(db, state, riderId) {
        return db.update({ userid: riderId }, { $set: { availability: state } });
    }
}



export default new RiderServices;