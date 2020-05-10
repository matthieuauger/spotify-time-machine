const SpotifyWebApi = require("spotify-web-api-node");
const ical = require("ical-generator");
const moment = require("moment");

async function getRecentlyPlayedTracks(spotifyApi, tracksOffet) {
  const recentlyPlayedTracksRequest = await spotifyApi.getMyRecentlyPlayedTracks(
    {
      limit: 50,
      offset: tracksOffet,
    }
  );

  return recentlyPlayedTracksRequest.body;
}

// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
exports.handler = async (event, context) => {
  try {
    const cal = ical({
      domain: "https://spotify-time-machine.netlify.app",
      name: "Spotify Time Machine",
    });

    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(process.env.SPOTIFY_ACCESS_TOKEN);

    let tracksOffet = 0;
    do {
      const recentlyPlayedTracks = await getRecentlyPlayedTracks(
        spotifyApi,
        tracksOffet
      );
      recentlyPlayedTracks.items.map(function (track) {
        const trackNameAlbumArtist = `Track: ${track.track.name}, Album: ${
          track.track.album.name
        }, Artist: ${track.track.artists
          .map(function (artist) {
            return artist.name;
          })
          .join(", ")}`;

        return cal.createEvent({
          start: moment(track.played_at),
          end: moment(track.played_at).add(
            track.track.duration_ms,
            "millisecond"
          ),
          summary: trackNameAlbumArtist,
          description: track.track.external_urls.spotify,
        });
      });
      tracksOffet += 50;
    } while (tracksOffet < 500); // we fetch 500 tracks in the past

    return {
      statusCode: 200,
      body: cal.toString(),
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};
