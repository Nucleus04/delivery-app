import Client from "./Client";
import Watcher from "./Watcher";

class AccountWatcher extends Watcher {
    constructor(parent) {
        super(parent);

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

}

export default new AccountWatcher(Client);