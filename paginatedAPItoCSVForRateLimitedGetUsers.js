const axios = require('axios');
const { parse } = require('json2csv');
const fs = require('fs');
const bearer_token = 'xxxxx-xxxxx';

function getDataFromPaginated(page, data = [],etag) {
  let url= 'https://xxxxx/api/admin/customers?limit=1000'+(page ? '&skip=' + page*1000 : '')
console.log("yo",url);
  return axios({
    method: 'get',
    // url: 'https://mpowerapi.azurewebsites.net/api/v1/Items?' + (page ? 'pageNumber=' + page : '') + '&size=500',
    url: url,
    headers: {
      'Authority': 'xxxxx',
    'Accept': '*/*', 
    'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8', 
    'Accept-Encoding': "gzip, deflate, br",
      'Authorization': `Bearer ${bearer_token}`,
      'Content-Type': 'application/json', 
      'If-None-Match': etag?etag:'W/"15fc-8v4W7dmmk4LQpu/SeDZDI+xqtB4',
      'Origin': 'https://xxxxxxxx.com',
    }
  }) 
    .then(response => {
      console.log("response et",response.headers.etag);
      console.log("response",JSON.stringify(response.data.length));
      if (response.data.length== 0) return data
      // console.log()
      console.log("page", page);
      const res = response.data;
      // console.log("data",JSON.stringify(res));
      const fields = ['email', 'phone', 'dob','stripeID','orderCount','createdAt','banned','isVerified'];
      let opts = { fields };
      if (page !== 0) {
        opts = { fields, header: false };
      }
      const csv = parse(res, opts);
      // fs.writeFile(, csv, { flag: 'a+' }, err => {})
      fs.appendFileSync('getUser1.csv', csv);
      // Always add new line if file already exists.
      fs.appendFileSync('getUser1.csv', "\r\n");
      return setTimeout(() => getDataFromPaginated(page + 1, data,response.headers.etag), 1000);
      //  return getDataFromPaginated(page+1, data)
    })
}
try {
  getDataFromPaginated(0)
    .then(data => console.log("final data"))
} catch (err) {
  console.log("error")
}

