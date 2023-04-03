


const axios = require('axios');
const {
  Parser,
  transforms: { unwind },
} = require('json2csv');
const fs = require('fs');

function betweenMarkers(text, begin, end) {
  var firstChar = text.indexOf(begin) + begin.length;
  var lastChar = text.indexOf(end);
  var newText = text.substring(firstChar, lastChar);
  return newText;
}

// https://garage-dummy.myshopify.com/admin/products.json?limit=2&fields=id%2Cimages%2Ctitle%2Cvariants&page_info=eyJsYXN0X2lkIjo4MTk3MzkwMTM5Njc1LCJsYXN0X3ZhbHVlIjoiVGhlIEFyY2hpdmVkIFNub3dib2FyZCIsImRpcmVjdGlvbiI6Im5leHQifQ
function getDataFromPaginated(page, data = []) {
  let url;
  if(page==undefined){
     url='https://garage-dummy.myshopify.com/admin/products.json?limit=6&fields=id,images,title,variants'
  }else{
url=page;
  }
  // console.log("url",url)
  return axios({
    method: 'get',
    url: url,
    headers: { 
      'X-Shopify-Access-Token': 'shpat_xxx', 
       }
  }) 
    .then(response => {
      let cursor=response.headers.link;
      console.log("cursor",cursor);
      console.log("data",data);
      const fields = ['id', 'title'];
      let opts = { fields };
      const f1=['id',
      'title',
      'variants.product_id',
      'variants.title','variants.price'];
        opts = { fields, header: false };
        const json2csvParserProd = new Parser({ fields ,header: false });
        const res = response.data;
        const products = res.products;
      if (cursor.includes('previous')) {  
        
const csv = json2csvParserProd.parse(products);
        // const csv = json2csvParser.parse(products, opts);
        // fs.writeFile(, csv, { flag: 'a+' }, err => {})
        fs.appendFileSync('shopify_products.csv', csv);
        // Always add new line if file already exists.
        fs.appendFileSync('shopify_products.csv', "\r\n");
        const transforms = [unwind({ paths: ['variants'] })];
      
      const json2csvParser = new Parser({ fields:f1, transforms, header: false });
      const csv2=json2csvParser.parse(products);
        
      fs.appendFileSync('shopify_variant.csv', csv2);
      fs.appendFileSync('shopify_variant.csv', "\r\n");
      return;}
      let link=betweenMarkers(cursor,"<",">")
      // console.log("page", link);
     
      // console.log(res.data);
      
      
      const csv = json2csvParserProd.parse(products);
      // fs.writeFile(, csv, { flag: 'a+' }, err => {})
      fs.appendFileSync('shopify_products.csv', csv);
      // Always add new line if file already exists.
      fs.appendFileSync('shopify_products.csv', "\r\n");
      // return setTimeout(() => getDataFromPaginated(link, data), 1000);
      const transforms = [unwind({ paths: ['variants'] })];
     
      const json2csvParser = new Parser({ fields:f1, header: false, transforms });
      const csv2=json2csvParser.parse(products);
      console.log("csv2",csv2);
      fs.appendFileSync('shopify_variant.csv', csv2);
      fs.appendFileSync('shopify_variant.csv', "\r\n");
       return getDataFromPaginated(link, data)
    })
}
try {
  getDataFromPaginated()
    .then(data => console.log("final data"))
} catch (err) {
  console.log("error",err)
}
