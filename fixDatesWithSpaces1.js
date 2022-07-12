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

  let spaced_dates= await findDatesWithSpace(client);
  if (spaced_dates.length!==0) {
  
    console.log("The messed up String dates",spaced_dates);
    
    let theMessedUpMonth=[];
    spaced_dates.forEach(res => {
      // console.log("findDatesWithSpace",res);
      
      let m1 = res.dob.split(" ")[0];
      theMessedUpMonth.push(m1);
      
    });
    console.log("ProbablytheMessedUpMonth",theMessedUpMonth);
    console.log("PossibleFix",spellChecker.LookForSuggestion(theMessedUpMonth)); 
    console.log("Database connection closed .");
      client.close();
  }else{

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
        'dob': new RegExp(' ')
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
    }, {
      '$project': {
        'dob': 1, 
        'dob2': {
          '$substr': [
            '$dob2', 0, 10
          ]
        }
      }
    }, {
      '$match': {
        'dob2': 'error'
      }
    }, 
    // {
    //   '$count': 'count'
    // }
  ]

  // db
  //   .collection(collectionName)
  //   .aggregate(agg)
  //   .then(res => {
  //     console.log(`${res}   successfully.`);
  //     console.log("Database connection closed.");
  //     client.close();
  //   })
  //   .catch(err => {
  //     console.log(JSON.stringify(err));
  //     console.log("Database connection closed.");
  //     client.close();
  //   });

  const aggCursor = db.collection(collectionName).aggregate(agg);
let theMessedUpIds=[]
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
      'dob': new RegExp(' ')
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
  }, {
    '$match': {
      'dob': {
        '$not': new RegExp('error')
      }
    }
  }, {
    '$project': {
      'dob': {
        '$substr': [
          '$dob', 0, 10
        ]
      }
    }
  }, {
    '$merge': {
      'into': 'dob'
    }
  }
];

const aggCursor = db.collection(collectionName).aggregate(checkAndMergeTheContent);
await aggCursor.forEach(res => {
  console.log("space dates fixed",res);
 
  
});

console.log("updateAlldateString Database connection closed.");
// client.close();

}
function insertDataInCollection(client){
  let dbName = DB_URI.split("/", -1).pop();
  let collectionName = "ping_results";

  let db = client.db(dbName);

  console.log(`Connected to ${dbName} database successfully.`);

  var data = [
    { name: 'John', address: 'Highway 71' }
  ];

  db
    .collection(collectionName)
    .insertMany(data)
    .then(res => {
      console.log(`${res.insertedCount} Documents inserted successfully.`);
      console.log("Database connection closed.");
      client.close();
    })
    .catch(err => {
      console.log(JSON.stringify(err));
      console.log("Database connection closed.");
      client.close();
    });
}