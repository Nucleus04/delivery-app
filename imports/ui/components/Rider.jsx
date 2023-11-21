import React, { Component } from "react";
import mapboxgl from "mapbox-gl";
import { withTracker } from "meteor/react-meteor-data";
import RiderWatcher from "../../api/classes/client/RiderWatcher";
import { PUBLICATION } from "../../api/common";
import { Meteor } from "meteor/meteor";
import { coordinatesSimulate } from "./simulation_data";

class Rider extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        RiderWatcher.setWatcher(this, "rider")
        this.state = {
            map: null,
            myRoute: null,
            isMapLoaded: false,
        }
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
        this.state.map.addSource(`route-source`, {
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
            source: `route-source`,
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

                    this.onSimulate({ lng: longitude, lat: latitude });
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
    * function for simulating user movement on the map by clicking (admin)
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
                        }
                    }))

                }
            }), () => {
                this.repaint(this.props.route._id, this.state.myRoute.routes[0]);
            });
        }
        const coordinateClone = [...this.state.myRoute.routes[0].geometry.coordinates]

        let distance = this.calculateDistance([userCoordinates.lng, userCoordinates.lat], coordinateClone[1]);
        if (distance <= 0.05) {
            coordinateClone.shift();
            coordinateClone[0] = [userCoordinates.lng, userCoordinates.lat];
        } else {
            coordinateClone[0] = [userCoordinates.lng, userCoordinates.lat];
        }
        updateCoordinates(coordinateClone);


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
     * function for repainting route line in the map (admin)
     * @param {string} id 
     * @param {*} route 
     */
    repaint(id, route) {
        console.log("Repainting", id, route);
        let source = this.state.map.getSource("route-source");
        console.log("Source", source);
        let data = {
            type: 'Feature',
            properties: {},
            geometry: route.geometry,
        }
        source.setData(data);
        this.state.map.triggerRepaint();


    }
    focusMap(coordinates) {
        this.state.map.setCenter(coordinates);
        this.state.map.setZoom(15);
    }
    addMarker(coordinates) {
        const marker = new mapboxgl.Marker();
        marker.setLngLat(coordinates)
            .addTo(this.state.map);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.route != this.props.route) {
            if (this.state.isMapLoaded) {
                console.log('drawing once');
                this.drawRoute(this.props.route.route.geojson.routes[0].geometry, null, this.props.route._id);
                this.focusMap(this.props.route.route.geojson.waypoints[0].location);
                for (let i = 0; i < this.props.route.route.geojson.waypoints.length; i++) {
                    this.addMarker(this.props.route.route.geojson.waypoints[i].location);
                }
                this.setState({
                    myRoute: this.props.route.route.geojson,
                }, () => {
                    this.trackingUser();
                })
            }
        }

        if (prevState.isMapLoaded !== this.state.isMapLoaded) {
            if (this.state.isMapLoaded && this.props.route) {
                console.log('drawing once');
                this.drawRoute(this.props.route.route.geojson.routes[0].geometry, null, this.props.route._id);
                this.focusMap(this.props.route.route.geojson.waypoints[0].location);
                for (let i = 0; i < this.props.route.route.geojson.waypoints.length; i++) {
                    this.addMarker(this.props.route.route.geojson.waypoints[i].location);
                }
                this.setState({
                    myRoute: this.props.route.route.geojson,
                }, () => {
                    this.trackingUser();
                })
            }
        }
    }

    componentDidMount() {
        mapboxgl.accessToken = "pk.eyJ1IjoibnVjbGV1czA0IiwiYSI6ImNsbzNiamQwOTFzaXMydHFoanZ3cTlhNW0ifQ.1906DN37UWNVKBWmMNGUyg";
        this.setState({
            map: new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [-74.5, 40],
                zoom: 9,
            })
        }, () => {
            this.state.map.on('load', () => {
                console.log("Map is ready");
                this.setState({
                    isMapLoaded: true,
                })
            })
        });

    }

    async simulateTracker() {
        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        console.log("simulating", coordinatesSimulate);
        const marker = new mapboxgl.Marker();
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

    render() {
        return (
            <div className="location-form-container">
                <p>Rider Rider</p>
                <button onClick={this.simulateTracker.bind(this)}>Simulate</button>
            </div>
        )
    }
}


export default withTracker(() => {
    RiderWatcher.initiateWatch("rider")
    RiderWatcher.subscribe(PUBLICATION.GET_ROUTE, Meteor.userId());
    return {
        route: RiderWatcher.getRoutes()[0],
    }
})(Rider);