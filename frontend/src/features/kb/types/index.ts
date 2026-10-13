export interface KnowledgeArticle {
  id: number;
  category_id: number | null;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  author_id: number;
  author: {
    id: number;
    name: string;
    avatar_url: string | null;
  };
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  is_published: boolean;
  is_internal: boolean;
  views_count: number;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateArticlePayload {
  title: string;
  summary?: string | null;
  content: string;
  category_id?: number | null;
  is_published?: boolean;
  is_internal?: boolean;
}

export interface ArticleFilters {
  search?: string;
  category_id?: number;
  is_internal?: boolean;
  is_published?: boolean;
}

export interface ArticleSuggestion {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  category_name: string;
}
