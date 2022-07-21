const MongoClient = require('mongodb').MongoClient;
const DB_URI = "mongodb://localhost:27017/test";
const options = {
  useNewUrlParser: true
};
var spellChecker = require('./checkingSpelling.js');
MongoClient.connect(DB_URI, options, async function (err, client) {
  if (err) {
    console.log("ERROR: Failed to connect to database.");
    console.log(err);
    return;
  }

  let spaced_dates= await findDatesWithSpace(client); //returns dates with error in array form
  if (spaced_dates.length!==0) {
  // fix the dates manually and rerun the script
    console.log("The messed up String dates",spaced_dates);
    
    let theMessedUpMonth=[];
    spaced_dates.forEach(res => {
      
      let m1 = res.dob.split(" ")[0];
      theMessedUpMonth.push(m1);
      
    });
    console.log("ProbablytheMessedUpMonth",theMessedUpMonth);
    console.log("PossibleFix of spellings",spellChecker.LookForSuggestion(theMessedUpMonth)); 
    console.log("Kindly manually fix these entries using _id"); 
    console.log("Database connection closed .");
      client.close();
  }else{
  // all dates with spaces conversion was successfully, so update the strings
   await updateAlldateString(client);
    console.log("Database connection closed .");
      client.close();

  }
 

 


});

async function findDatesWithSpace(client){

  let dbName = DB_URI.split("/", -1).pop();
  let collectionName = "dob";

  let db = client.db(dbName);

  console.log(`Connected to ${dbName} database successfully.`);

  const agg = [
    {
      '$match': {
        'dob': new RegExp(' '), //gets all the dates with spaces
        '__t': 'Customer' // only  target Customer role
      }
    }, {
      '$project': {
        'dob': 1, 
        'dob2': {
          '$convert': {
            'input': '$dob', 
            'to': 'date', 
            'onError': 'error', 
            'onNull': 'Input Error'
          }
        }
      }

        /** output
           _id:62d953e458ef6a20fdf30a23
            dob:"May 22, 1986"
           dob2:1986-05-22T00:00:00.000+00:00
           */  
    }, {
      '$project': {
        'dob': 1, 
        'dob2': {
          '$substr': [
            '$dob2', 0, 10
          ]
        }
      }


        /** output
         * dates to string and remove the timezone part
         _id:62d953e458ef6a20fdf30a23
         dob:"May 22, 1986"
        dob2:"1986-05-22"
         */

    }, {
      '$match': {
        'dob2': 'error'
      }
      /**
       _id:62d953e458ef6a20fdf30ac0
       dob:"Decemeber 03 1993"
       dob2:"error"
       */
    }, 
    // {
    //   '$count': 'count'
    // }
  ]



  const aggCursor = db.collection(collectionName).aggregate(agg);
    let theMessedUpIds=[]
    // loop through the last pipeline result and push them in the array
  await aggCursor.forEach(res => {
    // console.log("findDatesWithSpace",res);
    theMessedUpIds.push(res);
    
  });

  // console.log("Database connection closed .");
  //     client.close();

      return theMessedUpIds;

}



async function updateAlldateString(client){

  let dbName = DB_URI.split("/", -1).pop();
  let collectionName = "dob";

  let db = client.db(dbName);

  console.log(`Connected to ${dbName} database successfully.`);
const checkAndMergeTheContent=[
  {
    '$match': {
      'dob': new RegExp(' '), //date with spaces
      '__t': 'Customer' // only  target Customer role
    }
  }, {
    '$project': {
      'dob': {
        '$convert': {
          'input': '$dob', 
          'to': 'date', 
          'onError': 'error', 
          'onNull': 'Input Error'
        }
      }
    }
    /***
     * 
     * Project/overwrite, the dob column with new format date column
     
       _id:62d953e458ef6a20fdf30a23
        dob:1986-05-22T00:00:00.000+00:00

        OR 

        _id:62d953e458ef6a20fdf30ac0
        dob:"error"
     */
  }, {
    '$match': {
      'dob': {
        '$not': new RegExp('error')
      }
    }
    /**
     * Get the dob with not error
     * _id:62d953e458ef6a20fdf30a23
       dob:1986-05-22T00:00:00.000+00:00
     */
  }, {
    '$project': {
      'dob': {
        '$substr': [
          '$dob', 0, 10
        ]
      }
    }
    /**
     * dates to string and remove the timezone part
     * _id:62d953e458ef6a20fdf30a23
       dob:"1986-05-22"
     */
  }, {
    '$merge': {
      'into': 'dob'
    }

    /**NOTE:
     * merge the previous result of pipeline with the collection
     * my collection name is "dob" yours might be "users"
     */

  }
];

const aggCursor = db.collection(collectionName).aggregate(checkAndMergeTheContent);
await aggCursor.forEach(res => {
  console.log("space dates fixed",res);
 
  
});

console.log("updateAlldateString Database connection closed.");
// client.close();

}
