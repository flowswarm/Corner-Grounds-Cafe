// SMS is handled natively by Clover's built-in transactional messaging.
// No third-party SMS service needed.
//
// This file is kept as a stub so existing imports don't break.
// Clover sends order SMS automatically once toll-free number is approved
// and order-related messaging is enabled in Dashboard > Customers > Promos.

const sendOrderConfirmationSMS = async () => null;
const sendPickupReminderSMS = async () => null;
const sendTestSMS = async () => null;
const getSmsConfig = async () => ({ configured: false, enabled: false });

module.exports = {
    getSmsConfig,
    sendOrderConfirmationSMS,
    sendPickupReminderSMS,
    sendTestSMS,
};
