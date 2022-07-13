var CMDQuestion=require('./askQuestion.js');
const MongoClient = require('mongodb').MongoClient;
const DB_URI = "mongodb://localhost:27017/test";
const options = {
  useNewUrlParser: true
};
MongoClient.connect(DB_URI, options, async function (err, client) {
  if (err) {
    console.log("ERROR: Failed to connect to database.");
    console.log(err);
    return;
  }

  let spaced_dates= await findAlldateWithTheFormats(client);

  if (spaced_dates.length!==0) {
  
    console.log("Messed Up date format fix",spaced_dates);
    
    const ans = await CMDQuestion.askQuestion("Press y to fix the issues? ");
    console.log("Input :",ans);
    if(ans.toString().trim() === "y"){
        await updateAlldateWithTheFormat(client);
    }else{
      console.log("unknown input");
    }
    
    
    console.log("Database connection closed .");
      client.close();
  }else{
    console.log("Nothing to fix .");
  console.log("Database connection closed .");
      client.close();
  }

  
 

 


});

async function findAlldateWithTheFormats(client){

  let dbName = DB_URI.split("/", -1).pop();
  let collectionName = "dob";

  let db = client.db(dbName);


 let objectIdsArr=[ /^\d{1}\/\d{1}\/\d{4}$/,
 /^\d{4}\/\d{2}\/\d{2}$/,
 /^\d{2}\/\d{2}\/\d{4}$/,
   /^\d{1}\/\d{2}\/\d{4}$/,
     /^\d{2}\/\d{1}\/\d{4}$/
      ];
 

 const agg = [
    {
      $match: {
        'dob': {
            $in: objectIdsArr
        }
      }
    }, {
      $project: {
        'dob': {
          '$convert': {
            'input': '$dob', 
            'to': 'date', 
            'onError': 'error', 
            'onNull': 'null'
          }
        }
      }
    }, {
      $project: {
        'dob': {
          '$substr': [
            '$dob', 0, 10
          ]
        }
      }
    }, {
      $count: 'count'
    }
  ];
  const aggCursor = db.collection(collectionName).aggregate(agg);
  
let theAgregateResult=[]
  await aggCursor.forEach(res => {
    theAgregateResult.push(res);
    
  });

 
//   console.log('findAlldateWithUnusualYearString count',theAgregateResult);
      return theAgregateResult;

}



async function updateAlldateWithTheFormat(client){

  let dbName = DB_URI.split("/", -1).pop();
  let collectionName = "dob";

  let db = client.db(dbName);

  console.log(`Connected to ${dbName} database successfully.`);
 
let objectIdsArr=[ /^\d{1}\/\d{1}\/\d{4}$/,
/^\d{4}\/\d{2}\/\d{2}$/,
/^\d{2}\/\d{2}\/\d{4}$/,
  /^\d{1}\/\d{2}\/\d{4}$/,
    /^\d{2}\/\d{1}\/\d{4}$/,
      /^\d{4}\-\d{2}\-\d{2}$/ ];
const targetAll2digityearANdFixUnusalDateConverts=[
    {
      $match: {
        'dob': {
          $in: objectIdsArr
        }
      }
    }, {
      $project: {
        'dob': {
          '$convert': {
            'input': '$dob', 
            'to': 'date', 
            'onError': 'error', 
            'onNull': 'null'
          }
        }
      }
    }, {
      $project: {
        'dob': {
          '$substr': [
            '$dob', 0, 10
          ]
        }
      }
    }, {
      $merge: {
        'into': 'dob'
      }
    }
  ];

const aggCursor = db.collection(collectionName).aggregate(targetAll2digityearANdFixUnusalDateConverts);
await aggCursor.forEach(res => {
  console.log("Unusal date convert fixed",res);
 
  
});

console.log("Date formated to yyyy-mm-dd string");
// client.close();

}
