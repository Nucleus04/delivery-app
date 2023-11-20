import { Meteor } from 'meteor/meteor'
import { Navigate } from 'react-router-dom';
import React from 'react';

function ProtectedRoute({ element }) {
    const isAuthenticated = Meteor.userId();
    if (isAuthenticated) {
        return <>{element}</>
    } else {
        return <Navigate to="/" replace />
    }
}


export default ProtectedRoute;