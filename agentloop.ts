import {OpenaiClient} from './llmapi.ts'
import 'dotenv/config'
import { get_weather } from './tool/get_weather.ts';
import { getattraction } from './tool/get_attraction.ts';
import {readInput} from './readinout.ts'
const api_key = process.env.OPENAI_API_KEY!;
const base_url = process.env.OPENAI_BASE_URL!;
const model = process.env.MODEL_ID!;
  const llm =  new OpenaiClient(model,api_key,base_url)
async function gethuida(prompt:string,sys_prompt:string):Promise<string>{
  let a:string= await llm.createclient(prompt,sys_prompt)
  return a
}
interface tools{
    "get_weather":(city:string)=>Promise<string|object>,
    "get_attraction":(city: string, weather: string) =>Promise< string|object>;
}
const available_tools:tools = {
    "get_weather": get_weather,
    "get_attraction": getattraction,
}
let AGENT_SYSTEM_PROMPT:Object =
{
    role:'你是一个智能旅行助手。你的任务是分析用户的请求，并使用可用工具一步步地解决问题。',
    tool:'- get_weather(city: string): 查询指定城市的实时天气 - get_attraction(city: string, weather: string)`: 根据城市和天气搜索推荐的旅游景点',
    output:'输出格式要求：你的每次回复必须是严格遵循以下格式的数据，包含一对Thought和Action：Thought: [你的思考过程和下一步计划], Action: [你要执行的具体行动]',
    action:'Action的格式必须是以下之一：1. 调用工具：function_name("arg_value")2. 结束任务：Finish[最终答案]',
    important:'# 重要提示:- 每次只输出一对Thought-Action - Action必须在同一行，不要换行- 当收集到足够信息可以回答用户问题时，必须使用 Action: Finish[最终答案] 格式结束'
}

let user_prompt:string = "你好，请帮我查询一下北京今天的天气，并根据天气推荐"
let sys_prompt:string=JSON.stringify(AGENT_SYSTEM_PROMPT)
const history:string[]=[]
async function getinput(){
user_prompt= await readInput('请输入>>>')
}
 async function main(){
 await getinput()
 if(user_prompt=='exit') process.exit(1)
history.push(`用户请求:${user_prompt}`)

while(1) {
    // console.log(`循环${i}次`);
    let llm_output: string = await gethuida(history.join('\n'), sys_prompt);

    // 3.2. 截断多余的 Thought-Action 对，只保留第一对
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

    // 3.3. 解析并执行行动
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

    const argMatches = argsStr.matchAll(/(\w+)="([^"]*)"/g);
    const kwargs: Record<string, string> = {};
    for (const m of argMatches) {
        kwargs[m[1]] = m[2];
    }

    // 执行工具
    const toolFn = available_tools[toolName as keyof typeof available_tools];
    if (toolFn) {
        const args = Object.values(kwargs);
        const result = await (toolFn as (...args: string[]) => Promise<string | object>)(...args);
        const observationStr = `Observation: ${JSON.stringify(result)}`;
        console.log(`${observationStr}\n${"=".repeat(40)}`);
        history.push(observationStr);
    } else {
        const observationStr = `Observation: 错误: 未找到工具 "${toolName}"`;
        console.log(`${observationStr}\n${"=".repeat(40)}`);
        history.push(observationStr);
    }
}
}
while(1){
await main()}

