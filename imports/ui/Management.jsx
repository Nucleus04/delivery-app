import React, { Component } from "react";
import "./stylesheets/Management.css";
import { withTracker } from "meteor/react-meteor-data";
import RouteWatcher from "../api/classes/client/RouteWatcher";
import { PUBLICATION } from "../api/common";
import { useNavigate } from "react-router-dom";


function Management({ routes }) {
    const navigate = useNavigate();
    return (
        <ManagementComponent navigate={navigate} routes={routes} />
    )
}
class ManagementComponent extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        RouteWatcher.setWatcher(this, "management");
        this.state = {
            routeGroup: [],
        }
    }
    groupByRouteClass(arr) {
        return arr.reduce((result, obj) => {
            const routeClass = obj.route_class;

            // Find the array in the result with the matching route_class
            const group = result.find(group => group[0].route_class === routeClass);

            if (group) {
                group.push(obj);
            } else {
                // If no array exists for the route_class, create a new array
                result.push([obj]);
            }

            return result;
        }, []);
    }
    onBachClick() {
        this.props.navigate(`/home`);
    }
    onTrack(routeClass) {
        localStorage.setItem('routeClass', routeClass);
        this.props.navigate(`/home`);
    }
    componentDidUpdate(prevProps) {
        if (prevProps.routes !== this.props.routes) {
            console.log("there is a change in routes, ", this.props.routes);
            if (this.props.routes.length > 0) {
                const groups = this.groupByRouteClass(this.props.routes);
                console.log(groups);
                this.setState({
                    routeGroup: groups,
                })
            }
        }
    }

    render() {
        return (
            <div className="management-main-container">
                <div className="back-button-management" onClick={this.onBachClick.bind(this)}>Back</div>

                <div className="container-section-contianer height-80">
                    <h4>Assigned Route List</h4>
                    {
                        this.state.routeGroup.map((item) => {

                            return (
                                <div className="route-item-management">
                                    <button className="tracking-button" onClick={() => this.onTrack(item[0].route_class)}>track</button>
                                    <p className="margin-0">Assigned Date: {new Date(item[0].created_at).toDateString()}</p>
                                    <p className="margin-0">Number of routes: {item.length}</p>
                                    <p className="margin-0">Route statuses</p>
                                    {
                                        item.map((route) => {
                                            return (
                                                <p className="margin-0">1: <span className={`${route.status}`}><b>{route.status}</b></span></p>
                                            )
                                        })
                                    }
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
    RouteWatcher.initiateWatch("management");
    RouteWatcher.subscribe(PUBLICATION.GET_ROUTES_ADMIN);
    return {
        routes: RouteWatcher.getRoutes(null),
    }
})(Management);