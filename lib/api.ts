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

// Email notification settings
export const getEmailSettings = async () => {
    const response = await api.get('/admin/email/settings');
    return response.data;
};

export const saveEmailSettings = async (data: {
    email: string;
    notify_orders: boolean;
    notify_connections: boolean;
    notify_site_changes: boolean;
}) => {
    const response = await api.post('/admin/email/settings', data);
    return response.data;
};

export const sendTestEmail = async (email: string) => {
    const response = await api.post('/admin/email/test', { email });
    return response.data;
};

export const deleteEmailSetting = async (id: number) => {
    const response = await api.delete(`/admin/email/settings/${id}`);
    return response.data;
};

// SMTP Configuration
export const getSmtpConfig = async () => {
    const response = await api.get('/admin/email/smtp');
    return response.data;
};

export const saveSmtpConfig = async (data: {
    email: string;
    password: string;
    provider?: string;
    smtp_host?: string;
    smtp_port?: number;
    smtp_secure?: boolean;
    from_name?: string;
}) => {
    const response = await api.post('/admin/email/smtp', data);
    return response.data;
};

export const detectSmtpProvider = async (email: string) => {
    const response = await api.post('/admin/email/smtp/detect', { email });
    return response.data;
};

export const deleteSmtpConfig = async () => {
    const response = await api.delete('/admin/email/smtp');
    return response.data;
};

export default api;
