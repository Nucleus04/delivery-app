import { fetch } from "meteor/fetch";

const base_search_url = "https://api.mapbox.com/geocoding/v5/mapbox.places";
const base_direction_url = "https://api.mapbox.com/directions/v5/mapbox/";
const access_token = "pk.eyJ1IjoibnVjbGV1czA0IiwiYSI6ImNsbzNiamQwOTFzaXMydHFoanZ3cTlhNW0ifQ.1906DN37UWNVKBWmMNGUyg";

class mapbox {
    #profile;
    constructor(profile = "driving-traffic") {
        this.#profile = profile;
    }
    /**
     * recommends location based on query
     * @param {string} location location for query
     * @returns suggested location based on query
     */
    async search_place(location) {
        try {
            let query = encodeURIComponent(location);
            const response = await fetch(`${base_search_url}/${query}.json?access_token=${access_token}`);
            if (!response.ok) {
                throw new Error("Failed to fetch data from Mapbox");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error in MapboxService:", error);
            throw error;
        }
    }


    async search_direction(start, destination, depart_at) {
        console.log("🚀 ~ file: mapbox.js:34 ~ mapbox ~ search_direction ~ destination:", destination, depart_at)
        try {
            let locations = "";
            let start_point = `${start.center[0]},${start.center[1]};`;
            let destination_points = "";
            if (destination.length > 0) {
                destination.forEach(element => {
                    destination_points = destination_points.concat(`${element[0]},${element[1]};`)
                });
            }
            locations = start_point.concat(destination_points);
            let final_location = locations.substring(0, locations.length - 1);
            return new Promise((resolve, reject) => {
                fetch(`${base_direction_url}${this.#profile}/${final_location}?steps=true&geometries=geojson&alternatives=true&depart_at=${depart_at}&access_token=${access_token}`).then(async (result) => {
                    let data = await result.json();
                    resolve(data);
                }).catch((error) => {
                    reject(error);
                })
            })
        } catch (error) {
            throw error;
        }
    }
}


export default mapbox;