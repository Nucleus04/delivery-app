import React, { Component } from "react";
import "./stylesheets/Home.css";
import LocationForm from "./components/LocationForm";
import MapboxWatcher from "../api/classes/client/MapboxWatcher";
import Direction from "./components/Directions";
import { Meteor } from "meteor/meteor";
import AccountsWatcher from "../api/classes/client/AccountsWatcher";
import Rider from "./components/Rider";

class Home extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        MapboxWatcher.setWatcher(this, "location");
        AccountsWatcher.setWatcher(this, "location");
        this.state = {
            map: null,
            role: null,
        }
    }
    async componentDidMount() {
        console.log("Mounting home");
        let user = await AccountsWatcher.retrieveUser();
        this.setState({
            role: user.role,
        })
    }
    render() {
        console.log(this.state.map);
        MapboxWatcher.initiateWatch("location");
        AccountsWatcher.initiateWatch("location");
        return (
            <div className="main-container" id="map">
                <div className="menu-container">
                    {
                        this.state.role === "rider" ? <Rider mapObject={this.state.map} />
                            :
                            this.state.role === "admin" ?

                                <LocationForm mapObject={this.state.map} />

                                :
                                null
                    }
                </div>
                {
                    MapboxWatcher.Direction ? <Direction /> : null
                }
            </div>
        )
    }
}



export default Home;