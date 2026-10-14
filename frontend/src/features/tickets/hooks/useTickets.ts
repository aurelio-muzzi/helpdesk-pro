import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '../services/ticketService';
import type {
  CreateTicketPayload,
  AssignTicketPayload,
  ChangeTicketStatusPayload,
  TicketFilterParams,
} from '../types';

export const TICKET_KEYS = {
  all: ['tickets'] as const,
  list: (params?: TicketFilterParams) => ['tickets', 'list', params] as const,
  detail: (id: number) => ['tickets', 'detail', id] as const,
};

export const useTickets = (params?: TicketFilterParams) => {
  return useQuery({
    queryKey: TICKET_KEYS.list(params),
    queryFn: () => ticketService.getTickets(params),
  });
};

export const useTicket = (id: number) => {
  return useQuery({
    queryKey: TICKET_KEYS.detail(id),
    queryFn: () => ticketService.getTicket(id),
    enabled: Boolean(id),
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTicketPayload) => ticketService.createTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
};

export const useAssignTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AssignTicketPayload }) =>
      ticketService.assignTicket(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
};

export const useChangeTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ChangeTicketStatusPayload }) =>
      ticketService.changeTicketStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
};

export const useRateSatisfaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, rating, comment }: { ticketId: number; rating: number; comment?: string }) =>
      ticketService.rateSatisfaction(ticketId, rating, comment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.detail(variables.ticketId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
};

export const useReopenTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, reason }: { ticketId: number; reason?: string }) =>
      ticketService.reopenTicket(ticketId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.detail(variables.ticketId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
};
