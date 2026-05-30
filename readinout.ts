// index.ts
import * as readline from 'readline';

/**
 * 通用控制台输入（Promise 封装，支持 await）
 * @param tip 控制台提示文案
 * @returns 用户输入的字符串
 */
export function readInput(tip: string): Promise<string> {
  // 创建 readline 实例
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    // 控制台打印提示，等待用户输入
    rl.question(tip, (answer) => {
      rl.close(); // 关闭输入流
      resolve(answer.trim()); // 返回用户输入（去除首尾空格）
    });
  });
}
