const MongoClient = require('mongodb').MongoClient;
const axios = require('axios');
const ObjectId = require('mongodb').ObjectId;

// Replace with your Google API key
const apiKey = 'xxx';

async function geocode(lat, lon) {
  const apiUrl = "https://maps.googleapis.com/maps/api/geocode/json";
  const response = await axios.get(apiUrl, {
    params: {
      latlng: `${lat},${lon}`,
      key: apiKey,
    },
  });

  const data = response.data;
  // console.log("🚀 ~ geocode ~ data:", data)
  if (data.results && data.results.length > 0) {
    const addressComponents = data.results[0].address_components;
    const city = addressComponents.find(component => component.types.includes("locality"))?.long_name;
    const state = addressComponents.find(component => component.types.includes("administrative_area_level_1"))?.long_name;
    const country = addressComponents.find(component => component.types.includes("country"))?.short_name;
    return { city, state, country };
  }
  return null;
}

async function main() {
  const uri = 'mongodb://localhost:27017/';
  const dbName = 'jasons-production';
  const collectionName = 'users';

  const agg = [
    {
      '$unwind': '$addresses'
    }, 
    {
      '$match': {
        'addresses.loc': { '$exists': true }, 
        'addresses.street': { '$exists': false }, 
        'addresses.city': { '$exists': false }, 
        'addresses.state': { '$exists': false }, 
        'addresses.country': { '$exists': false }, 
        'addresses.zip': { '$exists': false }
      }
    }
  ];

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    console.log('Connected to database');
    
    const coll = client.db(dbName).collection(collectionName);
    const cursor = coll.aggregate(agg);
    
    let count = 0;
    const limit = 10;

    while (await cursor.hasNext() && count < limit) {
      const doc = await cursor.next();
      const loc = doc.addresses.loc;
      const addressId = doc.addresses._id;
      if (loc && loc.length === 2) {
        const [lon, lat] = loc;
        console.log(`Processing coordinates: Lat: ${lat}, Lon: ${lon}`);
        const geocodedData = await geocode(lat, lon);
        if (geocodedData && geocodedData.country === 'US') {
          console.log(`Geocoded data for Lat: ${lat}, Lon: ${lon} => City: ${geocodedData.city}, State: ${geocodedData.state}, Country: ${geocodedData.country}`);
          
          const updateResult = await coll.updateOne(
            { _id: doc._id, "addresses._id": new ObjectId(addressId) },
            {
              $set: {
                "addresses.$.city": geocodedData.city,
                "addresses.$.state": geocodedData.state,
                "addresses.$.country": geocodedData.country
              }
            }
          );
          console.log(`Updated document ${doc._id} for address ${addressId}:`, updateResult.modifiedCount);
        } else {
          console.log(`Geocoding failed or country is not US for Lat: ${lat}, Lon: ${lon}`);
        }
      }
      count++;
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
