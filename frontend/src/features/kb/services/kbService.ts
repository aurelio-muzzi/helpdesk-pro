import { api, type ApiResponse } from '@/lib/axios';
import type {
  KnowledgeArticle,
  CreateArticlePayload,
  ArticleFilters,
  ArticleSuggestion,
} from '../types';

export const kbService = {
  getArticles: async (filters?: ArticleFilters): Promise<KnowledgeArticle[]> => {
    const response = await api.get<ApiResponse<KnowledgeArticle[]>>('/articles', {
      params: filters,
    });
    return response.data.data;
  },

  getArticle: async (idOrSlug: string | number): Promise<KnowledgeArticle> => {
    const response = await api.get<ApiResponse<KnowledgeArticle>>(`/articles/${idOrSlug}`);
    return response.data.data;
  },

  createArticle: async (payload: CreateArticlePayload): Promise<KnowledgeArticle> => {
    const response = await api.post<ApiResponse<KnowledgeArticle>>('/articles', payload);
    return response.data.data;
  },

  updateArticle: async (id: number, payload: Partial<CreateArticlePayload>): Promise<KnowledgeArticle> => {
    const response = await api.put<ApiResponse<KnowledgeArticle>>(`/articles/${id}`, payload);
    return response.data.data;
  },

  deleteArticle: async (id: number): Promise<void> => {
    await api.delete(`/articles/${id}`);
  },

  submitFeedback: async (
    id: number,
    isHelpful: boolean
  ): Promise<{ message: string; helpful_count: number; not_helpful_count: number }> => {
    const response = await api.post(`/articles/${id}/feedback`, { is_helpful: isHelpful });
    return response.data;
  },

  getSuggestions: async (query: string): Promise<ArticleSuggestion[]> => {
    const response = await api.get<ApiResponse<ArticleSuggestion[]>>('/articles/suggestions', {
      params: { q: query },
    });
    return response.data.data;
  },
};
