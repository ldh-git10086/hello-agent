import 'dotenv/config'
import { tavily} from "@tavily/core";


export async function getattraction(city:string,weather:string):Promise<string|object>
{

    const api_key = process.env.TAVILY_API_KEY; 
    if(!api_key){
        return "错误:未配置TAVILY_API_KEY环境变量。"
    }
    const tavilyClient = tavily({
  apiKey:api_key
});
const query:string=`${city}' 在'${weather}'天气下最值得去的旅游景点推荐及理由`
let response:any
try {
   response =await tavilyClient.search(query, {search_depth:"basic", include_answer:true})
   if(response.answer){
   return response.answer}
   else {
    let formartestult = []
  formartestult=  response.results.map((item:any)=>{
    return `- ${item.title}`
    })
    if(!formartestult){
        return "抱歉，没有找到相关的旅游景点推荐。"
    }
    return "根据搜索，为您找到以下信息:\n" + "\n"+`${[...formartestult]}`
   }

}
catch(e){
return `错误:执行Tavily搜索时出现问题 - ${e}`
}
    
}

/*


{
  query: "beijing' 在'Sunny'天气下最值得去的旅游景点推荐及理由",
  responseTime: 1.16,
  images: [],
  results: [
    {
      title: '北京在sunny天气下最值得去的旅游景点推荐及理由 - Instagram',
      url: 'https://www.instagram.com/popular/%E5%8C%97%E4%BA%AC-%E5%9C%A8sunny%E5%A4%A9%E6%B0%94%E4%B8%8B%E6%9C%80%E5%80%BC%E5%BE%97%E5%8E%BB%E7%9A%84%E6%97%85%E6%B8%B8%E6%99%AF%E7%82%B9%E6%8E%A8%E8%8D%90%E5%8F%8A%E7%90%86%E7%94%B1',
      content: '北京在sunny天气下最值得去的旅游景点推荐及理由. Watch reels about 北京在sunny ... 北京旅行#中国#中国旅行#china #beijing #什刹海. 清明上河園——以《清明上河',
      rawContent: null,
      score: 0.9999951,
      publishedDate: undefined,
      favicon: undefined
    },
    {
      title: '北京在晴天天气下最值得去的旅游景点推荐及理由 - Instagram',
      url: 'https://www.instagram.com/popular/%E5%8C%97%E4%BA%AC-%E5%9C%A8%E6%99%B4%E5%A4%A9%E5%A4%A9%E6%B0%94%E4%B8%8B%E6%9C%80%E5%80%BC%E5%BE%97%E5%8E%BB%E7%9A%84%E6%97%85%E6%B8%B8%E6%99%AF%E7%82%B9%E6%8E%A8%E8%8D%90%E5%8F%8A%E7%90%86%E7%94%B1',
      content: '很多人第一次來北京，行程其實都排得不太合理。 北京景點多，但真正好的行程安排，是需要經驗的。 給大家3個實用的安排思路： ① 故宮× 國博不建議安排在同一天。',
      rawContent: null,
      score: 0.9999937,
      publishedDate: undefined,
      favicon: undefined
    },
    {
      title: '下雨天北京可以去哪玩?最值得看的十大美景(图)- 北京本地宝',
      url: 'https://m.bj.bendibao.com/tour/196797.html',
      content: '# 下雨天北京可以去哪玩? *导语* 下雨天北京可以去哪？入伏以来，北京的雨水非常多，喜雨人欢喜，不喜雨人愁。不过有些美景是“非雨不可”的，下面小编给大家盘点北京雨天最值得一看的十大美景。. 香山公园位于北京西北郊，始建于金代，占地面积160余公顷，主峰香炉峰(俗称鬼见愁)，海拔557米。园内文物古迹众多，是一座具有山林特色的皇家园林。在京西“三山五园”中占一山一园。园内树木繁多，其中古树5800余株,具有独特的“山川、名泉、古树、红叶”丰富的园林内涵，是避暑的胜地，天然的氧吧。. 亮点：雨水下的植被，尤为郁郁葱葱，于香山公园小亭中静坐听雨赏雨，是不是有一些禅意呢?',
      rawContent: null,
      score: 0.9874721,
      publishedDate: undefined,
      favicon: undefined
    },
    {
      title: '下雨天北京最好玩的11个好去处',
      url: 'https://www.visitbeijing.com.cn/article/47QrpKcpBbU',
      content: '# 下雨天 北京最好玩的11个好去处. 蓝天下的故宫是一番景象，雨中的故宫是另一番色彩，故宫的雨，不经意间凝固了岁月，惊艳了时光，让故宫里的一切变得素净清雅。. 都说雨中的荷花很美，自古以来也有很多赞美雨荷的诗句，可我们却很少有机会去欣赏。趁着这几天的雨，如能抽出时间来，静静地品味着这烟雨荷塘，暂时忘却这城市的喧嚣，甚好。. 古北水镇被称作北方的江南水乡，鳞次栉比的房屋、青石板的老街、悠长的胡同，古朴、典雅、风景如画。古镇有两个时候去最美，一是下雪的时候，二是下雨的时候，说不定你会遇到一个打着油纸伞的姑娘。. 下着小雨的北京，最适合去什刹海了。这个时候，什刹海的湖景便朦胧起来了。烟雨濛濛，泛舟湖上，想想都很浪漫。. 中国国家博物馆的知名度无须赘述，每到节假日，来自世界各地的人都会到这里看一看。在雨天，逛一逛中国国家博物馆，感受一下这座历史与艺术并重的综合性国家博物馆吧，肯定有一番收获。. 雨天的北京本就是美的，在这样的天气里，在中国园林博物馆看着雨中的建筑，馆中的藏品，也不失为一种享受。. 雨天适合读书，也适合看画，到中国美术馆，看一看各类美术作品，黏湿的天气也多了些乐趣呢~. 不想跟阴雨天一样阴沉，那么就HIGH起来吧！到蹦床运动馆让全身动起来！忘了外面没完没了的雨，尽情地跳吧跳吧~. 如果觉得蹦床运动量太大，但又想活动活动，那么溜冰也是不错的选择，新世界的这家溜冰场可是真冰的，穿上一双溜冰鞋，在冰面上尽情驰骋吧！. 忘掉外面的天气，去海洋馆看看游来游去的鱼群，也忘却了心中的浮躁。这里有彩色的热带鱼、活泼的海豚、萌萌的海龟，以及各种你没见过的珍稀鱼类，开拓眼界的同时，还能带来单纯的快乐。. 为能让网友分享自己美好旅途，记录旅途美好回忆，北京旅游网特面向全球网友公开征集文旅类稿件。范围涵括吃喝玩乐游购娱展演等属于文旅范畴的内容均可，形式图文、视频均可。. 稿件必须原创。稿件一经采用，即有机会获得景区门票、精美礼品，更有机会参与北京旅游网年终盛典活动。. 投稿邮箱：**tougao@visitbeijing.com.cn**. ## 更多北京旅游攻略. * “海”边看花海！这片风景“给到夯”🦋 | 周末京郊微度假. * 人气火爆！最美人间四“阅”天，乐享京城花海里的漫读时光. * 壮观！北京的高山杜鹃花开了，观赏期持续至“五一”假期. #### 短信获取验证码. * **3**绝美！“梯田花海”来了！五一假期将迎最佳观赏期！. * **5**20000余株牡丹花海上线！“打卡攻略”来了！还有绝美日落——. * **6**“海”边看花海！这片风景“给到夯”🦋 | 周末京郊微度假. * **9**壮观！北京的高山杜鹃花开了，观赏期持续至“五一”假期. * **10**人气火爆！最美人间四“阅”天，乐享京城花海里的漫读时光. 关于北京旅游网/商务合作/网站声明/隐私政策/联系我们.',
      rawContent: null,
      score: 0.9693242,
      publishedDate: undefined,
      favicon: undefined
    },
    {
      title: '北京市10 大景点玩乐 - Tripadvisor',
      url: 'https://cn.tripadvisor.com/Attractions-g294212-Activities-Beijing.html',
      content: '北京市的热门景点. 了解推荐的选择方式 ; 1. 慕田峪长城 · (24,517). 古迹 ; 2. 颐和园 · (15,141). 地点与地标 ; 3. 故宫博物院 · (14,291). 专业博物馆 ; 4. 天坛公园 · (12,306).',
      rawContent: null,
      score: 0.94815457,
      publishedDate: undefined,
      favicon: undefined
    }
  ],
  answer: 'In sunny weather, visit the Temple of Heaven and the Summer Palace for pleasant outdoor experiences. These spots offer beautiful architecture and serene gardens.',
  requestId: '2f1f31ea-2277-4731-bb26-54b0eb1bba3b'
}
*/