import MapboxWatcher from "./MapboxWatcher";

class assigner {
    #coordinates = null;
    #distanceMatrix = null;
    #savings = null;
    constructor(hq, parcel) {
        this.#coordinates = [hq, ...parcel];
    }
    async calculateDistance(coord1, coord2) {
        // const [lat1, lon1] = coord1;
        // const [lat2, lon2] = coord2;
        // const radius = 6371;
        // const lat1Rad = (Math.PI * lat1) / 180;
        // const lat2Rad = (Math.PI * lat2) / 180;
        // const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
        // const deltaLon = ((lon2 - lon1) * Math.PI) / 180;
        // const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        //     Math.cos(lat1Rad) * Math.cos(lat2Rad) *
        //     Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        // const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        // const distance = radius * c;
        // return distance;

        let data = {
            start: {
                center: [coord1[0], coord1[1]],
            },
            destination: [[coord2[0], coord2[1]]],
        }
        let distance = await MapboxWatcher.search_direction(data);
        return distance.routes[0].distance;
    }
    async distanceMatrix() {
        let main = [];
        for (let i = 0; i < this.#coordinates.length; i++) {
            let temp = [];
            for (let j = i + 1; j < this.#coordinates.length; j++) {
                let distance = await this.calculateDistance(this.#coordinates[i], this.#coordinates[j])
                temp.push(distance);
            }
            main.push(temp);
        }
        this.#distanceMatrix = main;
    }
    clarkeFormula(i, j, k) {
        return (i + j) - k;
    }
    savings() {
        let saving = [];
        for (let i = 0; i < this.#distanceMatrix[0].length; i++) {
            let tempcounter = 0;
            for (let j = i + 1; j < this.#distanceMatrix[0].length; j++) {
                console.log(`${this.#distanceMatrix[0][i]} + ${this.#distanceMatrix[0][j]} - ${this.#distanceMatrix[i + 1][tempcounter]}`);
                let savings = this.clarkeFormula(this.#distanceMatrix[0][i], this.#distanceMatrix[0][j], this.#distanceMatrix[i + 1][tempcounter]);
                saving.push([i + 1, j + 1, savings]);
                tempcounter = tempcounter + 1;
            }
        }
        // console.log(saving);
        this.#savings = saving;
    }

    sort() {
        this.#savings.sort((a, b) => b[2] - a[2]);
        // console.log(this.#savings);
    }
    distributeEmployeesEvenly(numEmployees, numCustomers) {
        let counter = 0;
        let distribution = new Array(numEmployees);
        for (let i = 0; i < numCustomers; i++) {
            if (!distribution[counter]) {
                distribution[counter] = 1
            } else {
                distribution[counter] = distribution[counter] + 1;
            }
            if (counter != numEmployees - 1) {
                counter++;
            } else {
                counter = 0;
            }
        }

        return distribution;
    }
    mergeRoutes(numberOfemployee) {
        let distribution = this.distributeEmployeesEvenly(numberOfemployee, this.#coordinates.length - 1);
        let rider = [];
        let usedRoutes = [];
        function checkMerge(current, item) {
            let merge = false;
            let indexMerge = null;
            let similarCount = 0;

            // Iterate to current rider and check if the current pairs in item have similar
            for (let i = 0; i < current.length; i++) {
                for (let j = 0; j < current[i].length; j++) {
                    for (let k = 0; k < 2; k++) {
                        if (current[i][j] === item[k]) {
                            merge = true;
                            indexMerge = i;
                            similarCount = similarCount + 1;
                            break;
                        }
                    }
                }
            }
            let capacity = distribution[indexMerge];


            if (merge) {
                //if(it is compatible to mearge to current route but the route is already full capacity)
                if (current[indexMerge].length >= capacity) {
                    console.log("Even, invalidate last slot");
                    console.log("odd, need to insert if unique");
                } else {
                    //Check if the item has only one similar on the over all route, if yes, it means the partner of this item is unique
                    if (similarCount <= 1) {
                        for (let i = 0; i < 2; i++) {
                            let insert = true;
                            for (let j = 0; j < 2; j++) {
                                if (current[indexMerge][j] === item[i]) {
                                    insert = false;
                                    break;
                                }
                            }
                            if (insert) {
                                current[indexMerge].push(item[i]);
                                usedRoutes.push(item[i]);

                            }
                        }
                    }
                }
            } else {
                //Create a new Route
                current.push([item[0], item[1]]);
                usedRoutes.push(item[0]);
                usedRoutes.push(item[1]);
            }
            return current;
        }
        //check pars of item if they are compatible to merge
        for (let i = 0; i < this.#savings.length; i++) {
            //if all coordinates is not used, continue the process else end it
            if (usedRoutes.length <= this.#coordinates.length - 1) {
                //if first item, set as route entry 1 or set to rider 1
                if (rider.length === 0) {
                    rider.push([this.#savings[i][0], this.#savings[i][1]]);
                    usedRoutes.push(this.#savings[i][0]);
                    usedRoutes.push(this.#savings[i][1]);
                } else {
                    //check if the current item can be merge to any current rider.
                    rider = checkMerge(rider, this.#savings[i]);
                }
            } else {
                break;
            }
        }

        let routes = []
        for (let i = 0; i < rider.length; i++) {
            let temp = [];
            for (let j = 0; j < rider[i].length; j++) {
                temp.push(this.#coordinates[rider[i][j]]);
            }
            routes.push(temp);
        }
        return routes;
    }
    async calculate(capacity = 3) {
        await this.distanceMatrix();
        this.savings();
        this.sort()
        return this.mergeRoutes(Number(capacity));
    }

}


export default assigner;