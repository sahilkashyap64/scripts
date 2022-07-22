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
  let collectionName = "users";

  let db = client.db(dbName);


  const agg = [
    {
      '$match': {
        'dob': new RegExp('^[0-9]*$'), //date with only numbers eg:year

      '__t': 'Customer' // only  target Customer role
      }
      /**
       * _id:62d953e458ef6a20fdf30f53
        dob:"1983"
        __t:"Customer"
       */
    }, {
      '$count': 'count'
    }
    /**
     * count:7
     */
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
  let collectionName = "users";

  let db = client.db(dbName);

const checkAndMergeTheContent=[
  {
    '$match': {
      'dob': new RegExp('^[0-9]*$'), //dates with only number

      '__t': 'Customer' // only  target Customer role
    }
  }, {
    '$project': {
      'dob': {
        '$concat': [
          '$dob', '-', '01', '-', '01'
        ]
      }
    }
    /**Output
      _id:62d953e458ef6a20fdf30f53
       dob:"1983-01-01"
     */
  }, {
    '$merge': {
      'into': 'users'
    }
    /**
     * merge the previous result of pipeline with the collection
     * my collection name is "users" yours might be different
     */
  }
];

const aggCursor = db.collection(collectionName).aggregate(checkAndMergeTheContent);
await aggCursor.forEach(res => {
  console.log("Year only dates fixed",res);
 
  
});

console.log("YYYY concated with 01-01");
// client.close();

}
