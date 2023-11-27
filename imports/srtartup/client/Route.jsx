import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../../ui/Login";
import Home from "../../ui/Home";
import Management from "../../ui/Management";



function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route exact path="/" element={<Login />} />
                <Route exath path="/home/:routeClass" element={<Home />} />
                <Route exath path="/home" element={<Home />} />
                <Route exath path="/manage" element={<Management />} />
            </Routes>
        </BrowserRouter>
    )
}

export default Router;