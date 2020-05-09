import React, { useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import SpotifyLogin from "react-spotify-login";
import SpotifyWebApi from "spotify-web-api-node";

const onSuccess = (response) => {
  localStorage.setItem("spotify-access-token", response.access_token);
};
const onFailure = (response) => console.error(response);

function App() {
  useEffect(() => {
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(localStorage.getItem("spotify-access-token"));
    spotifyApi.getMyRecentlyPlayedTracks({ limit: 10, offset: 20 }, function (
      err,
      data
    ) {
      if (err) {
        console.error("Something went wrong!");
      } else {
        console.log(data.body);
      }
    });
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {localStorage.getItem("spotify-access-token") === null && (
          <SpotifyLogin
            clientId="d4f7871dc21442cc985d84881825abc5"
            redirectUri="http://localhost:3000"
            onSuccess={onSuccess}
            onFailure={onFailure}
            scope="user-read-recently-played"
          />
        )}
      </header>
    </div>
  );
}

export default App;
