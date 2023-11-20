import { METHODS } from "../../../common";
import Client from "./Client";
import Watcher from "./Watcher";

class MapboxWatcher extends Watcher {
    #direction = null;
    #suggested_place = [];
    #start = null;
    #destination = [];
    constructor(parent) {
        super(parent);
    }
    get Direction() {
        return this.#direction;
    }

    get SuggestedPlace() {
        return this.#suggested_place;
    }
    get Destinations() {
        return this.#destination;
    }
    setStart(start) {
        this.#start = start;
    }
    addDestination(destination) {

        this.#destination.push(destination);
    }
    setDirection(direction) {
        this.#direction = direction;
        this.activateWatcher();
    }
    async nearestNeighbor(numberOfRIders, depart_at) {

        return new Promise((resolve, reject) => {
            this.Parent.callFunc(METHODS.OPTIMIZE, { numberOfRiders: Number(numberOfRIders), start: this.#start.center, destinations: this.#destination, depart_at: depart_at }).then((result) => {
                resolve(result);
            }).catch((error) => {
                console.log(error);
            })
        })
    }

    cleanSuggestedPlaces() {
        this.#suggested_place = [];
        this.activateWatcher();
    }

    search_place(location) {
        return new Promise((resolve, reject) => {
            this.Parent.callFunc(METHODS.SEARCH_START_POINT, location).then((result) => {
                if (result && result.features) {
                    this.#suggested_place = result.features;
                    this.activateWatcher();
                }
            }).catch((error) => {
                console.log(error);
            })
        })
    }

    reset() {
        this.#direction = null;
        this.#suggested_place = [];
        this.#start = null;
        this.#destination = [];
        this.activateWatcher();
    }

    search_direction(request) {
        return new Promise((resolve, reject) => {
            this.Parent.callFunc(METHODS.DIRECTION, request).then((result) => {
                if (result.routes && result.routes.length > 1) {
                    result.routes.sort((routeA, routeB) => routeA.duration - routeB.duration);

                }
                this.activateWatcher();
                resolve(result);
            }).catch((error) => {
                console.log(error);
            })
        })

    }
}


export default new MapboxWatcher(Client);