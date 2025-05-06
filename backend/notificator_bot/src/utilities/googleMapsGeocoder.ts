import 'dotenv/config';
import axios from 'axios';

const googleMapsUrl = process.env.GOOGLE_MAPS_URL;
if (! googleMapsUrl) throw new Error('Required parameter googleMapsUrl is missing in env!')


export async function googleMapsGeocoder (address: string) {
	try{
    if (! googleMapsUrl) throw new Error('Required parameter googleMapsUrl is missing in env!')
		
    if (! checkCity(address)){
			address = 'Санкт-Петербург ' + address
		}
		
    const response = (await axios.post(googleMapsUrl, { address }, { headers: { 'Content-Type': 'application/json' } })).data
		
		if (! response.ok) return

		const location = response.result[0]?.geometry?.location		

		if (! location) return

		console.log('geodata is', location)

		const {lat: latitude, lng: longitude} = location;		
		return {latitude, longitude}
	}
	catch (err){
			console.error('Ошибка', 'googleMaps', err)
	}
}

 
function checkCity(address: string){
  if (! address) return

  const regions = new Map()
      .set('Санкт-Петербург', /\b(сп-?б|санкт\s*-?s*петербург)/i)
      .set('Ленинградская область', /\b(ло|лен.?(инградская)?\s*обл.?(асть)?)/i)

  const cities: Set<string> = new Set([
    "Мурино",
    "Петегргоф",
    "Никольское",
    "Металлострой",
    "Колпино",
    "Отрадное",
    "Ломоносов",
    "Сертолово",
    "Красное село",
    "Горелово",
    "Парголово",
    "Сестрорецк",
    "Кудрово",
    "Янино",
    "Пушкин",
    "Стрельна",
    "Бугры",
    "Песочный",
    "Шушары",
    "Усть-Славянка",
    "Славянка",
    "Новоселье",
  ])


  for (const [type, regex] of regions){
		if (regex.test(address)) return true
  }


  for (const city of cities){
		const regex = new RegExp(city, 'i')
		if (regex.test(address)) return true
  }
}