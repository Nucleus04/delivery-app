import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../../ui/Login";
import Home from "../../ui/Home";



function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route exact path="/" element={<Login />} />
                <Route exath path="/home" element={<Home />} />
            </Routes>
        </BrowserRouter>
    )
}

export default Router;