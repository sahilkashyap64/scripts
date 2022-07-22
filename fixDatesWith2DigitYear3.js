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
  
    console.log("Messed Up dates convert(targets m/dd/yy , m/d/yy ,mm/d/yy ,mm/dd/yy)",spaced_dates);
    
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
  let collectionName = "users";

  let db = client.db(dbName);


 let objectIdsArr=[ /^\d{2}\/\d{2}\/\d{2}$/, /^\d{2}\/\d{1}\/\d{2}$/,/^\d{1}\/\d{1}\/\d{2}$/,/^\d{1}\/\d{2}\/\d{2}$/ ];
 // targets m/dd/yy , m/d/yy ,mm/d/yy ,mm/dd/yy

 const agg = [
    {
      $match: {
        'dob': {
            $in: objectIdsArr
        },
        '__t': 'Customer' // only  target Customer role
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
      // all the date to dob string
    }, {
      $count: 'count'
    }
    //returns count
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
  let collectionName = "users";

  let db = client.db(dbName);

  console.log(`Connected to ${dbName} database successfully.`);
 
let objectIdsArr=[ /^\d{2}\/\d{2}\/\d{2}$/, /^\d{2}\/\d{1}\/\d{2}$/,/^\d{1}\/\d{1}\/\d{2}$/,/^\d{1}\/\d{2}\/\d{2}$/ ];
// targets m/dd/yy , m/d/yy ,mm/d/yy ,mm/dd/yy
const targetAll2digityearANdFixUnusalDateConverts=[
    {
      $match: {
        'dob': {
          $in: objectIdsArr
        },
        '__t': 'Customer' // only  target Customer role
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
      /**
       * _id:62d953e458ef6a20fdf30975
      dob:"10/07/86"
     __t:"Customer"
       */
    }, {
      $match: {
        'result': {
          '$gte': new Date('Sat, 01 Jan 2000 00:00:00 GMT'), 
          '$lt': new Date('Wed, 31 Dec 3000 00:00:00 GMT')
        }
      }
      //select the dates between 2000 and 3000, because  mongo can't process year less than 1970
      /**_id:62d953e458ef6a20fdf30a01
         result:2062-12-07T00:00:00.000+00:00 */
    }, {
      $project: {
        'dob': {
          '$dateSubtract': {
            'startDate': '$result',  //use the result of previous stage
            'unit': 'year', 
            'amount': 100
          }
        }
      }
      // subtract 100 years to fix the dates
      /**
         _id:62d953e458ef6a20fdf30a01
         dob:1962-12-07T00:00:00.000+00:00
       */
    }, {
      $addFields: {
        'dob': {
          '$dateToString': {
            'format': '%Y-%m-%d', 
            'date': '$dob'
          }
        }
      }
      /** date to string-> 'format': '%Y-%m-%d', 
       _id:62d953e458ef6a20fdf30a01
        dob:"1962-12-07"
       */
    }, {
      $merge: {
        'into': 'users'
      }
      /**merge the previous result of pipeline with the collection
     * my collection name is "users" yours might be different */
    }
  ];

  const convertallthedates=[
    {
      $match: {
        'dob': {
          $in: objectIdsArr
        }
      }
    }, {
      '$project': {
        'dob': {
          '$dateFromString': {
            'dateString': '$dob', 
            'onError': 'An error occurred', 
            'onNull': 'Input was null or empty'
          }
        }
      }
    }, {
      '$match': {
        'result': {
          '$not': {
            '$gte': new Date('Sat, 01 Jan 2000 00:00:00 GMT'), 
            '$lt': new Date('Wed, 31 Dec 3000 00:00:00 GMT')
          }
        }
      }
      //select converts  dates that are not between 2000 and 3000
    }, {
      '$addFields': {
        'dob': {
          '$dateToString': {
            'format': '%Y-%m-%d', 
            'date': '$dob'
          }
        }
      }
    }, {
      '$merge': {
        'into': 'users'
      }
      /**merge the previous result of pipeline with the collection
     * my collection name is "users" yours might be different */
    }
  ];

  //fix dates that are not between 2000 and 3000
const aggCursor2 = db.collection(collectionName).aggregate(convertallthedates);
await aggCursor2.forEach(res => {
  console.log("aggCursor2 Unusal date convert fixed",res);
 
  
});
// fix dates that are  between 2000 and 3000
const aggCursor = db.collection(collectionName).aggregate(targetAll2digityearANdFixUnusalDateConverts);
await aggCursor.forEach(res => {
  console.log(" aggCursor Unusal date convert fixed",res);
 
  
});

console.log("update AllYearOnlyString");
// client.close();

}
