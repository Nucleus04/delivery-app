import { Mongo } from "meteor/mongo";

export const profile = new Mongo.Collection('profile', {
    idGeneration: "MONGO",
});


export const route = new Mongo.Collection('routes', {
    idGeneration: "MONGO",
})