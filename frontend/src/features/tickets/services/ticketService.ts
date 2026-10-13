import { api, type ApiResponse } from '@/lib/axios';
import type {
  Ticket,
  CreateTicketPayload,
  AssignTicketPayload,
  ChangeTicketStatusPayload,
  TicketFilterParams,
} from '../types';

export const ticketService = {
  getTickets: async (params?: TicketFilterParams): Promise<Ticket[]> => {
    const response = await api.get<ApiResponse<Ticket[]>>('/tickets', { params });
    return response.data.data;
  },

  getTicket: async (id: number): Promise<Ticket> => {
    const response = await api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
    return response.data.data;
  },

  createTicket: async (payload: CreateTicketPayload): Promise<Ticket> => {
    const response = await api.post<ApiResponse<Ticket>>('/tickets', payload);
    return response.data.data;
  },

  assignTicket: async (id: number, payload: AssignTicketPayload): Promise<Ticket> => {
    const response = await api.post<ApiResponse<Ticket>>(`/tickets/${id}/assign`, payload);
    return response.data.data;
  },

  changeTicketStatus: async (id: number, payload: ChangeTicketStatusPayload): Promise<Ticket> => {
    const response = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}/status`, payload);
    return response.data.data;
  },

  rateSatisfaction: async (ticketId: number, rating: number, comment?: string): Promise<void> => {
    await api.post(`/tickets/${ticketId}/satisfaction`, { rating, comment });
  },

  reopenTicket: async (ticketId: number, reason?: string): Promise<Ticket> => {
    const response = await api.post<ApiResponse<Ticket>>(`/tickets/${ticketId}/reopen`, { reason });
    return response.data.data;
  },
};
