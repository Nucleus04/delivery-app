


class RiderServices {

    updateDeliveryStatus(db, status, routeId) {
        return db.update({ _id: routeId }, { $set: { status: status } });
    }

    updateRidersGeojson(db, geojson, routeId) {
        return db.update({ _id: routeId }, { $set: { ["route.geojson"]: geojson } });
    }
}



export default new RiderServices;