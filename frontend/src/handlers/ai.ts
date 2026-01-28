import type { HandlerContext } from './types';

export const aiHandlers: Record<string, (ctx: HandlerContext) => Promise<any>> = {
  ai_summarize: async ({ data, onLog }) => {
    onLog('info', `🤖 AI Summarize`);
    onLog('info', `   Model: ${data.model || 'default'}`);
    onLog('info', `   Input: ${data.prompt?.substring(0, 50)}...`);
    
    try {
      // In a real implementation, this would call AI API
      await new Promise(r => setTimeout(r, 500));
      
      const summary = `Summary of: ${data.prompt?.substring(0, 100)}...`;
      const tokens = Math.floor(Math.random() * 500 + 100);
      
      onLog('success', `✓ Generated ${tokens} tokens`);
      onLog('info', `   💰 Cost: $0.00${Math.floor(Math.random() * 9 + 1)}`);
      
      return summary;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ AI request failed: ${errorMsg}`);
      throw error;
    }
  },

  ai_classify: async ({ data, onLog }) => {
    onLog('info', `🤖 AI Classify`);
    onLog('info', `   Categories: ${data.categories}`);
    
    try {
      await new Promise(r => setTimeout(r, 400));
      
      const categories = data.categories?.split(',').map((c: string) => c.trim()) || [];
      const category = categories[Math.floor(Math.random() * categories.length)] || 'unknown';
      
      onLog('success', `✓ Classified as: ${category}`);
      return category;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Classification failed: ${errorMsg}`);
      throw error;
    }
  },

  ai_extract: async ({ data, onLog }) => {
    onLog('info', `🤖 AI Extract Data`);
    onLog('info', `   Schema: ${data.schema?.substring(0, 50)}...`);
    
    try {
      await new Promise(r => setTimeout(r, 450));
      
      let schema = {};
      try {
        schema = JSON.parse(data.schema || '{}');
      } catch {
        onLog('warn', '⚠️  Invalid schema, using empty object');
      }
      
      onLog('success', `✓ Extracted data`);
      return schema;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Extraction failed: ${errorMsg}`);
      throw error;
    }
  },

  ai_generate: async ({ data, onLog }) => {
    onLog('info', `🤖 AI Generate Text`);
    onLog('info', `   Prompt: ${data.prompt?.substring(0, 50)}...`);
    onLog('info', `   Temperature: ${data.temperature || 0.7}`);
    
    try {
      await new Promise(r => setTimeout(r, 600));
      
      const generated = `Generated text based on: ${data.prompt?.substring(0, 50)}...`;
      const tokens = Math.floor(Math.random() * 800 + 200);
      
      onLog('success', `✓ Generated ${tokens} tokens`);
      return generated;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Generation failed: ${errorMsg}`);
      throw error;
    }
  },
};
