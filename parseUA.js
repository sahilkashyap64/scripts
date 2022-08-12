const MongoClient = require('mongodb').MongoClient;
var useragent = require('express-useragent');
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
  // get the count of docs based on regex
  let overViewofAllDevice= await countTheDocs(client);

  for await (const Devices of overViewofAllDevice) {
    console.log("Devices",Devices)
  }
  //count unique ua and filter them using a js lib
//  await countTheUniqueUAandFilterBasedOnDevice(client);
    console.log("Database connection closed .");
      client.close();
  
 

 


});

async function countTheUniqueUAandFilterBasedOnDevice(client){
  let uniqueUAcount= await getUniqueUA(client);
  let uniqueUAcountValues= uniqueUAcount[0].values;
  
  console.log("uniqueUAcount",uniqueUAcount[0].values.length);
  console.log("----checking  UA it isDesktop or mobile--")
  let a;
  let desktopDeviceUAarr = [],
  mobileDeviceUAarr = [],
  otherDeviceUAarr  =[] ;
  for await (const UA of uniqueUAcountValues) {
  
    a=useragent.parse(UA);
    if(a.isDesktop){
      desktopDeviceUAarr.push(a.source);
    }
    if(a.isMobile){
      
      mobileDeviceUAarr.push(a.source);
    
    }
    if(!a.isDesktop && !a.isMobile){

      otherDeviceUAarr.push(a.source);
    }
  }
  console.log('\ndesktop devices',desktopDeviceUAarr.length,"\n",
              'mobile',mobileDeviceUAarr.length,"\n",
              'other device',otherDeviceUAarr.length,"\n",
              );
  console.log("-----------------");

}


async function countTheDocs(client){

  let dbName = "test";

  let collectionName = "orders";

  let db = client.db(dbName);

  console.log(`Connected to ${dbName} database successfully.`);


const overviewOfAlltheDevice=[
  {
    '$project': {
      'userAgent': '$userAgent.ua' //extract the ua from the object
    }
  }, {
    '$facet': {
      'total': [
        //match all and count all
        {
          '$match': {} 
        }, {
          '$count': 'Total' 
        }
      ], 
      'desktopDevice': [
        // match desktop but not Phones and count them
        {
          '$match': {
            '$and': [
              {
                'userAgent': {
                  '$regex': '(Mac OS X|Linux|Windows|CrOS)'
                }
              }, {
                'userAgent': {
                  '$not': new RegExp('(Android|iPhone|iPad)')
                }
              }
            ]
          }
        }, {
          '$count': 'TotalDestop'
        }
      ], 
      'mobile': [
        //match all mobile UA and count them
        {
          '$match': {
            'userAgent': new RegExp('Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune')
          }
        }, {
          '$count': 'TotalMobile'
        }
      ], 
      'UnknowUA': [
        // match the some unknown
        {
          '$match': {
            'userAgent': new RegExp('(CFNetwork|Darwin|okhttp)')
          }
        }, {
          '$count': 'UnknowUA'
        }
      ], 
      'Android': [
        //match ua from native android app
        {
          '$match': {
            'userAgent': new RegExp('(okhttp)')
          }
        }, {
          '$count': 'Android'
        }
      ], 
      'Iphone': [
        //match UA native iphone app
        {
          '$match': {
            'userAgent': new RegExp('(CFNetwork|Darwin)')
          }
        }, {
          '$count': 'Iphone'
        }
      ]
    }
  }
];



  const aggCursor = db.collection(collectionName).aggregate(overviewOfAlltheDevice);
  // const aggCursor = db.collection(collectionName).aggregate(noMobilevsMobile);
    let totalCount=[]
    // loop through the last pipeline result and push them in the array
  await aggCursor.forEach(res => {
    // console.log("countTheDocs",res);
    totalCount.push(res);
    
  });


      return totalCount;

}




