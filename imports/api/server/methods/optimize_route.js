import { Meteor } from "meteor/meteor";
import { METHODS } from "../../../common";
import assigner from "../../classes/server/services/assingner";
import { nearestNeighborAlgorithm } from "../../classes/server/services/nearestneighbor";


class OptimizeRoutes {
    constructor() {

    }
    methods() {
        return Meteor.methods({
            [METHODS.OPTIMIZE]: async function ({ numberOfRiders, start, destinations, depart_at }) {
                if (numberOfRiders === 1) {
                    return nearestNeighborAlgorithm(start, destinations, 1, depart_at);
                } else {
                    let Assigner = new assigner(start, destinations, depart_at);
                    let assingnedRoute = await Assigner.calculate(numberOfRiders);
                    let routePromises = [];
                    assingnedRoute.forEach(element => {
                        let neighborPromise = nearestNeighborAlgorithm(start, element, 1, depart_at);
                        routePromises.push(neighborPromise);
                    });
                    let routes = await Promise.all(routePromises);
                    let final = [];
                    for (let g = 0; g < routePromises.length; g++) {
                        final.push(routes[g][0])
                    }
                    return final;
                }
            }
        })
    }
}

export default new OptimizeRoutes;