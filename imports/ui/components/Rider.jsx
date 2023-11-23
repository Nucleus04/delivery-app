import React, { Component } from "react";
import mapboxgl from "mapbox-gl";
import RiderWatcher from "../../api/classes/client/RiderWatcher";
import RiderOptions from "./RiderOptions";

class Rider extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        RiderWatcher.setWatcher(this, "rider")
        this.state = {
            map: null,
            isMapLoaded: false,
            showOptions: false,
            myMarker: null,
        }
    }
    /**
     * focus and zoom to specified coordinates
     * @param {Array} coordinates 
     */
    focusMap(coordinates) {
        this.state.map.setCenter(coordinates);
        this.state.map.setZoom(15);
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
    trackUserLocationInitial() {
        if ('geolocation' in navigator) {
            const marker = new mapboxgl.Marker({ color: "violet" });
            this.setState({
                myMarker: marker,
            });
            navigator.geolocation.getCurrentPosition((position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                this.state.map.setCenter([longitude, latitude]);
                this.state.map.setZoom(13);
                marker.remove();
                marker.setLngLat([longitude, latitude])
                    .addTo(this.state.map);
                this.setState({
                    myPosition: JSON.stringify([longitude, latitude]),
                })
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

    onShowOptions() {
        this.setState({
            showOptions: !this.state.showOptions,
        });

        if (!this.state.showOptions) {
            const target = document.getElementsByClassName("rider-options-container")[0];
            console.log(target);
            if (target) {
                target.style.height = "270px"
            }
        } else {
            const target = document.getElementsByClassName("rider-options-container")[0];
            console.log(target);
            if (target) {
                target.style.height = "0px";
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

    render() {
        return (
            <div className="location-form-container">
                <div className="justify-item">
                    {
                        this.state.showOptions ?
                            <svg onClick={this.onShowOptions.bind(this)} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-arrow-down-square-fill" viewBox="0 0 16 16"> <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm6.5 4.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5a.5.5 0 0 1 1 0z" /> </svg>
                            :
                            <svg onClick={this.onShowOptions.bind(this)} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-arrow-up-square-fill" viewBox="0 0 16 16"> <path d="M2 16a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2zm6.5-4.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 1 0z" /> </svg>
                    }
                </div>
                <div className={`rider-options-container`}>
                    <RiderOptions isMapLoaded={this.state.isMapLoaded} map={this.state.map} myMarker={this.state.myMarker} />
                </div>
            </div>
        )
    }
}


export default Rider;