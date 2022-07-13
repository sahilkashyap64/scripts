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

  let spaced_dates= await findAlldateWithUnusualYearString(client);

  if (spaced_dates.length!==0) {
  
    console.log("Messed Up dates convert(b/w year 2000-3000)",spaced_dates);
    
    const ans = await CMDQuestion.askQuestion("Press y to fix the issues? ");
    console.log("Input :",ans);
    if(ans.toString().trim() === "y"){
        await updateAlldateWithUnusualYearString(client);
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

async function findAlldateWithUnusualYearString(client){

  let dbName = DB_URI.split("/", -1).pop();
  let collectionName = "dob";

  let db = client.db(dbName);


 let objectIdsArr=[ /^\d{2}\/\d{2}\/\d{2}$/, /^\d{2}\/\d{1}\/\d{2}$/,/^\d{1}\/\d{1}\/\d{2}$/,/^\d{1}\/\d{2}\/\d{2}$/ ];
 

 const agg = [
    {
      $match: {
        'dob': {
            $in: objectIdsArr
        }
      }
    }, {
      $project: {
        'result': {
          '$dateFromString': {
            'dateString': '$dob', 
            'onError': 'An error occurred', 
            'onNull': 'Input was null or empty'
          }
        }
      }
    }, {
      $match: {
        'result': {
          '$gte': new Date('Sat, 01 Jan 2000 00:00:00 GMT'), 
          '$lt': new Date('Wed, 31 Dec 3000 00:00:00 GMT')
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



async function updateAlldateWithUnusualYearString(client){

  let dbName = DB_URI.split("/", -1).pop();
  let collectionName = "dob";

  let db = client.db(dbName);

  console.log(`Connected to ${dbName} database successfully.`);
 
let objectIdsArr=[ /^\d{2}\/\d{2}\/\d{2}$/, /^\d{2}\/\d{1}\/\d{2}$/,/^\d{1}\/\d{1}\/\d{2}$/,/^\d{1}\/\d{2}\/\d{2}$/ ];
const targetAll2digityearANdFixUnusalDateConverts=[
    {
      $match: {
        'dob': {
          $in: objectIdsArr
        }
      }
    }, {
      $project: {
        'result': {
          $dateFromString: {
            'dateString': '$dob', 
            'onError': 'An error occurred', 
            'onNull': 'Input was null or empty'
          }
        }
      }
    }, {
      $match: {
        'result': {
          '$gte': new Date('Sat, 01 Jan 2000 00:00:00 GMT'), 
          '$lt': new Date('Wed, 31 Dec 3000 00:00:00 GMT')
        }
      }
    }, {
      $project: {
        'dob': {
          '$dateSubtract': {
            'startDate': '$result', 
            'unit': 'year', 
            'amount': 100
          }
        }
      }
    }, {
      $addFields: {
        'dob': {
          '$dateToString': {
            'format': '%Y-%m-%d', 
            'date': '$dob'
          }
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

console.log("update AllYearOnlyString");
// client.close();

}
