//引入包区
import axios from 'axios'
import type { AxiosResponse } from 'axios'


interface Weatherinfo{
 weather:string,
 temp:string
}

const weatherquest = axios.create({
    timeout:5000
})

export async function get_weather(city:string): Promise<object | string>{
    
let url:string = `https://wttr.in/${city}?format=j1`

console.log('aaaaa')
try{
    let response:AxiosResponse = await weatherquest.get(url)

   if(response.status < 200 || response.status >= 300){
    throw new Error(`HTTP 状态码: ${response.status}`)
   }
   try{
let data = response.data
let weatherinfo:Weatherinfo={
    weather:data.current_condition[0].weatherDesc[0].value,
    temp:data.current_condition[0].temp_C
}
console.log(weatherinfo)
return `${city}当前天气:${weatherinfo.weather}，气温${weatherinfo.temp}摄氏度`

   }catch (parseErr) {
    
      return `错误:解析天气数据失败，可能是城市名称无效 - ${(parseErr as Error).message}`
    }

 
}
catch (reqErr) {
    // 对标 Python: requests.exceptions.RequestException → 网络请求错误
    const errMsg = reqErr instanceof Error ? reqErr.message : "未知网络错误"
    return `错误:查询天气时遇到网络问题 - ${errMsg}`
  }




}
