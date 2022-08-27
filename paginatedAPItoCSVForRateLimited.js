const axios = require('axios');
const { parse } = require('json2csv');
const fs = require('fs');
const bearer_token = 'xxxxx';

function getDataFromPaginated(page, data = []) {

  return axios({
    method: 'get',
    url: 'https://mpowerapi.azurewebsites.net/api/v1/Items?' + (page ? 'pageNumber=' + page : '') + '&size=500',
    headers: {
      'Authorization': `Bearer ${bearer_token}`
    }
  }) 
    .then(response => {
      
      if (page == response.data.TotalPages) return data
      
      console.log("page", page);
      const res = response.data;
      // console.log(res.data);
      const fields = ['SkuNumber', 'Description', 'ItemTaxType', 'Category', 'Status', 'LocationId'];
      let opts = { fields };
      if (page !== 0) {
        opts = { fields, header: false };
      }
      const csv = parse(res.Results, opts);
      // fs.writeFile(, csv, { flag: 'a+' }, err => {})
      fs.appendFileSync('mpowerItems2.csv', csv);
      // Always add new line if file already exists.
      fs.appendFileSync('mpowerItems2.csv', "\r\n");
      return setTimeout(() => getDataFromPaginated(page + 1, data), 2000);
      //  return getDataFromPaginated(page+1, data)
    })
}
try {
  getDataFromPaginated(0)
    .then(data => console.log("final data"))
} catch (err) {
  console.log("error")
}

