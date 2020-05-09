const SpotifyWebApi = require("spotify-web-api-node");
const ical = require("ical-generator");
const moment = require("moment");

// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
exports.handler = async (event, context) => {
  try {
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(process.env.SPOTIFY_ACCESS_TOKEN);
    const recentlyPlayedTracks = await spotifyApi.getMyRecentlyPlayedTracks({
      limit: 10,
    });

    const cal = ical({
      domain: "https://spotify-time-machine.netlify.app",
      name: "Spotify Time Machine",
    });

    recentlyPlayedTracks.body.items.map(function (track) {
      return cal.createEvent({
        start: moment(track.played_at),
        end: moment().add(1, "hour"),
        description: `Track: ${track.track.name}, Album: ${
          track.track.album.name
        }, Artist: ${track.track.artists
          .map(function (artist) {
            return artist.name;
          })
          .join(", ")}`,
      });
    });

    return {
      statusCode: 200,
      body: cal.toString(),
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};
