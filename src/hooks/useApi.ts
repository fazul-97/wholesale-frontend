import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

// ── Products ─────────────────────────────────────────────────────────────────
export const useProducts = (params?: { category?: string; search?: string; page?: number }) =>
  useQuery({ queryKey: ['products', params], queryFn: () => api.get('/products', { params }).then(r => r.data) });

export const useProduct = (id: string) =>
  useQuery({ queryKey: ['product', id], queryFn: () => api.get(`/products/${id}`).then(r => r.data.data), enabled: !!id });

export const useStoreProducts = (params?: { category?: string; search?: string }) =>
  useQuery({ queryKey: ['store-products', params], queryFn: () => api.get('/products/store/all', { params }).then(r => r.data) });

// ── Customer ─────────────────────────────────────────────────────────────────
export const useMe = () =>
  useQuery({ queryKey: ['me'], queryFn: () => api.get('/customers/me').then(r => r.data.data) });

export const useAddresses = () =>
  useQuery({ queryKey: ['addresses'], queryFn: () => api.get('/customers/me/addresses').then(r => r.data.data) });

export const useFrequent = () =>
  useQuery({ queryKey: ['frequent'], queryFn: () => api.get('/customers/me/frequent').then(r => r.data.data) });

export const useRecommended = () =>
  useQuery({ queryKey: ['recommended'], queryFn: () => api.get('/customers/me/recommended').then(r => r.data.data) });

// ── Orders ───────────────────────────────────────────────────────────────────
export const useMyOrders = (params?: { status?: string; page?: number }) =>
  useQuery({ queryKey: ['my-orders', params], queryFn: () => api.get('/orders', { params }).then(r => r.data) });

export const useLastOrder = () =>
  useQuery({ queryKey: ['last-order'], queryFn: () => api.get('/orders/last').then(r => r.data.data), retry: false });

export const useOrder = (id: string) =>
  useQuery({ queryKey: ['order', id], queryFn: () => api.get(`/orders/${id}`).then(r => r.data.data), enabled: !!id });

export const usePlaceOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.post('/orders', body).then(r => r.data.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-orders'] }); qc.invalidateQueries({ queryKey: ['me'] }); },
  });
};

// ── Store Orders ──────────────────────────────────────────────────────────────
export const useStoreOrders = (params?: { status?: string; page?: number }) =>
  useQuery({ queryKey: ['store-orders', params], queryFn: () => api.get('/orders/store/all', { params }).then(r => r.data) });

export const useStoreOrder = (id: string) =>
  useQuery({ queryKey: ['store-order', id], queryFn: () => api.get(`/orders/store/${id}`).then(r => r.data.data), enabled: !!id });

export const useConfirmOrder = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: { orderItemId: string; confirmedQty: number }[]) => api.put(`/orders/store/${id}/confirm`, { items }).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['store-order', id] }),
  });
};

export const useUpdateOrderStatus = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { status: string; note?: string }) => api.put(`/orders/store/${id}/status`, body).then(r => r.data.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['store-order', id] }); qc.invalidateQueries({ queryKey: ['store-orders'] }); },
  });
};

// ── Discounts ─────────────────────────────────────────────────────────────────
export const useValidateDiscount = () =>
  useMutation({ mutationFn: (body: { code: string; orderTotal: number }) => api.post('/orders/validate-discount', body).then(r => r.data.data) });

export const useDiscounts = () =>
  useQuery({ queryKey: ['discounts'], queryFn: () => api.get('/store/discounts').then(r => r.data.data) });

export const useCreateDiscount = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body: unknown) => api.post('/store/discounts', body).then(r => r.data.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['discounts'] }) });
};

export const useToggleDiscount = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.patch(`/store/discounts/${id}`, { isActive }).then(r => r.data.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['discounts'] }) });
};

// ── Loyalty Config ────────────────────────────────────────────────────────────
export const useLoyaltyConfig = () =>
  useQuery({ queryKey: ['loyalty-config'], queryFn: () => api.get('/store/loyalty/config').then(r => r.data.data) });
