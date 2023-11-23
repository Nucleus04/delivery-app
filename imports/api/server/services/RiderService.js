


class RiderServices {

    updateDeliveryStatus(db, status, riderId) {
        return db.update({ riderId: riderId }, { $set: { status: status } });
    }

    updateRidersGeojson(db, geojson, riderId) {
        return db.update({ riderId: riderId }, { $set: { ["route.geojson"]: geojson } });
    }
}



export default new RiderServices;