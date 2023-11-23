import React, { Component } from "react";
import { withTracker } from "meteor/react-meteor-data"
import RiderWatcher from "../../api/classes/client/RiderWatcher";
import { PUBLICATION } from "../../api/common";
import mapboxgl from "mapbox-gl";
import { coordinatesSimulate } from "./simulation_data";

const myRouteId = "my-current-route";
class RiderOptions extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        RiderWatcher.setWatcher(this, "rider");
        this.state = {
            myRoute: null,
            isMapLoaded: false,
            myPosition: "",
            myCoordinates: null,
            myRoute: null,
            map: null,
            isStartingDelivery: false,
            myMarker: null,
        }
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
  * Functions for calculating distance between two locations (utility)
  * @param {*} coord1 
  * @param {*} coord2 
  * @returns {number} Distance in meters
  */
    calculateDistance(coord1, coord2) {
        const earthRadius = 6371;  // Radius of the Earth in kilometers
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
        const distance = earthRadius * c * 1000;  // Convert distance to meters
        return distance;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
    * function for tracking user current location (rider)
    */
    trackingUser() {
        if ('geolocation' in navigator) {
            let coord = [];
            navigator.geolocation.watchPosition((position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                console.log('Coordinates: [' + longitude + " , " + latitude + "]");
                coord.push([longitude, latitude]);
                if (this.state.myPosition !== JSON.stringify([longitude, latitude])) {
                    console.log(coord);
                    this.state.map.setCenter([longitude, latitude]);

                    this.state.myMarker.remove();
                    this.state.myMarker.setLngLat([longitude, latitude])
                        .addTo(this.state.map);

                    if (!this.state.isStartingDelivery) {
                        let myDistanceToDepot = this.calculateUserPositionFromDepot([longitude, latitude], this.props.route[0].route.geojson.waypoints[0].location);
                        if (myDistanceToDepot < 50) {
                            console.log("I am 50 meter away depot, switch position");
                            const target = document.getElementsByClassName("rider-options-container")[0];
                            if (target) {
                                target.style.height = "147px"
                            }
                            this.setState({
                                isStartingDelivery: true,
                            }, () => {
                                this.onSimulate({ lng: longitude, lat: latitude });
                            })
                        }
                    } else {
                        this.onSimulate({ lng: longitude, lat: latitude });
                    }
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
    trackUserLocationInitial() {
        if ('geolocation' in navigator) {
            const marker = new mapboxgl.Marker({ color: "violet" });
            this.setState({
                myMarker: marker,
            });
            let coord = [];
            navigator.geolocation.getCurrentPosition((position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                coord.push([longitude, latitude]);
                this.state.map.setCenter([longitude, latitude]);
                this.state.map.setZoom(13);
                marker.remove();
                marker.setLngLat([longitude, latitude])
                    .addTo(this.state.map);

                this.setState({
                    myPosition: JSON.stringify([longitude, latitude]),
                    myCoordinates: [longitude, latitude],
                })

                console.log(coord);
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
    calculateUserPositionFromDepot(mycoordinates, depot) {
        return this.calculateDistance(mycoordinates, depot);
    }
    getLocalDateIso() {
        const localDate = new Date();
        const localTimeZoneOffset = localDate.getTimezoneOffset();
        localDate.setMinutes(localDate.getMinutes() - localTimeZoneOffset);
        const localISOString = localDate.toISOString().slice(0, 16);
        return localISOString;
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
        this.state.map.addSource(id, {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: geometry,
            },
        });
        this.state.map.addLayer({
            id: `${id}-layer`,
            type: 'line',
            source: id,
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
    updateRiderLocationServer(routeId, geojson) {
        RiderWatcher.updateRidersGeojson(routeId, geojson);
    }
    /**
   * function for updating route line in the map when user change location
   * @param {*} route 
   * @param {*} userCoordinates 
   */
    async onSimulate(userCoordinates) {

        const updateCoordinates = (newCoordinates) => {
            this.setState(prevState => ({
                myRoute: {
                    ...prevState.myRoute,
                    routes: prevState.myRoute.routes.map(routeItem => ({
                        ...routeItem,
                        geometry: {
                            ...routeItem.geometry,
                            coordinates: newCoordinates
                        },
                    }))

                }
            }), () => {
                this.updateRiderLocationServer(this.props.route[0]._id, this.state.myRoute);
                this.repaint(myRouteId, this.state.myRoute.routes[0]);
            });
        }
        const updateLeg = (newLeg) => {
            this.setState(prevState => ({
                myRoute: {
                    ...prevState.myRoute,
                    routes: prevState.myRoute.routes.map(routeItem => ({
                        ...routeItem,
                        legs: newLeg,
                    }))

                }
            }));
        }

        const coordinateClone = [...this.state.myRoute.routes[0].geometry.coordinates]
        const legClone = [...this.state.myRoute.routes[0].legs];

        console.log(coordinateClone);
        let distance = 0;

        if (coordinateClone.length > 1) distance = this.calculateDistance([userCoordinates.lng, userCoordinates.lat], coordinateClone[1]);
        if (distance <= 20) {
            coordinateClone.shift();
            coordinateClone[0] = [userCoordinates.lng, userCoordinates.lat];
        } else {
            coordinateClone[0] = [userCoordinates.lng, userCoordinates.lat];
        }

        let distanceFromInstruction = 0;
        if (legClone[0].steps.length > 1) distanceFromInstruction = this.calculateDistance(legClone[0].steps[1].maneuver.location, [userCoordinates.lng, userCoordinates.lat]);

        if (legClone[0].steps.length == 1) distanceFromInstruction = this.calculateDistance(legClone[0].steps[0].maneuver.location, [userCoordinates.lng, userCoordinates.lat]);


        console.log("Distance from next instruction", distanceFromInstruction);
        if (distanceFromInstruction <= 20) {
            if (legClone[0].steps.length > 1) {
                console.log("shifting steps-----------------");
                legClone[0].steps.shift();
                updateLeg(legClone);
            } else {
                if (coordinateClone.length > 1) {
                    console.log("Shifting leg -------------------");
                    legClone.shift();
                    updateLeg(legClone);
                }
            }
        }
        updateCoordinates(coordinateClone);


    }

    /**
    * function for repainting route line in the map (admin)
    * @param {string} id 
    * @param {*} route 
    */
    repaint(id, route) {
        if (this.state.map.isSourceLoaded(id)) {
            let source = this.state.map.getSource(id);
            let data = {
                type: 'Feature',
                properties: {},
                geometry: route.geometry,
            }
            source.setData(data);
            this.state.map.triggerRepaint();
        }
    }
    /**
    * Add marker to specified coordinates in the map
    * @param {*} coordinates 
    */
    addMarker(coordinates) {
        const marker = new mapboxgl.Marker();
        marker.setLngLat(coordinates)
            .addTo(this.state.map);
    }

    /**
     * function for simulation moving user (testing)
     */
    async simulateTracker() {
        const target = document.getElementsByClassName("rider-options-container")[0];
        if (target) {
            target.style.height = "147px"
        }
        this.setState({
            isStartingDelivery: true,
        })

        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        const marker = new mapboxgl.Marker({ color: "violet" });
        marker.setLngLat(coordinatesSimulate[0])
            .addTo(this.state.map);
        for (let i = 0; i < coordinatesSimulate.length; i++) {

            this.state.map.setCenter(coordinatesSimulate[i]);
            marker.remove();
            marker.setLngLat(coordinatesSimulate[i])
                .addTo(this.state.map);

            this.onSimulate({ lng: coordinatesSimulate[i][0], lat: coordinatesSimulate[i][1] });
            this.setState({
                myPosition: JSON.stringify(coordinatesSimulate[i]),
            })
            await delay(200);
        }

    }
    updateDeliveryStatus(routeId, status) {
        RiderWatcher.updateDeliveryStatus(routeId, status);
    }
    /**
     * function will triggered when rider want to start delivering parcel
    */
    async onDeliverClick() {
        if (!this.state.isMapLoaded) {
            alert("Please try again. Map is still loading");
        } else {
            const marker = new mapboxgl.Marker({ color: "red" });
            marker.setLngLat(this.state.myRoute.waypoints[0].location)
                .addTo(this.state.map);
            this.drawRoute(this.props.route[0].route.geojson.routes[0].geometry, "blue", myRouteId);
            for (let i = 0; i < this.props.route[0].route.geojson.waypoints.length; i++) {
                if (i != 0) this.addMarker(this.props.route[0].route.geojson.waypoints[i].location);
            }
            this.trackingUser();
            this.updateDeliveryStatus(this.props.route[0]._id, "ongoing");
        }
    }
    onCompletedRoute() {
        this.updateDeliveryStatus(this.props.route[0]._id, 'delivered');
    }
    componentDidUpdate(prevProps) {
        if (prevProps.isMapLoaded !== this.props.isMapLoaded) {
            this.setState({
                isMapLoaded: this.props.isMapLoaded,
            })
        }

        if (prevProps.route != this.props.route) {
            if (this.props.route.length > 0) {
                this.setState({
                    myRoute: this.props.route[0].route.geojson,
                })
            }
        }

        if (prevProps.map != this.props.map) {
            this.setState({
                map: this.props.map,
            })
        }
    }
    componentDidMount() {
        this.trackUserLocationInitial();
    }
    render() {
        return (
            <div className="option-main-container">
                <div className="assigned-route-container">
                    <div className="direction-container-rider">
                        <p className="font-weight-600" style={{ textAlign: "center" }}>Direction </p>
                        <p className="fontsize-14" style={{ textAlign: "center" }}>{this.state.isStartingDelivery ? this.state.myRoute.routes[0].legs[0].steps[0].maneuver.instruction : "No routes is simulating"}</p>
                    </div>

                    <p className="font-weight-600">Pending Deliveries </p>
                    {
                        this.state.myRoute && this.props.route.map((item) => {
                            return (
                                <div className="route-item-container" key={Math.random()}>
                                    <div>
                                        <p className="font-weight-600">Route </p>
                                        <p className="font-size-10">Duration: {this.seconds_to_hour(item.route.geojson.routes[0].duration)}</p>
                                        <p className="font-size-10">Distance: {this.meter_to_kilamoter(this.state.myRoute.routes[0].distance)}</p>
                                    </div>
                                    <button onClick={this.onDeliverClick.bind(this)}>Deliver</button>
                                    <button onClick={this.simulateTracker.bind(this)}>Simulate</button>
                                    <button onClick={this.onCompletedRoute.bind(this)}>Completed</button>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}



export default withTracker(() => {
    RiderWatcher.initiateWatch("rider");
    RiderWatcher.subscribe(PUBLICATION.GET_ROUTE, Meteor.userId());
    return {
        route: RiderWatcher.getRoutes(),
    }
})(RiderOptions);