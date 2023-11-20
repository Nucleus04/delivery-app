import React, { Component } from "react";
import MapboxWatcher from "../../api/classes/client/MapboxWatcher";
import mapboxgl from "mapbox-gl";
import { coordinatesSimulate } from "./simulation_data";

class LocationForm extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        MapboxWatcher.setWatcher(this, "location");
        this.simulateRef = React.createRef();
        this.state = {
            starting_point_location: "",
            destination_point_location: [],
            map: null,
            marker_reference: null,
            geojson: null,
            parcelcoordinates: [],
            direction: null,
            numberOfRiders: "",
            routes: null,
            depart_at: null,
            isSelectingDestination: false,
            simulating: {
                state: false
            },
            isRider: false,
            isSelectingRole: true,
            role: "",
            myPosition: null,
        }

    }

    timerId = null;
    /**
     * function for searching places on Mapbox Api (admin)
     * @param {*} event 
     */
    onLocationChange(event) {
        const { name, value } = event.target;
        this.setState({
            [name]: value,
        })
        if (this.timerId) {
            clearTimeout(this.timerId);
        }
        this.timerId = setTimeout(() => {
            MapboxWatcher.search_place(value);
        }, 500);
    }
    /**
     * function for setting up depot location (admin)
     * @param {*} plcae_info 
     */
    onSelectStartingPoint(plcae_info) {
        this.setState({
            starting_point_location: plcae_info.place_name,
        })

        this.state.map.setCenter(plcae_info.center);
        this.state.map.setZoom(12);
        const marker = new mapboxgl.Marker()
            .setLngLat(plcae_info.center)
            .addTo(this.state.map);
        this.setState({
            marker_reference: marker,
        })
        MapboxWatcher.setStart(plcae_info);
        MapboxWatcher.cleanSuggestedPlaces();
    }
    /**
     * Function for adding parcel points in the map (admin)
     * @param {*} place_info 
     */
    destinationMarker(place_info) {
        this.state.map.setCenter(place_info.center);
        this.state.map.setZoom(12);
        this.state.map.addSource(place_info.place_name, {
            type: "geojson",
            data: place_info,
        });
        this.state.map.addLayer({
            id: place_info.place_name,
            type: 'circle',
            source: place_info.place_name,
            paint: {
                'circle-radius': 11,
                'circle-color': '#FF0000',
            },
        })


    }
    /**
     * function for adding parcels on the list or target destinations via type (admin)
     * @param {*} place_info 
     */
    onSelectingDestination(place_info) {
        this.setState((prevState) => ({
            destination_point_location: [...prevState.destination_point_location, place_info.place_name],
            temp_destination: ""
        }))
        this.destinationMarker(place_info);
        MapboxWatcher.addDestination(place_info);
        MapboxWatcher.cleanSuggestedPlaces();

    }
    /**
     * Function for generating random color (utility)
     * @returns 
     */
    getRandomHexColor() {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    /**
     * Function for drawing route on the map (utility)
     * @param {Object} geometry geometry object from mapbax direction api
     * @param {*} defaultColor 
     * @param {*} defaultId 
     * @returns 
     */
    drawRoute(geometry, defaultColor = "blue", defaultId = null) {
        let id = null;
        if (defaultId) {
            id = defaultId;
        } else {
            id = Math.random();
        }
        let color = null;
        if (defaultColor) {
            color = defaultColor;
        } else {
            color = this.getRandomHexColor();
        }
        this.state.map.addLayer({
            id: `${id}`,
            type: 'line',
            source: {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: geometry,
                },
            },
            layout: {
                'line-join': 'round',
                'line-cap': 'round',
            },
            paint: {
                'line-color': `${color}`,
                'line-width': 3,
            },
        });

        return {
            color: color,
            id: id,
        };
    }
    /**
     * function for requesting direction on mapbox api (admin)
     */
    async getDirection() {
        let routes = await MapboxWatcher.nearestNeighbor(this.state.numberOfRiders, this.state.depart_at);
        this.setState({
            routes: routes,
        });
        let direction = [];
        for (const route of routes) {
            const data = {
                start: {
                    center: "",
                },
                destination: [],
                depart_at: this.state.depart_at,
            }
            data.start.center = route[0];
            route.shift();
            data.destination = route;
            const geojson = await MapboxWatcher.search_direction(data);
            const { color, id } = this.drawRoute(geojson.routes[0].geometry);
            direction.push({ geojson: geojson, color: color, id: id });
        }

        let result = await Promise.all(direction);
        this.setState({
            direction: result,
        })
    }
    /**
     * function for marking parcel locations in the map via click event (admin)
     * @param {*} id 
     * @param {*} coordinates 
     */
    addParcelCoordinates(id, coordinates) {
        this.setState((prevState) => ({
            parcelcoordinates: [...prevState.parcelcoordinates, [coordinates.lng, coordinates.lat]],
        }));
        MapboxWatcher.addDestination([coordinates.lng, coordinates.lat]);
        this.state.map.addSource(`${id}`, {
            type: 'geojson',
            data: {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [coordinates.lng, coordinates.lat],
                },
                properties: {
                    description: `Customer-${id}`,
                }
            }
        });
        this.state.map.addLayer({
            id: `parcel-point-${id}`,
            type: 'circle',
            source: `${id}`,
            paint: {
                'circle-radius': 8,
                'circle-color': 'blue',
            },
        })
    }
    /**
     * Functions for calculating distance between two location (utility)
     * @param {*} coord1 
     * @param {*} coord2 
     * @returns 
     */
    calculateDistance(coord1, coord2) {
        const earthRadius = 6371;
        const lat1 = this.toRadians(coord1[1]);
        const lon1 = this.toRadians(coord1[0]);
        const lat2 = this.toRadians(coord2[1]);
        const lon2 = this.toRadians(coord2[0]);
        const dLat = lat2 - lat1;
        const dLon = lon2 - lon1;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadius * c;
        return distance;
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    /**
     * function for repainting route line in the map (admin)
     * @param {string} id 
     * @param {*} route 
     */
    repaint(id, route) {
        console.log("Repainting", id, route);
        let source = this.state.map.getSource(`${id}`);
        let data = {
            type: 'Feature',
            properties: {},
            geometry: route.geometry,
        }
        source.setData(data);
        this.state.map.triggerRepaint();


    }
    /**
     * function for selecting destination via clicking event (admin)
     */
    async selectDestination() {
        this.setState({
            isSelectingDestination: !this.state.isSelectingDestination,
        })
        this.state.map.on('click', (e) => {
            const coordinates = e.lngLat;
            if (this.state.isSelectingDestination)
                this.addParcelCoordinates(Math.random(), coordinates);
            else
                if (this.state.simulating.state) {
                    this.onSimulate(this.state.simulating, coordinates);
                }
        })

    }
    /**
     * function for converting meter to km (utility)
     * @param {*} meter 
     * @returns 
     */
    meter_to_kilamoter(meter = 0) {
        let km = Math.floor(Number(meter) / 1000);
        let m = Math.floor(Number(meter) % 1000);
        return `${km} kilometer and ${m} meters`
    }
    /**
     * function for converting seconds to hour (utility)
     * @param {*} seconds 
     * @returns String
     */
    seconds_to_hour(seconds = 0) {
        let hour = Math.floor(Number(seconds) / 3600);
        let minutes = Math.floor((Number(seconds) % 3600) / 60);
        let remainingSeconds = Number(seconds) % 60;

        return `${hour} h : ${minutes} m : ${Math.floor(remainingSeconds)} s`;
    }
    /**
     * function for chosing route to display (admin)
     * @param {*} geojson 
     * @param {*} color 
     * @param {*} id 
     */
    choosingRouite(geojson, color, id) {
        this.state.map.removeLayer(`${id}`);
        this.state.map.removeSource(`${id}`);
        this.drawRoute(geojson.geometry, color, id);
        geojson.legs.color = color;
        MapboxWatcher.setDirection(geojson.legs[0].steps[0].maneuver.instruction);

    }
    /**
     * function for setting number of riders for the route (admin)
     * @param {*} event 
     */
    onNumberOfRiderChange(event) {
        this.setState({
            numberOfRiders: event.target.value,
        })
    }
    /**
     * function for changing departure time (admin)
     * @param {*} event 
     */
    onDepartureChange(event) {
        this.setState({
            depart_at: event.target.value,
        })
    }
    /**
     * function for requesting new route in api when departure time change (admin)
     * @param {*} index 
     * @param {*} id 
     */
    async onEnter(index, id) {
        let coord = this.state.routes[index];
        let coordinates = [...coord];
        const data = {
            start: {
                center: this.state.routes[index][0],
            },
            destination: [],
            depart_at: this.state.depart_at,
        }
        coordinates.shift();
        data.destination = coordinates;
        data.destination.push(this.state.routes[index][0])
        const geojson = await MapboxWatcher.search_direction(data);
        this.state.map.removeLayer(`${id}`);
        this.state.map.removeSource(`${id}`);
        const { color } = this.drawRoute(geojson.routes[0].geometry, null, id);
        this.setState((prevState) => {
            const myDirection = [...prevState.direction];
            myDirection[index] = { geojson: geojson, color: color, id: id };
            return {
                direction: myDirection,
            }

        });
    }
    /**
     * function for formating date to humar readable (utilities)
     * @param {*} stringDate 
     * @returns 
     */
    formatDateToHumanReadable(stringDate) {
        let date = new Date(stringDate);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        };

        const formatter = new Intl.DateTimeFormat(undefined, options);

        return formatter.format(date);
    }
    /**
     * function for formating date to humar readable (utilities)
     * @param {*} stringDate 
     * @param {*} seconds 
     * @returns 
     */
    formatDateToHumanReadableArrive(stringDate, seconds) {
        let date = new Date(stringDate);
        date.setSeconds(date.getSeconds() + seconds);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        };

        const formatter = new Intl.DateTimeFormat(undefined, options);

        return formatter.format(date);
    }
    /**
     * function for setting up app state for simulation (admin)
     * @param {*} id 
     * @param {*} color 
     * @param {*} route 
     * @param {*} i1 
     * @param {*} i2 
     */
    simulateMove(id, color, route, i1, i2) {
        this.setState({
            simulating: {
                state: true,
                id: id,
                color: color,
                route: route,
                i1: i1,
                i2: i2,
            },
            isSelectingDestination: false,
        })
    }
    /**
     * function for tracking user current location (rider)
     */
    trackingUser() {
        if ('geolocation' in navigator) {
            const marker = new mapboxgl.Marker();
            navigator.geolocation.watchPosition((position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                console.log('Coordinates: [' + longitude + " , " + latitude + "]");

                if (this.state.myPosition !== JSON.stringify([longitude, latitude])) {
                    this.state.map.setCenter([longitude, latitude]);

                    marker.remove();
                    marker.setLngLat([longitude, latitude])
                        .addTo(this.state.map);
                    let route = {
                        i1: 0,
                        id: "1",
                    }
                    this.onSimulate(route, { lng: longitude, lat: latitude });
                    this.setState({
                        myPosition: JSON.stringify([longitude, latitude]),
                    })
                } else {
                    console.log("User is not moving");
                }
            }, function (error) {
                console.error('Error getting location:', error);
            }, {
                enableHighAccuracy: true,  // Request high accuracy
                timeout: 20000,            // Set a timeout for the request
                maximumAge: 1000           // Specify maximum age of cached position
            });
        } else {
            console.log("Navigastions is not supported");
        }
    }
    /**
     * function for setting users role on the app in input(utility)
     * @param {*} event 
     */
    onSettingRole(event) {
        this.setState({
            role: event.target.value
        })
    }
    /**
     * function for setting up user role in the state (utility)
     */
    setRole() {
        if (this.state.role === "rider") {
            this.setState({
                isRider: true,
                isSelectingRole: false,
            })
        } else {
            this.setState({
                isSelectingRole: false,
            })
        }
    }
    /**
    * function for simulating user movement on the map by clicking (admin)
    * @param {*} route 
    * @param {*} userCoordinates 
    */
    async onSimulate(route, userCoordinates, first) {
        if (this.calculateDistance(this.state.routes[route.i1][0], [userCoordinates.lng, userCoordinates.lat]) < 0.10) {
            console.log("Reach Destination");
            this.state.routes[route.i1].shift();
        }
        // const data = {
        //     start: {
        //         center: [userCoordinates.lng, userCoordinates.lat],
        //     },
        //     destination: this.state.routes[route.i1],
        //     depart_at: this.state.depart_at,
        // }
        // const geojson = await MapboxWatcher.search_direction(data);
        // this.state.map.removeLayer(`${route.id}`);
        // this.state.map.removeSource(`${route.id}`);
        // const { color } = this.drawRoute(geojson.routes[0].geometry, null, route.id);
        // MapboxWatcher.setDirection(geojson.routes[0].legs[0].steps[0].maneuver.instruction);
        // this.setState((prevState) => {
        //     const myDirection = [...prevState.direction];
        //     myDirection[route.i1] = { geojson: geojson, color: color, id: route.id };
        //     return {
        //         direction: myDirection,
        //     }

        // });

        const updateCoordinates = (newCoordinates) => {
            this.setState(prevState => ({
                direction: prevState.direction.map(directionItem => ({
                    ...directionItem,
                    geojson: {
                        ...directionItem.geojson,
                        routes: directionItem.geojson.routes.map(routeItem => ({
                            ...routeItem,
                            geometry: {
                                ...routeItem.geometry,
                                coordinates: newCoordinates
                            }
                        }))
                    }
                }))
            }), () => {
                this.repaint(route.id, this.state.direction[0].geojson.routes[0]);
            });
        }
        const coordinateClone = [...this.state.direction[0].geojson.routes[0].geometry.coordinates]
        if (first) {
            coordinateClone[0] = [userCoordinates.lng, userCoordinates.lat];
            updateCoordinates(coordinateClone);
        } else {
            let distance = this.calculateDistance([userCoordinates.lng, userCoordinates.lat], coordinateClone[1]);
            if (distance <= 0.05) {
                coordinateClone.shift();
                coordinateClone[0] = [userCoordinates.lng, userCoordinates.lat];
            } else {
                coordinateClone[0] = [userCoordinates.lng, userCoordinates.lat];
            }
            updateCoordinates(coordinateClone);
        }

    }
    // async simulateTracker() {
    //     function delay(ms) {
    //         return new Promise(resolve => setTimeout(resolve, ms));
    //     }
    //     console.log("simulating", coordinatesSimulate);
    //     const marker = new mapboxgl.Marker();
    //     marker.setLngLat(coordinatesSimulate[0])
    //         .addTo(this.state.map);
    //     await delay(5000);
    //     for (let i = 0; i < coordinatesSimulate.length; i++) {

    //         this.state.map.setCenter(coordinatesSimulate[i]);
    //         marker.remove();
    //         marker.setLngLat(coordinatesSimulate[i])
    //             .addTo(this.state.map);
    //         let route = {
    //             i1: 0,
    //             id: "1",
    //         }
    //         this.onSimulate(route, { lng: coordinatesSimulate[i][0], lat: coordinatesSimulate[i][1] }, i == 0);
    //         this.setState({
    //             myPosition: JSON.stringify(coordinatesSimulate[i]),
    //         })
    //         await delay(200);
    //     }

    // }
    componentDidMount() {

        const localDate = new Date();
        const localTimeZoneOffset = localDate.getTimezoneOffset();
        localDate.setMinutes(localDate.getMinutes() - localTimeZoneOffset);
        const localISOString = localDate.toISOString().slice(0, 16);
        this.setState({
            depart_at: localISOString,
        });
        console.log("COmponend mount location.jsx");
        mapboxgl.accessToken = "pk.eyJ1IjoibnVjbGV1czA0IiwiYSI6ImNsbzNiamQwOTFzaXMydHFoanZ3cTlhNW0ifQ.1906DN37UWNVKBWmMNGUyg";
        this.setState({
            map: new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [-74.5, 40],
                zoom: 9,
            })
        })
        // this.onUserLocationPick();
    }

    /**
     * function for simulating route drawing on the map (rider)
     */
    async drawRiderRoute() {
        console.log("drawing route");
        const geometry = {
            type: "LineString",
            coordinates: [
                [121.38794, 14.441728],
                [121.388176, 14.441853],
                [121.388551, 14.442228],
                [121.38874, 14.442218],
                [121.389002, 14.441923],
                [121.389091, 14.441894],
                [121.389283, 14.441937],
                [121.389875, 14.44229],
                [121.389985, 14.442459],
                [121.389965, 14.443022],
                [121.390098, 14.443287],
                [121.390177, 14.443344],
                [121.390268, 14.443362],
                [121.390754, 14.44314],
                [121.391076, 14.443099],
                [121.391156, 14.443057],
                [121.391219, 14.44295],
                [121.390903, 14.442132],
                [121.390935, 14.441871],
                [121.391019, 14.441771],
                [121.391227, 14.441613],
                [121.391391, 14.44155],
                [121.391789, 14.441547],
                [121.391907, 14.441514],
                [121.392123, 14.44133],
                [121.392382, 14.440961],
                [121.392824, 14.440793],
                [121.392892, 14.440725],
                [121.392951, 14.440601],
                [121.393078, 14.439893],
                [121.39308, 14.439625],
                [121.393147, 14.439466],
                [121.393364, 14.439206],
                [121.393754, 14.43889],
                [121.393971, 14.43881],
                [121.394379, 14.43885],
                [121.394692, 14.438682],
                [121.395048, 14.438582],
                [121.395217, 14.438605],
                [121.395299, 14.438691],
                [121.395307, 14.439053],
                [121.395442, 14.439282],
                [121.395983, 14.439559],
                [121.396156, 14.439711],
                [121.396262, 14.439867],
                [121.396282, 14.439995],
                [121.396229, 14.440725],
                [121.396144, 14.440864],
                [121.395531, 14.441515],
                [121.395448, 14.441739],
                [121.395462, 14.441858],
                [121.395519, 14.441943],
                [121.396056, 14.442331],
                [121.396201, 14.442346],
                [121.396644, 14.442269],
                [121.396894, 14.442301],
                [121.397272, 14.442087],
                [121.397485, 14.441863],
                [121.397326, 14.441137],
                [121.397367, 14.440777],
                [121.397532, 14.440428],
            ]
        };

        const marker = new mapboxgl.Marker();
        marker.setLngLat([geometry.coordinates[0][0], geometry.coordinates[0][1]])
            .addTo(this.state.map);
        this.state.map.setCenter([geometry.coordinates[0][0], geometry.coordinates[0][1]]);

        const markerDestination = new mapboxgl.Marker({ "color": "#b40219" });
        markerDestination.setLngLat([121.39574491473905, 14.44202454820244])
            .addTo(this.state.map);
        const markerDestination2 = new mapboxgl.Marker({ "color": "#b40219" });
        markerDestination2.setLngLat([121.394379, 14.43885])
            .addTo(this.state.map);

        let start = [121.388033, 14.441528];
        let destination = [121.39574491473905, 14.44202454820244];
        const data = {
            start: {
                center: start,
            },
            destination: [destination],
            depart_at: this.state.depart_at,
        }
        let routes = [[[121.397532, 14.440428]]]
        this.setState({
            routes: routes,
        })
        let direction = [];
        const geojson = await MapboxWatcher.search_direction(data);
        const { color, id } = this.drawRoute(geojson.routes[0].geometry, "blue", "1");
        direction.push({ geojson: geojson, color: color, id: id });
        let result = await Promise.all(direction);
        this.setState({
            direction: result,
        }, () => {
            // this.simulateTracker();
            this.trackingUser();
        })
    }

    render() {
        MapboxWatcher.initiateWatch("location");
        return (
            <div className="location-form-container">
                {
                    this.state.isSelectingRole ?
                        <div>
                            <input className="input-starting-point margin-top-10" type="text" value={this.state.role} onChange={this.onSettingRole.bind(this)} placeholder="Your Role" />
                            <br />
                            <button className="location-search-button margin-top-10 button-green" onClick={this.setRole.bind(this)}>Enter</button>
                        </div> : null
                }
                {
                    this.state.isRider ?
                        !this.state.isSelectingRole &&
                        <div>
                            <button className="location-search-button margin-top-10 button-green" onClick={this.drawRiderRoute.bind(this)}>Simulate</button>
                        </div>
                        :
                        !this.state.isSelectingRole && <div className="search-box-container-location">
                            <p style={{ textAlign: "center", fontSize: "16pt", fontWeight: "900", margin: "0" }}>Directions</p>
                            <input type="text" name="starting_point_location" onChange={this.onLocationChange.bind(this)} value={this.state.starting_point_location} className="input-starting-point margin-top-10" placeholder="Your depot" />
                            <input onChange={this.onNumberOfRiderChange.bind(this)} value={this.state.numberOfRiders} type="number" name="starting_point_location" className="input-starting-point margin-top-10" placeholder="Number of delivery man" />
                            <button className="location-search-button margin-top-10 button-green" onClick={this.getDirection.bind(this)}>Go</button>
                            <button className="location-search-button margin-top-10 button-green" onClick={this.selectDestination.bind(this)}>Select Drop Off location</button>

                            <div className="suggested-place-container margin-top-10 ">
                                {
                                    MapboxWatcher.SuggestedPlace.map((item, index) => {
                                        return (
                                            <div className="location-suggested-item fontsize-11 " key={index} onClick={() => this.state.isSelectingDestination ? this.onSelectingDestination(item) : this.onSelectStartingPoint(item)}>{item.place_name}</div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                }

                {
                    this.state.direction && this.state.direction.map((direction, index) => {
                        return (
                            <div className="route-container margin-top-10" key={index}>

                                {/* <div className="route-item-container margin-top-5" style={{ backgroundColor: direction.color }}>
                                    <p className="font-size-10">Rider {index + 1}</p>
                                    <input type="datetime-local" placeholder="departure" onChange={this.onDepartureChange.bind(this)} /> <button onClick={() => this.onEnter(index, direction.id)}>depart</button>

                                    {
                                        direction.geojson.routes.map((route, index2) => {
                                            return (
                                                <div className="route-item-container margin-top-5" >
                                                    <div onClick={() => this.choosingRouite(route, direction.color, direction.id)} key={index2}>
                                                        <p className="font-weight-600">Route {index2 + 1} {index2 === 0 ? "( fastest )" : ""}</p>
                                                        <p className="font-size-10">Depart at: {this.formatDateToHumanReadable(direction.geojson.depart_at)}</p>
                                                        <p className="font-size-10">Arrive at: {this.formatDateToHumanReadableArrive(direction.geojson.depart_at, Number(route.duration))}</p>
                                                        <p className="font-size-10">Duration: {this.seconds_to_hour(route.duration)}</p>
                                                        <p className="font-size-10">Duration (if not traffic): {this.seconds_to_hour(route.duration_typical)}</p>
                                                        <p className="font-size-10">Distance: {this.meter_to_kilamoter(route.distance)}</p>
                                                    </div>
                                                    <button onClick={() => this.simulateMove(direction.id, direction.color, route, index, index2)}>Simulate</button>
                                                </div>
                                            )
                                        })
                                    }
                                </div> */}


                            </div>
                        )
                    })
                }
            </div>
        )
    }
}


export default LocationForm;