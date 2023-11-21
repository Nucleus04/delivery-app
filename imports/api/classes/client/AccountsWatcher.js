import { ACCOUNT } from "../../common";
import Client from "./Client";
import Watcher from "./Watcher";
import { Meteor } from "meteor/meteor";

class AccountWatcher extends Watcher {
    #userprofile = null;
    constructor(parent) {
        super(parent);

    }
    get UserProfile() {
        return this.#userprofile;
    }
    setUser(user) {
        this.#userprofile = user;
        this.activateWatcher();
    }
    logIn(username, password) {
        console.log("Logging in", username, password)
        return new Promise((resolve, reject) => {
            this.Parent.login(username, password, (error) => {
                if (error) {
                    console.log(error);
                    alert(error.reason);
                    resolve(false);
                } else {
                    resolve(true);
                }
            })
        })
    }
    retrieveUser() {
        return new Promise((resolve, reject) => {
            this.Parent.callFunc(ACCOUNT.RETRIEVE, Meteor.userId()).then((result) => {
                resolve(result[0]);
            }).catch((error) => {
                console.log(error);
            })
        })
    }


    createProfile(role) {
        return new Promise((resolve, reject) => {
            this.Parent.callFunc(ACCOUNT.CREATE_PROFILE, { userId: Meteor.userId(), role: role }).then((result) => {
                console.log(result);
            }).catch((error) => {
                console.log(error);
            })
        })
    }

}

export default new AccountWatcher(Client);