async function getUniqueUA(client){

  let dbName = "test";

  let collectionName = "orders";

  let db = client.db(dbName);

  console.log(`Connected to ${dbName} database successfully.`);


  const justUniqueUA =[
    {
      '$project': {
        'userAgent': '$userAgent.ua'
      }
    }, {
      '$group': {
        '_id': null, 
        'values': {
          '$addToSet': '$userAgent'
        }
      }
    }
  ];



  const aggCursor = db.collection(collectionName).aggregate(justUniqueUA);
    let totalCount=[]
    // loop through the last pipeline result and push them in the array
  await aggCursor.forEach(res => {
    // console.log("countTheDocs",res);
    totalCount.push(res);
    
  });


      return totalCount;
}



// const matchDesktopButnotMobile= [
//   {
//     '$project': {
//       'userAgent': '$userAgent.ua'
//     }
//   }, {
//     '$match': {
//       '$and': [
//         {
//           'userAgent': {
//             '$regex': '(Mac OS X|Linux|Windows|CrOS)'
//           }
//         }, {
//           'userAgent': {
//             '$not': new RegExp('(Android|iPhone|iPad)')
//           }
//         }
//       ]
//     }
//   }, {
//     '$group': {
//       '_id': null, 
//       'values': {
//         '$addToSet': '$userAgent'
//       }
//     }
//   }
// ];

// const overviewOfAlltheDevice=[
//   {
//     '$project': {
//       'userAgent': '$userAgent.ua'
//     }
//   }, {
//     '$facet': {
//       'total': [
//         {
//           '$match': {}
//         }, {
//           '$count': 'Total'
//         }
//       ], 
//       'desktopDevice': [
//         {
//           '$match': {
//             '$and': [
//               {
//                 'userAgent': {
//                   '$regex': '(Mac OS X|Linux|Windows|CrOS)'
//                 }
//               }, {
//                 'userAgent': {
//                   '$not': new RegExp('(Android|iPhone|iPad)')
//                 }
//               }
//             ]
//           }
//         }, {
//           '$count': 'TotalDestop'
//         }
//       ], 
//       'mobile': [
//         {
//           '$match': {
//             'userAgent': new RegExp('Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune')
//           }
//         }, {
//           '$count': 'TotalMobile'
//         }
//       ], 
//       'UnknowUA': [
//         {
//           '$match': {
//             'userAgent': new RegExp('(CFNetwork|Darwin|okhttp)')
//           }
//         }, {
//           '$count': 'UnknowUA'
//         }
//       ]
//     }
//   }, {
//     '$group': {
//       '_id': null, 
//       'values': {
//         '$addToSet': '$userAgent'
//       }
//     }
//   }
// ];

  // const justUniqueUA =[
  //   {
  //     '$project': {
  //       'userAgent': '$userAgent.ua'
  //     }
  //   }, {
  //     '$group': {
  //       '_id': null, 
  //       'values': {
  //         '$addToSet': '$userAgent'
  //       }
  //     }
  //   }
  // ];
  
  // const noMobilevsMobile=[
  //   {
  //     '$project': {
  //       'userAgent': '$userAgent.ua'
  //     }
  //   }, {
  //     '$group': {
  //       '_id': null, 
  //       'matchMobile': {
  //         '$addToSet': {
  //           '$cond': {
  //             'if': {
  //               '$regexMatch': {
  //                 'input': '$userAgent', 
  //                 'regex': '/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/'
  //               }
  //             }, 
  //             'then': '$userAgent', 
  //             'else': '$$REMOVE'
  //           }
  //         }
  //       }, 
  //       'nonMobile': {
  //         '$addToSet': {
  //           '$cond': {
  //             'if': {
  //               '$regexMatch': {
  //                 'input': '$userAgent', 
  //                 'regex': '/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/'
  //               }
  //             }, 
  //             'then': '$$REMOVE', 
  //             'else': '$userAgent'
  //           }
  //         }
  //       }
  //     }
  //   }
  // ];

