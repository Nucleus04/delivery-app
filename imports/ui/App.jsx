import React, { Component } from 'react';
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import MapboxWatcher from '../api/classes/client/MapboxWatcher';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        MapboxWatcher.setWatcher(this, "direction");
        this.state = {
            starting_point: "",
            suggested_places: [],
            start: {
                name: "",
                center: null,
            },
            destination: [],
            end_point: "",
            profile: "",
            route_number: 0,
        }
    }
    async onChange(event) {
        const { name, value } = event.target;
        this.setState({
            [name]: value,
        });
        let result = await MapboxWatcher.search_place(value);

        if (result) {
            this.setState({
                suggested_places: result.features,
            })
        }
    }
    onSelectStartPoint(place) {
        this.setState({
            start: {
                name: place.place_name,
                center: place.center,
            },
            suggested_places: []
        })

    }
    onSelectedDestination(place) {
        this.setState((prevState) => ({
            destination: [...prevState.destination, { name: place.place_name, center: place.center }],
            suggested_places: [],
            end_point: "",
        }))
    }
    profileChange(event) {
        console.log(event.target.value);
        this.setState({
            profile: event.target.value,
        })
    }
    onseekDirection() {
        let request = {
            start: this.state.start,
            destination: this.state.destination,
            profile: this.state.profile,
        }
        console.log(request);
        MapboxWatcher.search_direction(request);
    }
    meter_to_kilamoter(meter = 0) {
        let km = Math.floor(Number(meter) / 1000);
        let m = Math.floor(Number(meter) % 1000);
        return `${km} kilometer and ${m} meters`
    }
    componentDidMount() {
        mapboxgl.accessToken = "pk.eyJ1IjoibnVjbGV1czA0IiwiYSI6ImNsbzNiamQwOTFzaXMydHFoanZ3cTlhNW0ifQ.1906DN37UWNVKBWmMNGUyg";
        const map = new mapboxgl.Map({
            container: 'map', // Replace with your container ID
            style: 'mapbox://styles/mapbox/streets-v12', // Use your desired map style
            center: [-74.5, 40], // Initial coordinates
            zoom: 9, // Initial zoom level
        })

        const direction = new MapboxDirections({
            accessToken: "pk.eyJ1IjoibnVjbGV1czA0IiwiYSI6ImNsbzNiamQwOTFzaXMydHFoanZ3cTlhNW0ifQ.1906DN37UWNVKBWmMNGUyg"
        })
        map.addControl(direction, "top-left");

        fetch('https://api.mapbox.com/directions/v5/mapbox/driving-traffic/-84.518641,39.134270;-84.512023,39.102779?steps=true&geometries=geojson&access_token=pk.eyJ1IjoibnVjbGV1czA0IiwiYSI6ImNsbzNiamQwOTFzaXMydHFoanZ3cTlhNW0ifQ.1906DN37UWNVKBWmMNGUyg').then(async (result) => {
            console.log(result);
            let data = await result.json();
            console.log(data)
        }).catch((error) => {
            console.log(error);
        })
    }
    seconds_to_hour(seconds) {
        let hour = Math.floor(Number(seconds) / 3600)
        let minutes = Math.floor((Number(seconds) % 3600) / 60);

        return `${hour} h : ${minutes} : m`;
    }
    onRoutePick(index) {
        this.setState({
            route_number: index,
        })
    }
    render() {
        MapboxWatcher.initiateWatch("direction");
        console.log(MapboxWatcher.Direction);
        return (
            <div>
                <h1>Map</h1>
                <div id='map' style={{ width: "700px", height: "400px" }}></div>
                <label>Profile</label> <br />
                <input type="radio" name="profile" value={"driving-traffic"} onChange={this.profileChange.bind(this)} checked={this.state.profile === "driving-traffic"} /> Traffic
                <input type="radio" name="profile" value={"driving"} onChange={this.profileChange.bind(this)} checked={this.state.profile === "driving"} /> Driving
                <input type="radio" name="profile" value={"cycling"} onChange={this.profileChange.bind(this)} checked={this.state.profile === "cycling"} /> Cycling
                <input type="radio" name="profile" value={"walking"} onChange={this.profileChange.bind(this)} checked={this.state.profile === "walking"} /> Walking
                <br />
                <br />
                {
                    this.state.start.name !== "" ? <div><b>Starting Point: </b><span>{this.state.start.name}</span></div> :
                        (
                            <div>
                                <label htmlFor="">Starting Point : </label>
                                <input type="text" value={this.state.starting_point} name='starting_point' onChange={this.onChange.bind(this)} />
                                <div>
                                    <ul>
                                        {
                                            this.state.suggested_places.map((item) => {
                                                return (
                                                    <li onClick={() => this.onSelectStartPoint(item)} key={item.id}>{item.place_name}</li>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                            </div>

                        )
                }
                <br />
                {
                    this.state.destination.length > 0 ? (
                        <div>
                            <p><b>Selected destinations:</b></p>
                            <ul>
                                {
                                    this.state.destination.map((item) => {
                                        return (
                                            <li>{item.name}</li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    ) : ""
                }
                <label htmlFor="">Destinations : </label>
                <input type="text" value={this.state.end_point} name='end_point' onChange={this.onChange.bind(this)} />
                {
                    this.state.start.center ?
                        <div>
                            <ul>
                                {
                                    this.state.suggested_places.map((item) => {
                                        return (
                                            <li onClick={() => this.onSelectedDestination(item)} key={item.id}>{item.place_name}</li>
                                        )
                                    })
                                }
                            </ul>
                        </div> : ""
                }

                <br /><br /><button onClick={this.onseekDirection.bind(this)}><h2>Direction</h2></button> <br /><br />
                {
                    MapboxWatcher.Direction && MapboxWatcher.Direction.routes ? MapboxWatcher.Direction.routes.map((route, index) => {
                        return (
                            <span key={index} onClick={() => this.onRoutePick(index)}><button>Route {index + 1}</button></span>
                        )
                    }) : ""
                }
                {
                    MapboxWatcher.Direction && MapboxWatcher.Direction.routes ? MapboxWatcher.Direction.routes.map((route, index) => {
                        return (
                            <div key={index} style={this.state.route_number === index ? {} : { display: 'none' }}>
                                <input type='text' />
                                <p>hello</p>
                                <h1>Route {index + 1}</h1>
                                <p><b>Duration : </b>{this.seconds_to_hour(route.duration)}</p>
                                <p><b>Distance : </b>{this.meter_to_kilamoter(route.distance)}</p>

                                <h3>Directions</h3>
                                <ul>
                                    {
                                        route.legs[0].steps.map((element) => {
                                            return (
                                                <li key={Math.random()}>{element.maneuver.instruction}</li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>
                        )
                    }) : ""
                }
            </div>
        )
    }
}