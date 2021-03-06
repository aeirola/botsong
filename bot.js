var axios = require('axios');
var fs = require('fs');
var markov = require('./vendor/node-markov.js');
var m = markov(1);
m.readExternal(fs.readFileSync('data/scifi.json').toString());

var instance = axios.create({
  baseURL: 'http://rhymebrain.com/',
  timeout: 10000,
  headers: {'X-Custom-Header': 'foobar'}
});

var botsong = {
  onMessage: function(session) {
    var wordToRhyme = lastWord(session.message.text);
    return instance.get('/talk?function=getRhymes&word=' + wordToRhyme)
    .then(function (response) {

      var scoredArray = response.data;

	  scoredArray.sort(function(a, b) {
    	return (Math.round(Math.random()*10) + 1)
 * weightScore(b.score) - (Math.round(Math.random()*10) + 1) * weightScore(a.score);
	  });

	  var textLenght = session.message.text.length

      for (var i = 0 ; i < scoredArray.length; i++ ) {
        var item = scoredArray[i];
        var responseText = buildResponseText(item.word, textLenght);
        if (responseText) {
          return responseText;
        }
      }

      return 'I can\'t come up with anything that rhymes with '  + wordToRhyme;
    })
    .catch(function (response) {
      console.log(response);
      return 'Error';
    });

  }
};

function weightScore(score)
{
	if (score >= 300)
	{
		return score * 10
	} 
	else if (score >= 250) 
	{
		return score * 5
	}
	else if (score >= 200) 
	{
		return score * 3
	}
	else if (score >= 100) 
	{
		return score * 2
	}
	else 
	{
		return score * 1
	}
}

module.exports = botsong;

function lastWord(words) {
    var n = words.split(" ");
    return n[n.length - 1];
}

function buildResponseText(word, length) {
  var key = m.search(word.toLowerCase());
  if (!key) {
    return undefined;
  }

  var responseText = m.backward(key, 10).join(' ') + ' ' + word;

  var textArray = responseText.split(" ");
  var finalText = "";

  var i = textArray.length;
  while (i > 0 ) {
  	i = i - 1;
  	finalText = textArray[i] + " " + finalText
  	if (finalText.length >= length)
  	{
  		break
  	}
  }

  responseText = finalText
  responseText = responseText.charAt(0).toUpperCase() + responseText.slice(1);

  return responseText;
}

