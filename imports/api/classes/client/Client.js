import Watcher from "./Watcher";

class Client extends Watcher {
    constructor(props) {
        super(props);
        this.secureTransaction();
    }
}

export default new Client;