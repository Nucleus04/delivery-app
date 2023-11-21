import { Meteor } from "meteor/meteor";
import { ACCOUNT } from "../../common";
import { profile } from "../../db";

class AccountMethods {
    methods() {
        return Meteor.methods({
            [ACCOUNT.RETRIEVE]: function (id) {
                console.log(id);
                return profile.find({ userid: id }).fetch()
            },
            [ACCOUNT.CREATE_PROFILE]: function ({ userId, role }) {
                console.log(userId, role);
                return profile.insert({ userid: userId, role: role, availability: true })
            }
        })
    }
}


export default new AccountMethods;