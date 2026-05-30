import openai from 'openai'
import type {
  ChatCompletionMessageParam,
  ChatCompletion,  // choices 单条选项类型
  ChatCompletionMessage    // message 消息体类型
} from "openai/resources/chat/completions";
type ChatCompletionChoice = ChatCompletion['choices'][number];
 export class OpenaiClient{

  model:string
  api_key:string
    base_url:string
 client:openai
    constructor(model:string,api_key:string,base_url:string){
        this.model=model
        this.api_key=api_key
        this.base_url=base_url
this.client = new openai({
      apiKey: this.api_key,
      baseURL: this.base_url // SDK 固定字段 baseURL（大写 L）
    });
  }
    

   async  createclient(prompt:string,sys_prompt:string):Promise<string>{

        console.log('正在调用llm')
        try{
           let messages:ChatCompletionMessageParam[] = [{role:'system',content:sys_prompt}]
           messages.push({role:'user',content:prompt})
           const response:ChatCompletion = await this.client.chat.completions.create({
            model: this.model,
            messages: messages,
            stream: false
});
const choice: ChatCompletionChoice | undefined = response.choices[0];
const msg: ChatCompletionMessage | undefined = choice?.message;
const content:string|null = msg?.content;
    console.log('llm响应成功')
    if(content){
    return content
    }else{
        throw new Error('大模型输出为空')
    }
        }catch(e){
            return `大模型输出错误${e}`
        }


      
    }





}

