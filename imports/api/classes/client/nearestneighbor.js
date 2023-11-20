import MapboxWatcher from "./MapboxWatcher";

// function calculateDistance(coord1, coord2) {
//     const [lat1, lon1] = coord1;
//     const [lat2, lon2] = coord2;
//     const radius = 6371;
//     const lat1Rad = (Math.PI * lat1) / 180;
//     const lat2Rad = (Math.PI * lat2) / 180;
//     const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
//     const deltaLon = ((lon2 - lon1) * Math.PI) / 180;
//     const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
//         Math.cos(lat1Rad) * Math.cos(lat2Rad) *
//         Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const distance = radius * c;
//     return distance;
// }

async function calculateDistance(coord1, coord2) {
    let data = {
        start: {
            center: [coord1[0], coord1[1]],
        },
        destination: [[coord2[0], coord2[1]]],
    }
    let distance = await MapboxWatcher.search_direction(data);
    console.log(distance.routes[0].distance);
    return distance.routes[0].distance;
}

async function findNearestNeighbor(depot, unvisitedCustomers) {
    let nearestCustomer = null;
    let nearestDistance = Infinity;

    for (const customer of unvisitedCustomers) {
        const distance = await calculateDistance(depot, customer);

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

export async function nearestNeighborAlgorithm(depot, customers, numOfEmployee) {
    let distribution = distributeEmployeesEvenly(numOfEmployee, customers.length);
    const routes = [];
    const unvisitedCustomers = [...customers];
    let currentLocation = depot;
    let currentRoute = [depot];
    let currentCapacity = 0;
    let counter = 0;
    let maxCapacity = distribution[0];
    while (unvisitedCustomers.length > 0) {
        const nearestCustomer = await findNearestNeighbor(currentLocation, unvisitedCustomers);

        if (nearestCustomer) {
            if (currentCapacity + 1 <= maxCapacity) {
                currentRoute.push(nearestCustomer);
                unvisitedCustomers.splice(unvisitedCustomers.indexOf(nearestCustomer), 1);
                currentLocation = nearestCustomer;
                currentCapacity += 1;
            } else {
                counter++;
                maxCapacity = distribution[counter];
                currentRoute.push(depot);
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
        currentRoute.push(depot);
        routes.push(currentRoute);
    }
    // console.log("ROUTES", routes);
    return routes;
}