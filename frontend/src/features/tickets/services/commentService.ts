import { api, type ApiResponse } from '@/lib/axios';
import type { TicketComment, CreateCommentPayload } from '../types';

export const commentService = {
  getComments: async (ticketId: number): Promise<TicketComment[]> => {
    const response = await api.get<ApiResponse<TicketComment[]>>(`/tickets/${ticketId}/comments`);
    return response.data.data;
  },

  addComment: async (ticketId: number, payload: CreateCommentPayload): Promise<TicketComment> => {
    const formData = new FormData();
    formData.append('content', payload.content);

    if (payload.is_internal !== undefined) {
      formData.append('is_internal', payload.is_internal ? '1' : '0');
    }

    if (payload.attachments && payload.attachments.length > 0) {
      payload.attachments.forEach((file) => {
        formData.append('attachments[]', file);
      });
    }

    const response = await api.post<ApiResponse<TicketComment>>(
      `/tickets/${ticketId}/comments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  },
};
