const SpotifyWebApi = require("spotify-web-api-node");

// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
exports.handler = async (event, context) => {
  try {
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken("//REMOVED");
    const recentlyPlayedTracks = await spotifyApi.getMyRecentlyPlayedTracks({
      limit: 10,
      offset: 20,
    });
    return {
      statusCode: 200,
      body: JSON.stringify(recentlyPlayedTracks),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};
