import React from "react";
import { Route, Routes as Routing } from "react-router-dom";
import Home from "./Home";

export default function Routes() {
  return (
    <Routing>
      <Route path="/" element={<Home />} />
      <Route path="/date/*" element={<Home />} />
    </Routing>
  );
}
