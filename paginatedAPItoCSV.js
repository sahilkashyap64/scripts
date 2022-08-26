const axios = require('axios');
const { parse } = require('json2csv');
const fs = require('fs');
const bearer_token = 'xxxxxx';

  function getPassengers (page, data = []) {
    
    return axios({
        method: 'get',
        url: 'https://api.instantwebtools.net/v1/passenger?'+ (page ? '?page='+page : '')+'&size=500',
        headers: {
          'Authorization': `Bearer ${bearer_token}`
        }
      }) // API supports a cursor param (?after=)
             .then(response => {
            //    console.log("getting data", response.data)
            //end it 4th page
               if (page == 4 ) return data
            //    data.push(...response.data)
console.log("page",page);
    const res = response.data;
    // console.log(res.data);
    const fields = ['name','trips','_id'];
    let opts = { fields };
    if(page!==0){
     opts = { fields,header: false };}
    const csv = parse(res.data, opts);
    // fs.writeFile(, csv, { flag: 'a+' }, err => {})
    fs.appendFileSync('airline.csv', csv);
    // Always add new line if file already exists.
    fs.appendFileSync('airline.csv', "\r\n");
               return getPassengers(page+1, data)
             })
}

getPassengers(0)
.then(data => console.log("final data"))