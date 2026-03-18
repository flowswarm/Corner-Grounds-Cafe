import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Bell, ShoppingBag, Link2, RefreshCw, Send, Trash2, Check, AlertCircle, ChevronLeft, Loader2 } from 'lucide-react';
import { getEmailSettings, saveEmailSettings, sendTestEmail, deleteEmailSetting } from '../lib/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface EmailSetting {
    id: number;
    email: string;
    notify_orders: boolean;
    notify_connections: boolean;
    notify_site_changes: boolean;
    is_verified: boolean;
    updated_at: string;
}

const AdminEmailPage: React.FC = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState<EmailSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form state
    const [email, setEmail] = useState('');
    const [notifyOrders, setNotifyOrders] = useState(true);
    const [notifyConnections, setNotifyConnections] = useState(true);
    const [notifySiteChanges, setNotifySiteChanges] = useState(true);

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('adminAuthenticated');
        if (!isAuthenticated) {
            navigate('/admin/login');
            return;
        }
        loadSettings();
    }, [navigate]);

    const loadSettings = async () => {
        try {
            const data = await getEmailSettings();
            setSettings(data);
            if (data.length > 0) {
                const first = data[0];
                setEmail(first.email);
                setNotifyOrders(first.notify_orders);
                setNotifyConnections(first.notify_connections);
                setNotifySiteChanges(first.notify_site_changes);
            }
        } catch (err) {
            console.error('Failed to load email settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!email || !email.includes('@')) {
            setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
            return;
        }
        setSaving(true);
        setStatusMessage(null);
        try {
            await saveEmailSettings({
                email,
                notify_orders: notifyOrders,
                notify_connections: notifyConnections,
                notify_site_changes: notifySiteChanges,
            });
            setStatusMessage({ type: 'success', text: 'Email settings saved successfully!' });
            loadSettings();
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err?.response?.data?.error || 'Failed to save settings.' });
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        if (!email || !email.includes('@')) {
            setStatusMessage({ type: 'error', text: 'Please enter a valid email address first.' });
            return;
        }
        setTesting(true);
        setStatusMessage(null);
        try {
            const result = await sendTestEmail(email);
            setStatusMessage({ type: 'success', text: result.message || 'Test email sent!' });
            loadSettings();
        } catch (err: any) {
            setStatusMessage({
                type: 'error',
                text: err?.response?.data?.error || 'Failed to send test email. Check SMTP configuration.'
            });
        } finally {
            setTesting(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteEmailSetting(id);
            setStatusMessage({ type: 'success', text: 'Email removed.' });
            setEmail('');
            setNotifyOrders(true);
            setNotifyConnections(true);
            setNotifySiteChanges(true);
            loadSettings();
        } catch (err) {
            setStatusMessage({ type: 'error', text: 'Failed to remove email.' });
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar isScrolled={true} />
            <main className="flex-grow container mx-auto px-4 pt-32 pb-12">
                <div className="max-w-2xl mx-auto">
                    {/* Back Nav */}
                    <button
                        onClick={() => navigate('/admin/connect-clover')}
                        className="flex items-center gap-1 text-stone-500 hover:text-stone-700 mb-6 transition-colors text-sm"
                    >
                        <ChevronLeft size={16} />
                        Back to Clover Connect
                    </button>

                    <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                                <Mail className="text-stone-600" size={20} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-serif text-stone-800">Email Notifications</h1>
                                <p className="text-sm text-stone-500">Manage how you receive admin alerts</p>
                            </div>
                        </div>

                        {/* Status Message */}
                        {statusMessage && (
                            <div className={`flex items-center gap-2 p-4 rounded-md mb-6 ${
                                statusMessage.type === 'success'
                                    ? 'bg-green-50 border border-green-200 text-green-800'
                                    : 'bg-red-50 border border-red-200 text-red-800'
                            }`}>
                                {statusMessage.type === 'success'
                                    ? <Check size={16} />
                                    : <AlertCircle size={16} />
                                }
                                <span className="text-sm font-medium">{statusMessage.text}</span>
                            </div>
                        )}

                        {loading ? (
                            <div className="flex items-center justify-center py-12 text-stone-400">
                                <Loader2 className="animate-spin mr-2" size={20} />
                                Loading settings...
                            </div>
                        ) : (
                            <>
                                {/* Email Input */}
                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-stone-700 mb-2">
                                        Notification Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@cornergrounds.com"
                                        className="w-full text-stone-900 border border-stone-300 rounded-md p-3 focus:ring-2 focus:ring-stone-500 focus:outline-none transition-shadow"
                                    />
                                    <p className="mt-1 text-xs text-stone-400">
                                        Notifications will be sent to this email address.
                                    </p>
                                </div>

                                {/* Notification Preferences */}
                                <div className="mb-8">
                                    <h2 className="text-lg font-medium text-stone-700 mb-4 flex items-center gap-2">
                                        <Bell size={18} />
                                        Notification Preferences
                                    </h2>

                                    <div className="space-y-3">
                                        {/* Online Orders */}
                                        <label className="flex items-center gap-4 p-4 rounded-lg border border-stone-200 hover:border-stone-300 cursor-pointer transition-colors bg-stone-50/50">
                                            <input
                                                type="checkbox"
                                                checked={notifyOrders}
                                                onChange={(e) => setNotifyOrders(e.target.checked)}
                                                className="w-5 h-5 rounded border-stone-300 text-green-600 focus:ring-green-500 accent-[#2d7a31]"
                                            />
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center flex-shrink-0">
                                                    <ShoppingBag size={16} className="text-green-700" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-stone-800">Online Orders</p>
                                                    <p className="text-xs text-stone-500">Get notified when a new online order is placed</p>
                                                </div>
                                            </div>
                                        </label>

                                        {/* Connection Confirmations */}
                                        <label className="flex items-center gap-4 p-4 rounded-lg border border-stone-200 hover:border-stone-300 cursor-pointer transition-colors bg-stone-50/50">
                                            <input
                                                type="checkbox"
                                                checked={notifyConnections}
                                                onChange={(e) => setNotifyConnections(e.target.checked)}
                                                className="w-5 h-5 rounded border-stone-300 text-blue-600 focus:ring-blue-500 accent-[#2563eb]"
                                            />
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center flex-shrink-0">
                                                    <Link2 size={16} className="text-blue-700" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-stone-800">Connection Confirmations</p>
                                                    <p className="text-xs text-stone-500">Get notified when Clover POS is connected or updated</p>
                                                </div>
                                            </div>
                                        </label>

                                        {/* Website Changes */}
                                        <label className="flex items-center gap-4 p-4 rounded-lg border border-stone-200 hover:border-stone-300 cursor-pointer transition-colors bg-stone-50/50">
                                            <input
                                                type="checkbox"
                                                checked={notifySiteChanges}
                                                onChange={(e) => setNotifySiteChanges(e.target.checked)}
                                                className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500 accent-[#d97706]"
                                            />
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-8 h-8 bg-amber-100 rounded-md flex items-center justify-center flex-shrink-0">
                                                    <RefreshCw size={16} className="text-amber-700" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-stone-800">Website Changes & Updates</p>
                                                    <p className="text-xs text-stone-500">Get notified when changes are made to the website</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-400 text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <><Loader2 size={16} className="animate-spin" /> Saving...</>
                                        ) : (
                                            <><Check size={16} /> Save Settings</>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleTest}
                                        disabled={testing || !email}
                                        className="flex-1 bg-[#2d7a31] hover:bg-[#236327] disabled:bg-stone-300 text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
                                    >
                                        {testing ? (
                                            <><Loader2 size={16} className="animate-spin" /> Sending...</>
                                        ) : (
                                            <><Send size={16} /> Send Test Email</>
                                        )}
                                    </button>
                                </div>

                                {/* Existing Settings List */}
                                {settings.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-stone-200">
                                        <h3 className="text-sm font-medium text-stone-500 mb-3">Registered Emails</h3>
                                        <div className="space-y-2">
                                            {settings.map((s) => (
                                                <div key={s.id} className="flex items-center justify-between p-3 rounded-md bg-stone-50 border border-stone-200">
                                                    <div className="flex items-center gap-2">
                                                        <Mail size={14} className="text-stone-400" />
                                                        <span className="text-sm text-stone-700">{s.email}</span>
                                                        {s.is_verified && (
                                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                                                Verified
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex gap-1">
                                                            {s.notify_orders && (
                                                                <span title="Orders" className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                                                                    <ShoppingBag size={10} className="text-green-700" />
                                                                </span>
                                                            )}
                                                            {s.notify_connections && (
                                                                <span title="Connections" className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                                                                    <Link2 size={10} className="text-blue-700" />
                                                                </span>
                                                            )}
                                                            {s.notify_site_changes && (
                                                                <span title="Site Changes" className="w-5 h-5 bg-amber-100 rounded flex items-center justify-center">
                                                                    <RefreshCw size={10} className="text-amber-700" />
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleDelete(s.id)}
                                                            className="text-stone-400 hover:text-red-500 transition-colors p-1"
                                                            title="Remove email"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminEmailPage;
