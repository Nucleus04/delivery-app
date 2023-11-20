import React, { Component } from "react";
import "../stylesheets/Home.css";
import MapboxWatcher from "../../api/classes/client/MapboxWatcher";


class Direction extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        MapboxWatcher.setWatcher(this, "direction");
    }


    render() {
        MapboxWatcher.initiateWatch("direction");
        return (
            <div className="direction-main-container" style={MapboxWatcher.Direction && { background: MapboxWatcher.Direction.color }}>
                <p className="font-size-16 font-weight-600">Directions :</p>
                {
                    MapboxWatcher.Direction ? (
                        <ul style={{ backgroundColor: "white" }}>
                            <li><h3>{MapboxWatcher.Direction}</h3></li>
                            {/* {
                                MapboxWatcher.Direction && MapboxWatcher.Direction.map((legs) => {
                                    return legs.steps.map((steps, index) => {
                                        return (
                                            <li key={index}><h3>{steps.maneuver.instruction}</h3></li>
                                        )
                                    })
                                })
                            } */}
                        </ul>
                    ) : ("")
                }
            </div>
        )
    }
}


export default Direction;