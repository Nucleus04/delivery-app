import mapbox from "./mapbox";

async function calculateDistance(coord1, coord2, depart_at) {
    let data = {
        start: {
            center: [coord1[0], coord1[1]],
        },
        destination: [[coord2[0], coord2[1]]],
    }
    let Mapbox = new mapbox(data.profile);
    let distance = await Mapbox.search_direction(data.start, data.destination, depart_at);
    return distance.routes[0].distance;
}

async function findNearestNeighbor(depot, unvisitedCustomers, depart_at) {
    let nearestCustomer = null;
    let nearestDistance = Infinity;

    for (const customer of unvisitedCustomers) {
        const distance = await calculateDistance(depot, customer, depart_at);

        if (distance < nearestDistance) {
            nearestCustomer = customer;
            nearestDistance = distance;
        }
    }

    return nearestCustomer;
}
function distributeEmployeesEvenly(numEmployees, numCustomers) {
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

export async function nearestNeighborAlgorithm(depot, customers, numOfEmployee, depart_at) {
    let distribution = distributeEmployeesEvenly(numOfEmployee, customers.length);
    const routes = [];
    const unvisitedCustomers = [...customers];
    let currentLocation = depot;
    let currentRoute = [depot];
    let currentCapacity = 0;
    let counter = 0;
    let maxCapacity = distribution[0];
    while (unvisitedCustomers.length > 0) {
        const nearestCustomer = await findNearestNeighbor(currentLocation, unvisitedCustomers, depart_at);

        if (nearestCustomer) {
            if (currentCapacity + 1 <= maxCapacity) {
                currentRoute.push(nearestCustomer);
                unvisitedCustomers.splice(unvisitedCustomers.indexOf(nearestCustomer), 1);
                currentLocation = nearestCustomer;
                currentCapacity += 1;
            } else {
                counter++;
                maxCapacity = distribution[counter];
                // currentRoute.push(depot);
                routes.push(currentRoute);
                currentRoute = [depot];
                currentLocation = depot;
                currentCapacity = 0;
            }
        } else {
            // console.log("No nearest customer found. Exiting loop.");
            break;
        }
    }

    if (currentRoute.length > 1) {
        // currentRoute.push(depot);
        routes.push(currentRoute);
    }
    // console.log("ROUTES", routes);
    return routes;
}