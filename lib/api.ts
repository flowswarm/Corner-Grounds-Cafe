import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxied by Vite to localhost:5000
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getMenu = async (merchantId: string) => {
    const response = await api.get(`/menu?merchantId=${merchantId}`);
    return response.data;
};

export const getPickupSlots = async (merchantId: string, date: string) => {
    const response = await api.get(`/order/pickup-slots?merchantId=${merchantId}&date=${date}`);
    return response.data;
};

export const startCloverAuth = () => {
    window.location.href = '/api/clover/oauth/start';
};

export const checkCloverConnection = async () => {
    const response = await api.get('/clover/oauth/status');
    return response.data;
};

export const bypassCloverAuth = () => {
    window.location.href = '/api/clover/oauth/bypass';
};

export default api;
