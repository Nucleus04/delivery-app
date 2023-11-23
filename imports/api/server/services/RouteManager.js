
class RouteManager {
    #db = null;
    constructor(db) {
        this.#db = db;

    }
    /**
     * method that will assign route on every available rider
     * @param { Object } routes Array of route object
     * @param { Object } riders Array of rider object
     * @returns 
     */
    assign(routes, riders) {
        const result = []
        for (let i = 0; i < riders.length; i++) {
            result.push(this.#db.insert({ riderId: riders[i].userid, route: routes[i], status: "pending" }));
        }
        return result;
    }
}



export default RouteManager;