import React from "react";
import logo from "./logo.svg";
import "./App.css";
import SpotifyLogin from "react-spotify-login";

const onSuccess = (response) => console.log(response);
const onFailure = (response) => console.error(response);

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <SpotifyLogin
          clientId="d4f7871dc21442cc985d84881825abc5"
          redirectUri="http://localhost:3000"
          onSuccess={onSuccess}
          onFailure={onFailure}
        />
      </header>
    </div>
  );
}

export default App;
