import axios from 'axios'; 
import transformData from './transformData';

const baseUrl = 'https://www.alphavantage.co/';
const apikey = process.env.ALPHAVANTAGE_APIKEY;

export async function getDataDaily(ticker) {
  const params = new URLSearchParams({
    function: 'TIME_SERIES_DAILY',
    symbol: ticker,
    outputsize: 'full',
    apikey,
  }).toString();
  const response = await axios.get(`${baseUrl}/query?${params}`);
  return transformData(response.data);
}