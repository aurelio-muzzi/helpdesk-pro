import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kbService } from '../services/kbService';
import type { CreateArticlePayload, ArticleFilters } from '../types';

export const KB_KEYS = {
  articles: ['kb-articles'] as const,
  article: (id: string | number) => ['kb-article', id] as const,
  suggestions: (q: string) => ['kb-suggestions', q] as const,
};

export const useArticles = (filters?: ArticleFilters) => {
  return useQuery({
    queryKey: [...KB_KEYS.articles, filters],
    queryFn: () => kbService.getArticles(filters),
  });
};

export const useArticle = (idOrSlug?: string | number) => {
  return useQuery({
    queryKey: KB_KEYS.article(idOrSlug ?? ''),
    queryFn: () => kbService.getArticle(idOrSlug!),
    enabled: Boolean(idOrSlug),
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateArticlePayload) => kbService.createArticle(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KB_KEYS.articles });
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateArticlePayload> }) =>
      kbService.updateArticle(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: KB_KEYS.articles });
      queryClient.invalidateQueries({ queryKey: KB_KEYS.article(variables.id) });
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => kbService.deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KB_KEYS.articles });
    },
  });
};

export const useArticleFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isHelpful }: { id: number; isHelpful: boolean }) =>
      kbService.submitFeedback(id, isHelpful),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: KB_KEYS.articles });
      queryClient.invalidateQueries({ queryKey: KB_KEYS.article(variables.id) });
    },
  });
};

export const useArticleSuggestions = (query: string) => {
  return useQuery({
    queryKey: KB_KEYS.suggestions(query),
    queryFn: () => kbService.getSuggestions(query),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60,
  });
};
