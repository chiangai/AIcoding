export interface Recipe {
  id: string;
  emoji: string;
  name: string;
  time: string;
  ingredients: string[];
  steps: string[];
}

export interface AppSettings {
  apiKey: string;
  endpointId: string;
}

export interface GenerateParams {
  ingredientsText: string;
  selectedTool: string;
  imageBase64: string | null;
}

export const TOOLS = ['全部', '电饭煲', '炒锅', '烤箱', '空气炸锅', '微波炉', '+ 自定义'];