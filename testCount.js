const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
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

  let spaced_dates= await countTheDocs(client); //returns dates with error in array form

  console.log("count",spaced_dates);
 
    console.log("Database connection closed .");
      client.close();
  
 

 


});

async function countTheDocs(client){

  let dbName = DB_URI.split("/", -1).pop();
  let collectionName = "users";

  let db = client.db(dbName);

  console.log(`Connected to ${dbName} database successfully.`);

  const agg = [
    
    {
      '$count': 'count'
    }
  ]



  const aggCursor = db.collection(collectionName).aggregate(agg);
    let totalCount=[]
    // loop through the last pipeline result and push them in the array
  await aggCursor.forEach(res => {
    // console.log("countTheDocs",res);
    totalCount.push(res);
    
  });

  // console.log("Database connection closed .");
  //     client.close();

      return totalCount;

}



