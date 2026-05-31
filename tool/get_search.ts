// 加载环境变量（必须在最顶部执行）
import dotenv from "dotenv";
dotenv.config();

// 导入 SerpApi 客户端
import { getJson } from "serpapi";

// ===================== 类型接口定义（约束搜索返回结构，强类型） =====================
/** 单条有机搜索结果 */
interface OrganicResult {
  title?: string;
  snippet?: string;
}

/** 知识图谱 */
interface KnowledgeGraph {
  description?: string;
}

/** 直接答案卡片 */
interface AnswerBox {
  answer?: string;
}

/** SerpApi 完整搜索结果结构 */
interface SerpSearchResult {
  answer_box_list?: string[];
  answer_box?: AnswerBox;
  knowledge_graph?: KnowledgeGraph;
  organic_results?: OrganicResult[];
}

// ===================== 核心搜索函数（1:1 复刻 Python 逻辑） =====================
/**
 * 基于SerpApi的网页搜索引擎工具
 * 智能解析搜索结果，优先返回直接答案/知识图谱
 * @param query 搜索关键词
 * @returns 格式化后的搜索结果文本
 */
export async function search(query: string): Promise<string|object> {
  console.log(`🔍 正在执行 [SerpApi] 网页搜索: ${query}`);

  try {
    // 读取环境变量中的密钥
    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      return "错误:SERPAPI_API_KEY 未在 .env 文件中配置。";
    }

    // 搜索参数（完全对齐 Python 配置：谷歌引擎、中国地区、中文）
    const params = {
      engine: "google",
      q: query,
      api_key: apiKey,
      gl: "cn",    // 国家代码 中国
      hl: "zh-cn"  // 语言代码 简体中文
    };

    // 发起搜索（对应 Python client.get_dict()）
    const results = await getJson(params) as SerpSearchResult;

    // ========== 智能解析结果（优先级和 Python 完全一致） ==========
    // 1. 优先 answer_box_list 答案列表
    if (results.answer_box_list && results.answer_box_list.length > 0) {
      return results.answer_box_list.join("\n");
    }

    // 2. 其次单个 answer_box 直接答案
    if (results.answer_box?.answer) {
      return results.answer_box.answer;
    }

    // 3. 然后知识图谱描述
    if (results.knowledge_graph?.description) {
      return results.knowledge_graph.description;
    }

    // 4. 最后取前3条自然搜索结果的标题+摘要
    if (results.organic_results && results.organic_results.length > 0) {
      const snippets = results.organic_results
        .slice(0, 3) // 只取前3条
        .map((res, index) => {
          const title = res.title ?? "";
          const snippet = res.snippet ?? "";
          return `[${index + 1}] ${title}\n${snippet}`;
        });
      return snippets.join("\n\n");
    }

    // 无任何结果
    return `对不起，没有找到关于 '${query}' 的信息。`;

  } catch (e) {
    // 捕获全局异常（对应 Python except Exception）
    const errorMsg = e instanceof Error ? e.message : String(e);
    return `搜索时发生错误: ${errorMsg}`;
  }
}

// ===================== 调用示例 =====================
// 测试调用（异步函数必须用 await）


