const axios = require('axios');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    let q = '%23chicfila'
    await axios({
        method: 'get',
        url: 'https://api.twitter.com/1.1/search/tweets.json?q='+q,
        headers: {'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAAEDXCgEAAAAAaTXfaC8BxVBzg3Grxe1n1cmcuAs%3DTy1Ruv9lpXZzYJrTNrqAnKMsKyeEUT4JHvwxjvNdyDmEGilbkc'}
      })
    .then(function (response) {
        context.log("Received successful response from Twitter API..")
        context.log(response.data);
        context.done();
    })
    .catch(function (error) {
        context.log(error);
        context.done();
    });
};