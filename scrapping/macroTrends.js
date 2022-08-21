const axios = require('axios');
const mongo = require('mongodb');
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}`;
const baseUrl = 'https://www.macrotrends.net/stocks';

async function getFinancialData(ticker, companyName) {
  let response;
  try {
    response = await axios.get(`${baseUrl}/charts/${ticker}/${companyName}/income-statement?freq=Q`);
  } catch(error) {
    console.error(error.status);
  };
  const html = response.data;
  const startTag = 'var originalData = ';
  const endTag = '"}]';
  const startIndex = response.data.indexOf(startTag) + startTag.length;
  const endIndex = response.data.indexOf(endTag) + endTag.length; 
  const json = html.substring(startIndex, endIndex);
  const parsed = JSON.parse(json);
  return parsed;
};

async function getCompanies() {
  let response;
  try {
    response = await axios.get(`${baseUrl}/stock-screener`);
  } catch(error) {
    console.error(error.status);
  };
  const html = response.data;
  const startTag = 'var originalData = ';
  const endTag = '"}]';
  const startIndex = response.data.indexOf(startTag) + startTag.length;
  const endIndex = response.data.indexOf(endTag) + endTag.length; 
  const json = html.substring(startIndex, endIndex);
  const parsed = JSON.parse(json);
  return parsed.map((company) => ({
    companyName: company.comp_name,
    ticker: company.ticker,
  }));
};

function mapFieldName(fieldName) {
  const startIndex = fieldName.indexOf('\'>') + 2;
  const endIndex = fieldName.indexOf('</');
  return fieldName.substring(startIndex, endIndex);
};

function mapData(data) {
  const result = {};
  data.forEach((item) => {
    const name = mapFieldName(item.field_name);
    result[name] = item;
    delete result[name].popup_icon;
    delete result[name].field_name;
  });
  return result;
};

async function main() {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    await client.connect();
    const db = await client.db("test");
    const companiesCollection = await db.collection("companies");

    const companies = await getCompanies();
    for(let i = 0; i < companies.length; i++) {
      try {
        const data = await getFinancialData(companies[i].ticker, companies[i].companyName);
        const mappedData = mapData(data);
        mappedData.ticker = companies[i].ticker;
        mappedData.companyName = companies[i].companyName;
        await companiesCollection.insertOne(mappedData);
      } catch(error) {
        console.log(companies[i].ticker, companies[i].companyName);
      };
      if (i % 100 == 0) {
        console.log(i / companies.length * 100);
      };
    };
    client.close();
  } catch(error) {
    console.log(error);
  };
};
main();