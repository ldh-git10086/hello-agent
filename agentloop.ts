import {OpenaiClient} from './llmapi.ts'
import 'dotenv/config'
import { get_weather } from './tool/get_weather.ts';
import { getattraction } from './tool/get_attraction.ts';
import {readInput} from './readinout.ts'
import {ToolExecutor} from './utils/tooluse.ts'
const api_key = process.env.OPENAI_API_KEY!;
const base_url = process.env.OPENAI_BASE_URL!;
const model = process.env.MODEL_ID!;
  const llm =  new OpenaiClient(model,api_key,base_url)
async function gethuida(prompt:string,sys_prompt:string):Promise<string>{
  let a:string= await llm.createclient(prompt,sys_prompt)
  return a
}
//对工具进行改造
const executor = new ToolExecutor();
executor.registerTool(
  "get_weather",
  "查询指定城市的实时天气，参数：city:string,注意city使用拼音",
  get_weather
);

executor.registerTool(
  "get_attraction",
  "根据城市和天气推荐旅游景点，参数：city:string, weather:string",
  getattraction
);
const toolDesc = executor.getAvailableTools();
console.log("所有工具描述：");
console.log(toolDesc);

let AGENT_SYSTEM_PROMPT:any =
{
    role:'你是一个智能助手。你的任务是分析用户的请求，并使用可用工具一步步地解决问题。',
    tool:'- get_weather(city: string): 查询指定城市的实时天气 - get_attraction(city: string, weather: string)`: 根据城市和天气搜索推荐的旅游景点',
    output:'输出格式要求：你的每次回复必须是严格遵循以下格式的数据，包含一对Thought和Action：Thought: [你的思考过程和下一步计划], Action: [你要执行的具体行动]',
    action:'Action的格式必须是以下之一：1. 调用工具：function_name("arg_value")2. 结束任务：Finish[最终答案]',
    important:'# 重要提示:- 每次只输出一对Thought-Action - Action必须在同一行，不要换行- 当收集到足够信息可以回答用户问题时，必须使用 Action: Finish[最终答案] 格式结束'
}
function bulidsystem(){
    AGENT_SYSTEM_PROMPT.tool=toolDesc

    return JSON.stringify(AGENT_SYSTEM_PROMPT)
}
let user_prompt:string = "你好，请帮我查询一下北京今天的天气，并根据天气推荐"
let sys_prompt:string=bulidsystem()
const history:string[]=[]
const MAX_ITERATIONS = 10
async function getinput(){
user_prompt= await readInput('请输入>>>')
}
 async function main(){
 await getinput()
 if(user_prompt=='exit') process.exit(1)
history.push(`用户请求:${user_prompt}`)

for (let i = 0; i < MAX_ITERATIONS; i++) {
    console.log(`循环第${i + 1}次`);
    let llm_output: string = await gethuida(history.join('\n'), sys_prompt);

    // 截断多余的 Thought-Action 对，只保留第一对
    const thoughtActionMatch = llm_output.match(/(Thought:.*?Action:.*?)(?=\n\s*(?:Thought:|Action:|Observation:)|\n*$)/s);
    if (thoughtActionMatch) {
        const truncated = thoughtActionMatch[1].trim();
        if (truncated !== llm_output.trim()) {
            llm_output = truncated;
            console.log("已截断多余的 Thought-Action 对");
        }
    }
    console.log(`模型输出:\n${llm_output}\n`);
    history.push(llm_output);

    // 解析并执行行动
    const actionMatch = llm_output.match(/Action: (.*)/s);
    if (!actionMatch) {
        const observation = "错误: 未能解析到 Action 字段。请确保你的回复严格遵循 'Thought: ... Action: ...' 的格式。";
        const observationStr = `Observation: ${observation}`;
        console.log(`${observationStr}\n${"=".repeat(40)}`);
        history.push(observationStr);
        continue;
    }
    const actionStr = actionMatch[1].trim();

    if (actionStr.startsWith("Finish")) {
        const finishMatch = actionStr.match(/Finish\[(.*)\]/);
        if (finishMatch) {
            const finalAnswer = finishMatch[1];
            console.log(`任务完成，最终答案: ${finalAnswer}`);
            break;
        }
    }

    const toolNameMatch = actionStr.match(/(\w+)\(/);
    if (!toolNameMatch) continue;
    const toolName = toolNameMatch[1];

    const argsStrMatch = actionStr.match(/\((.*)\)/);
    if (!argsStrMatch) continue;
    const argsStr = argsStrMatch[1];

    // 解析参数：优先 key="value" 格式，兜底位置参数 "value"
    const kwargs: Record<string, string> = {};
    const kwMatches = argsStr.matchAll(/(\w+)="([^"]*)"/g);
    for (const m of kwMatches) {
        kwargs[m[1]] = m[2];
    }
    let args: string[];
    if (Object.keys(kwargs).length > 0) {
        args = Object.values(kwargs);
    } else {
        // 位置参数：get_weather("beijing") → ["beijing"]
        const posMatches = argsStr.matchAll(/"([^"]*)"/g);
        args = [...posMatches].map(m => m[1]);
    }

    // 执行工具
    const toolFn = executor.getTool(toolName);
    if (toolFn) {
        const result = await toolFn(...args);
        const observationStr = `Observation: ${JSON.stringify(result)}`;
        console.log(`${observationStr}\n${"=".repeat(40)}`);
        history.push(observationStr);
    } else {
        const observationStr = `Observation: 错误: 未找到工具 "${toolName}"`;
        console.log(`${observationStr}\n${"=".repeat(40)}`);
        history.push(observationStr);
    }
}
console.log(`达到最大迭代次数 ${MAX_ITERATIONS}，任务终止。`);
}
while(1){
await main()}
