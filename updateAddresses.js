const MongoClient = require('mongodb').MongoClient;
const axios = require('axios');
const ObjectId = require('mongodb').ObjectId;
const { parse } = require('json2csv');
const fs = require('fs');

// Replace with your Google API key
const apiKey = 'xxx';

// MongoDB connection string
const uri = 'mongodb://localhost:27017';
async function geocode(lat, lon) {
  const apiUrl = "https://maps.googleapis.com/maps/api/geocode/json";
  const response = await axios.get(apiUrl, {
    params: {
      latlng: `${lat},${lon}`,
      key: apiKey,
    },
  });

  const data = response.data;
  if (data.results && data.results.length > 0) {
    const addressComponents = data.results[0].address_components;
    const streetNumber = addressComponents.find(component => component.types.includes("street_number"))?.long_name;
    const streetRoute = addressComponents.find(component => component.types.includes("route"))?.long_name;
    const street = streetNumber && streetRoute ? `${streetNumber} ${streetRoute}` : streetRoute;
    const city = addressComponents.find(component => component.types.includes("locality"))?.long_name;
    const state = addressComponents.find(component => component.types.includes("administrative_area_level_1"))?.short_name;
    const country = addressComponents.find(component => component.types.includes("country"))?.short_name;
    let zip = addressComponents.find(component => component.types.includes("postal_code"))?.long_name;

    // Ensure zip is numeric
    zip = zip ? parseInt(zip, 10) : null;
    return { street, city, state, country, zip };
  }
  return null;
}

async function processBatch(cursor, coll, changes) {
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const loc = doc.addresses.loc;
    const addressId = doc.addresses._id;
    if (loc && loc.length === 2) {
      const [lon, lat] = loc;
      console.log(`Processing coordinates: Lat: ${lat}, Lon: ${lon}`);
      const geocodedData = await geocode(lat, lon);
      if (geocodedData && (geocodedData.country === 'US' || geocodedData.country === 'United States')) {
        console.log(`Geocoded data for Lat: ${lat}, Lon: ${lon} => Street: ${geocodedData.street}, City: ${geocodedData.city}, State: ${geocodedData.state}, Country: ${geocodedData.country}, Zip: ${geocodedData.zip}`);
        
        const updateResult = await coll.updateOne(
          { _id: doc._id, "addresses._id": new ObjectId(addressId) },
          {
            $set: {
              "addresses.$.street": geocodedData.street,
              "addresses.$.city": geocodedData.city,
              "addresses.$.state": geocodedData.state,
              "addresses.$.country": geocodedData.country,
              "addresses.$.zip": geocodedData.zip
            }
          }
        );

        if (updateResult.modifiedCount > 0) {
          changes.push({
            user_id: doc._id,
            address_id: addressId,
            street: geocodedData.street,
            city: geocodedData.city,
            state: geocodedData.state,
            country: geocodedData.country,
            zip: geocodedData.zip
          });
        }
        console.log(`Updated document ${doc._id} for address ${addressId}:`, updateResult.modifiedCount);
      } else {
        console.log(`Geocoding failed or country is not US for Lat: ${lat}, Lon: ${lon}`);
      }
    }
  }
}

async function writeChangesToCSV(changes, fileName, append) {
  const fields = ['user_id', 'address_id', 'street', 'city', 'state', 'country', 'zip'];
  const opts = { fields, header: !append };
  const csv = parse(changes, opts);
  if (append) {
    fs.appendFileSync(fileName, csv + '\n');
  } else {
    fs.writeFileSync(fileName, csv + '\n');
  }
}

async function main() {
  const dbName = 'booze_dev';
  const collectionName = 'users';

  // Calculate the date 3 years ago from today
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

  console.log("🚀 ~ main ~ threeYearsAgo:", threeYearsAgo)
  const agg = [
    {
      '$match': {
        'createdAt': { '$gte': threeYearsAgo }
      }
    },
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
  const changes = [];
  let totalUpdates = 0;
  const fileName = 'address_changes.csv';
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    let isFirstBatch = true;

    while (true) {
      const coll = client.db(dbName).collection(collectionName);
      const cursor = coll.aggregate(agg).limit(500);
      
      if (!(await cursor.hasNext())) break;

      await processBatch(cursor, coll, changes);

      totalUpdates += changes.length;

      if (totalUpdates >= 100) {
        await writeChangesToCSV(changes.splice(0, changes.length), fileName, !isFirstBatch);
        isFirstBatch = false;
        totalUpdates = 0;
      }
    }

    // Write remaining changes to CSV
    if (changes.length > 0) {
      await writeChangesToCSV(changes, fileName, !isFirstBatch);
      console.log('Remaining changes written to address_changes.csv');
    } else {
      console.log('No remaining changes to write to CSV.');
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
