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

  let spaced_dates= await findDatesWithYearOnlyCount(client);
  if (spaced_dates.length!==0) {
  
    console.log("Dates with only year count:",spaced_dates);
    
    const ans = await CMDQuestion.askQuestion("Press y to fix the issues? ");
    console.log("Input :",ans);
    if(ans.toString().trim() === "y"){
      await updateAlldateWithYearString(client);
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

async function findDatesWithYearOnlyCount(client){

  let dbName = DB_URI.split("/", -1).pop();
  let collectionName = "dob";

  let db = client.db(dbName);


  const agg = [
    {
      '$match': {
        'dob': new RegExp('^[0-9]*$')
      }
    }, {
      '$count': 'count'
    }
  ]


  const aggCursor = db.collection(collectionName).aggregate(agg);
let theAgregateResult=[]
  await aggCursor.forEach(res => {
    theAgregateResult.push(res);
    
  });

 

      return theAgregateResult;

}



async function updateAlldateWithYearString(client){

  let dbName = DB_URI.split("/", -1).pop();
  let collectionName = "dob";

  let db = client.db(dbName);

const checkAndMergeTheContent=[
  {
    '$match': {
      'dob': new RegExp('^[0-9]*$')
    }
  }, {
    '$project': {
      'dob': {
        '$concat': [
          '$dob', '-', '01', '-', '01'
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
  console.log("Year only dates fixed",res);
 
  
});

console.log("YYYY concated with 01-01");
// client.close();

}
