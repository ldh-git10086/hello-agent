/**
 * 单个工具的结构定义
 */
interface ToolItem {
  description: string;
  // 通用可调用函数：接收任意参数，返回任意值（适配你不同的工具函数）
  func: (...args: string[]) => Promise<string|object>;
}

 export class ToolExecutor {
  // 工具注册表：键=工具名，值=工具详情对象
  private tools: Record<string, ToolItem>;

  constructor() {
    // 初始化空注册表
    this.tools = {};
  }

  /**
   * 向工具箱中注册一个新工具
   * @param name 工具名称
   * @param description 工具描述
   * @param func 工具执行函数
   */
  registerTool(name: string, description: string, func: (...args: string[]) => Promise<string|object>): void {
    if (name in this.tools) {
      console.log(`警告:工具 '${name}' 已存在，将被覆盖。`);
    }
    this.tools[name] = { description, func };
    console.log(`工具 '${name}' 已注册。`);
  }

  /**
   * 根据名称获取一个工具的执行函数
   * @param name 工具名称
   * @returns 工具函数 / undefined（工具不存在）
   */
  getTool(name: string): (...args: string[]) => Promise<string|object> | undefined {
    const tool = this.tools[name];
    return tool?.func;
  }

  /**
   * 获取所有可用工具的格式化描述字符串
   * 格式：- 工具名: 描述
   * @returns 拼接后的文本
   */
  getAvailableTools(): string {
    // 遍历工具表，逐行拼接
    return Object.entries(this.tools)
      .map(([name, info]) => `- ${name}: ${info.description}`)
      .join("\n");
  }
}