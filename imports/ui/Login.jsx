import React, { Component } from "react";
import { Accounts } from "meteor/accounts-base";
import "./stylesheets/Authentication.css";
import "./stylesheets/Home.css";
import AccountsWatcher from "../api/classes/client/AccountsWatcher";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    return (
        <LoginComponent navigate={navigate} />
    )
}
class LoginComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            role: "",
        }
    }
    async onLogin() {
        let login = await AccountsWatcher.logIn(this.state.username, this.state.password);
        if (login) {
            this.props.navigate("/home");
        } else {
            console.log("Failed to login")
        }
    }
    async onSignup() {
        if (this.state.username && this.state.password) {
            Accounts.createUser({
                username: this.state.username,
                password: this.state.password,
                profile: {
                    role: this.state.role,
                }
            }, (error) => {
                if (error) {
                    alert(error.reason);
                } else {
                    AccountsWatcher.createProfile(this.state.role);
                    this.setState({
                        username: "",
                        password: "",
                        role: ""
                    })
                    alert("Registered Successfully")
                }
            })
        } else {
            alert("Invalid credentials!");
        }
    }
    onInputChange(event) {
        const { name, value } = event.target;
        this.setState({
            [name]: value,
        })
    }
    render() {
        return (
            <div className="login-main-viewport">
                <div className="login-main-container">
                    <h3 style={{ textAlign: "center" }}>Direction App</h3>
                    <input type="text" name="username" onChange={this.onInputChange.bind(this)} value={this.state.username} className="input-starting-point margin-top-10" placeholder="username" />
                    <input type="text" name="password" onChange={this.onInputChange.bind(this)} value={this.state.password} className="input-starting-point margin-top-10" placeholder="password" />
                    <input type="text" name="role" onChange={this.onInputChange.bind(this)} value={this.state.role} className="input-starting-point margin-top-10" placeholder="role" />
                    <button className="location-search-button margin-top-10 button-green" onClick={this.onLogin.bind(this)}>Login</button>
                    <button className="location-search-button margin-top-10 button-green" onClick={this.onSignup.bind(this)} >Sign up</button>
                </div>
            </div>
        )
    }
}



export default Login;