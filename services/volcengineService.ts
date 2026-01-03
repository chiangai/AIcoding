import { AppSettings, GenerateParams, Recipe } from '../types';

const MOCK_RECIPES: Recipe[] = [
  {
    id: 'mock-1',
    emoji: '🍅',
    name: '演示版：黄金番茄炒蛋',
    time: '10 分钟',
    ingredients: ['番茄 2个', '鸡蛋 3个', '葱花 少许', '盐 1茶匙', '糖 1茶匙'],
    steps: [
      '番茄切块，鸡蛋打散备用。',
      '热锅凉油，倒入蛋液炒熟盛出。',
      '锅中留底油，炒软番茄出汁。',
      '倒入鸡蛋，加入盐和糖调味，撒葱花出锅。'
    ]
  },
  {
    id: 'mock-2',
    emoji: '🍜',
    name: '演示版：深夜清汤面',
    time: '5 分钟',
    ingredients: ['挂面 1把', '生抽 1勺', '猪油 1小勺', '开水 适量', '青菜 2棵'],
    steps: [
      '碗中加入生抽、猪油、葱花。',
      '锅中烧开水，冲入碗中化开调料。',
      '利用开水煮面，最后烫熟青菜。',
      '捞入碗中即可开吃。'
    ]
  }
];

export const getMockRecipes = (): Recipe[] => {
  return MOCK_RECIPES;
};

export const generateRecipesAPI = async (
  params: GenerateParams, 
  settings: AppSettings
): Promise<Recipe[]> => {
  
  // Construct the prompt
  const systemPrompt = `你是一个专业的剩菜大厨。请根据用户的食材和厨具生成 2 个创意食谱。
  必须严格返回合法的 JSON 格式，不要包含 markdown 标记（如 \`\`\`json）。
  JSON 结构如下：
  [
    {
      "emoji": "🍲",
      "name": "菜名",
      "time": "预估时间",
      "ingredients": ["食材1", "食材2"],
      "steps": ["步骤1", "步骤2"]
    }
  ]`;

  const userContent: any[] = [
    {
      type: "text",
      text: `食材: ${params.ingredientsText}。厨具: ${params.selectedTool}。`
    }
  ];

  if (params.imageBase64) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: params.imageBase64
      }
    });
  }

  const payload = {
    model: settings.endpointId, // Volcengine uses endpoint ID as model usually, or specific model name
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent }
    ],
    temperature: 0.7,
    max_tokens: 1000
  };

  try {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} ${JSON.stringify(errData)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error("Empty response from API");

    // Clean up potential markdown formatting if the model disobeys
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedRecipes = JSON.parse(cleanJson);
    
    // Validate and map to Recipe type
    return parsedRecipes.map((r: any, idx: number) => ({
      id: `api-${Date.now()}-${idx}`,
      emoji: r.emoji || '🥘',
      name: r.name || '未知美食',
      time: r.time || '未知',
      ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
      steps: Array.isArray(r.steps) ? r.steps : []
    }));

  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
};
