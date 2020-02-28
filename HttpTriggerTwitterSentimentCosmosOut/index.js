const axios = require('axios');

const searchTweets = async function(hashtag) {
    hashtag = '#' + hashtag;
    const responseData = await axios({
        method: 'get',
        url: 'https://api.twitter.com/1.1/search/tweets.json',
        headers: {
            Authorization: `Bearer ${process.env.TWITTER_TOKEN}`
        },
        params: {
            q: hashtag
        }
    });

    // Extract id and text from each english tweet
    let parsedTweets = [];
    responseData.data.statuses.forEach(tweet => {
        if(tweet.lang == 'en')
        {
            parsedTweets.push({
                id: tweet.id_str,
                text: tweet.text
            });
        }
    });
    return parsedTweets;
};

const analyzeTweets = async function(tweetData) {
    const response = await axios({
      url: "https://afctextanalytics.cognitiveservices.azure.com//text/analytics/v2.1/sentiment",
      method: 'post',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.COGNITIVE_SERVICE_API_KEY
      },
      data: {
        documents: tweetData
      }
    });
    return response.data;
};

const summarizeResult = function(tweets, sentiments) {
    let positiveTweets = [];
    let negativeTweets = [];

    sentiments.documents.forEach(tweetSentiment => {
        if (tweetSentiment.score < 0.5) {
            negativeTweets.push(tweets.find(tweet => tweet.id === tweetSentiment.id));
        }
        else
        {
            positiveTweets.push(tweets.find(tweet => tweet.id === tweetSentiment.id));
        }
    });

    const summary = {
        'positiveTweets': positiveTweets,
        'negativeTweets': negativeTweets
    }

    return summary;
};

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if(req.query.hashtag)
    {
        // Search tweets from twitter
        const tweets = await searchTweets(req.query.hashtag);
        // Use Azure cognitve service to analyze tweets 
        const sentiments = await analyzeTweets(tweets);
        // Create result summary
        const summary = summarizeResult(tweets, sentiments);
        context.res = {
            body: summary
        };
    }
    else
    {
        context.res = {
            status: 400,
            body: { message: 'Provide hastag as parameter' }
        };
    }
};