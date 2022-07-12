var dictionary = require('dictionary-en')
var nspell = require('nspell')

dictionary(ondictionary)
var spell;
 function ondictionary(err, dict) {
  if (err) {
    throw err
  }
   spell = nspell(dict)

}

function LookForSuggestion(arg){
   
   return arg.map(myFunctionForSuggestion);
  
 

}
function myFunctionForSuggestion(item) {

    return spell.suggest(item);
  }

module.exports = {LookForSuggestion};