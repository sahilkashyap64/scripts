const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const DB_URI = "mongodb://localhost:27017";
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

  let dbName = "test";
  let collectionName = "users";

  let db = client.db(dbName);

  console.log(`Connected to ${dbName} database successfully.`);

  const agg =[
    {
      '$facet': {
        'TotalRoleTypeCustomer': [
          {
            '$match': {
              '__t': 'Customer'
            }
          }, {
            '$count': 'Total'
          }
        ], 
        'DatesWithSpaces': [
          {
            '$match': {
              'dob': new RegExp(' '), 
              '__t': 'Customer'
            }
          }, {
            '$count': 'datewithspaces'
          }
        ], 
        'DateWithYearOnly': [
          {
            '$match': {
              'dob': new RegExp('^[0-9]*$'), 
              '__t': 'Customer'
            }
          }, {
            '$count': 'DateWithYearOnly'
          }
        ], 
        'DateWith2DigitYearOnly': [
          {
            '$match': {
              'dob': {
                '$in': [
                  new RegExp('^d{2}\/d{2}\/d{2}$'), new RegExp('^d{2}\/d{1}\/d{2}$'), new RegExp('^d{1}\/d{1}\/d{2}$'), new RegExp('^d{1}\/d{2}\/d{2}$')
                ]
              }, 
              '__t': 'Customer'
            }
          }, {
            '$count': 'DateWith2DigitYearOnly'
          }
        ], 
        'DatestoaFixedFormat': [
          {
            '$match': {
              'dob': {
                '$in': [
                  new RegExp('^d{1}\/d{1}\/d{4}$'), new RegExp('^d{4}\/d{2}\/d{2}$'), new RegExp('^d{2}\/d{2}\/d{4}$'), new RegExp('^d{1}\/d{2}\/d{4}$'), new RegExp('^d{2}\/d{1}\/d{4}$')
                ]
              }, 
              '__t': 'Customer'
            }
          }, {
            '$count': 'DatestoaFixedFormat'
          }
        ], 
        'Datesyyyy-mm-dd': [
          {
            '$match': {
              'dob': {
                '$in': [
                  new RegExp('^d{4}-d{2}-d{2}$')
                ]
              }, 
              '__t': 'Customer'
            }
          }, {
            '$count': 'Dates'
          }
        ]
      }
    }, {
      '$project': {
        'TotalRoleTypeCustomer': {
          '$arrayElemAt': [
            '$TotalRoleTypeCustomer.Total', 0
          ]
        }, 
        'DatesWithSpaces': {
          '$arrayElemAt': [
            '$DatesWithSpaces.datewithspaces', 0
          ]
        }, 
        'DateWithYearOnly': {
          '$arrayElemAt': [
            '$DateWithYearOnly.DateWithYearOnly', 0
          ]
        }, 
        'DatestoaFixedFormat': {
          '$arrayElemAt': [
            '$DatestoaFixedFormat.DatestoaFixedFormat', 0
          ]
        }, 
        'Datesyyyy-mm-dd': {
          '$arrayElemAt': [
            '$Datesyyyy-mm-dd.Dates', 0
          ]
        }
      }
    }
  ];
  //output on mongocompass aggrgation
  //TotalRoleTypeCustomer:16155
// DatesWithSpaces:55
// DateWithYearOnly:7
// DatestoaFixedFormat:2876
// Datesyyyy-mm-dd:13133
//some  the output on cmd is 
//some issue
// count [
//     {
//       TotalRoleTypeCustomer: 16155,
//       DatesWithSpaces: 55,
//       DateWithYearOnly: 7
//     }
//   ]
  



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



