const SpotifyWebApi = require("spotify-web-api-node");
const ical = require("ical-generator");
const moment = require("moment");

// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
exports.handler = async (event, context) => {
  try {
    const cal = generateCalendar();
    const spotifyApi = buildSpotifyApi();

    // for now we stop the calendar generation to 1 month ago
    const lastDateInThePastToDisplay = moment().subtract(1, "month"); // 03-05
    let dateToFetchBefore = moment(); // 10-05

    do {
      // fetch last 50 played song before now
      const recentlyPlayedTracks = await getRecentlyPlayedTracks(
        spotifyApi,
        dateToFetchBefore
      );

      if (recentlyPlayedTracks.items.length === 0) {
        break;
      }

      for (let i = 0; i < recentlyPlayedTracks.items.length; ++i) {
        const track = recentlyPlayedTracks.items[i];
        const trackNameAlbumArtist = generateEventDescription(track);
        const trackPlayedAt = moment(track.played_at);
        // for next loop, we will fetch song before the oldest one of this loop
        dateToFetchBefore = trackPlayedAt.clone();

        cal.createEvent({
          start: trackPlayedAt,
          end: trackPlayedAt.add(track.track.duration_ms, "millisecond"),
          summary: trackNameAlbumArtist,
          description: track.track.external_urls.spotify,
        });
      }
    } while (dateToFetchBefore > lastDateInThePastToDisplay);

    return {
      statusCode: 200,
      body: cal.toString(),
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};

async function getRecentlyPlayedTracks(spotifyApi, before) {
  console.log(`Calling with ${before}`);
  const recentlyPlayedTracksRequest = await spotifyApi.getMyRecentlyPlayedTracks(
    {
      limit: 50,
      before: before.unix() * 1000,
    }
  );

  return recentlyPlayedTracksRequest.body;
}

function generateEventDescription(track) {
  return `Track: ${track.track.name}, Album: ${
    track.track.album.name
  }, Artist: ${track.track.artists
    .map(function (artist) {
      return artist.name;
    })
    .join(", ")}`;
}

function generateCalendar() {
  return ical({
    domain: "https://spotify-time-machine.netlify.app",
    name: "Spotify Time Machine",
  });
}

function buildSpotifyApi() {
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(process.env.SPOTIFY_ACCESS_TOKEN);

  return spotifyApi;
}
