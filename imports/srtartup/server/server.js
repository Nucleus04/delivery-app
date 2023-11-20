import { Meteor } from "meteor/meteor";
import SearchPlace from "../../api/server/methods/search_place";
import SearchDirection from "../../api/server/methods/search_direction";
import optimize_route from "../../api/server/methods/optimize_route";
class Server {
    _init() {
        return Meteor.startup(async () => {
            console.log("Meteor Server started");
            SearchPlace.methods();
            SearchDirection.methods();
            optimize_route.methods();
        })
    }
}


export default new Server;