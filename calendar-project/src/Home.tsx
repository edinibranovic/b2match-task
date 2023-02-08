import Calendar from "./components/Calendar";
import React from "react";
const Home = () => {
  return (
    <div className="w-full h-full flex flex-col text-green-600 from-green-50 via-green-100 to-green-200 bg-gradient-to-br">
      <h1 className="text-xl py-4 w-full text-center">Edin's calendar</h1>
      <Calendar />
    </div>
  );
};
export default Home;
