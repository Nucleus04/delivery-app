
class QueueManager {
    #db = null;
    constructor(db) {
        this.#db = db;
    }
    /**
     * fetch available rider in database;
     * @param {Number} count number of riders needed
     * @returns 
     */
    get_available_riders(count) {
        return this.#db.find({ availability: true }, { limit: count }).fetch();
    }
}

export default QueueManager;