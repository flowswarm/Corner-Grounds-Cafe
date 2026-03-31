import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Bell, ShoppingBag, Link2, RefreshCw, Send, Trash2, Check, AlertCircle, ChevronLeft, Loader2, Eye, EyeOff, Settings, Server } from 'lucide-react';
import { getEmailSettings, saveEmailSettings, sendTestEmail, deleteEmailSetting, getSmtpConfig, saveSmtpConfig, deleteSmtpConfig } from '../lib/api';
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

interface SmtpState {
    configured: boolean;
    provider: string;
    smtp_host: string;
    smtp_port: number;
    smtp_user: string;
    is_verified: boolean;
    from_name: string;
    providers: Record<string, { name: string; host: string; port: number; secure: boolean; note: string }>;
}

const PROVIDER_ICONS: Record<string, string> = {
    gmail: '📧',
    outlook: '📬',
    yahoo: '📩',
    icloud: '☁️',
    custom: '⚙️',
};

const AdminEmailPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // SMTP Config state
    const [smtp, setSmtp] = useState<SmtpState | null>(null);
    const [smtpEmail, setSmtpEmail] = useState('');
    const [smtpPassword, setSmtpPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [detectedProvider, setDetectedProvider] = useState<string>('');
    const [providerNote, setProviderNote] = useState('');
    const [savingSmtp, setSavingSmtp] = useState(false);
    const [customHost, setCustomHost] = useState('');
    const [customPort, setCustomPort] = useState(587);
    const [fromName, setFromName] = useState('Corner Grounds Cafe');

    // Notification recipient state
    const [settings, setSettings] = useState<EmailSetting[]>([]);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [notifyOrders, setNotifyOrders] = useState(true);
    const [notifyConnections, setNotifyConnections] = useState(true);
    const [notifySiteChanges, setNotifySiteChanges] = useState(true);
    const [saving, setSaving] = useState(false);

    // Test email state
    const [testing, setTesting] = useState(false);
    const [testEmail, setTestEmail] = useState('');

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('adminAuthenticated');
        if (!isAuthenticated) {
            navigate('/admin/login');
            return;
        }
        loadAll();
    }, [navigate]);

    const loadAll = async () => {
        try {
            const [smtpData, emailData] = await Promise.all([
                getSmtpConfig(),
                getEmailSettings(),
            ]);
            setSmtp(smtpData);
            setSettings(emailData);
            if (smtpData.configured) {
                setSmtpEmail(smtpData.smtp_user || '');
                setFromName(smtpData.from_name || 'Corner Grounds Cafe');
            }
            if (emailData.length > 0) {
                const first = emailData[0];
                setRecipientEmail(first.email);
                setNotifyOrders(first.notify_orders);
                setNotifyConnections(first.notify_connections);
                setNotifySiteChanges(first.notify_site_changes);
                setTestEmail(first.email);
            }
        } catch (err) {
            console.error('Failed to load email config:', err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-detect provider when email changes
    const handleSmtpEmailChange = (email: string) => {
        setSmtpEmail(email);
        if (!email.includes('@')) {
            setDetectedProvider('');
            setProviderNote('');
            return;
        }
        const domain = email.split('@')[1]?.toLowerCase();
        let provider = 'custom';
        if (domain === 'gmail.com' || domain === 'googlemail.com') provider = 'gmail';
        else if (['outlook.com', 'hotmail.com', 'live.com', 'msn.com'].includes(domain)) provider = 'outlook';
        else if (['yahoo.com', 'ymail.com', 'rocketmail.com'].includes(domain)) provider = 'yahoo';
        else if (['icloud.com', 'me.com', 'mac.com'].includes(domain)) provider = 'icloud';

        setDetectedProvider(provider);
        const providers = smtp?.providers || {};
        setProviderNote(providers[provider]?.note || '');
    };

    const handleSaveSmtp = async () => {
        if (!smtpEmail || !smtpPassword) {
            setStatusMessage({ type: 'error', text: 'Email and password/app password are required.' });
            return;
        }
        setSavingSmtp(true);
        setStatusMessage(null);
        try {
            const data: any = { email: smtpEmail, password: smtpPassword, from_name: fromName };
            if (detectedProvider === 'custom') {
                if (!customHost) {
                    setStatusMessage({ type: 'error', text: 'SMTP host is required for custom email providers.' });
                    setSavingSmtp(false);
                    return;
                }
                data.provider = 'custom';
                data.smtp_host = customHost;
                data.smtp_port = customPort;
            }
            const result = await saveSmtpConfig(data);
            setStatusMessage({ type: 'success', text: result.message || 'SMTP configured! Now send a test email to verify.' });
            await loadAll();
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err?.response?.data?.error || 'Failed to save SMTP config.' });
        } finally {
            setSavingSmtp(false);
        }
    };

    const handleRemoveSmtp = async () => {
        if (!confirm('Remove SMTP configuration? Email notifications will stop.')) return;
        try {
            await deleteSmtpConfig();
            setSmtpEmail('');
            setSmtpPassword('');
            setDetectedProvider('');
            setStatusMessage({ type: 'success', text: 'SMTP configuration removed.' });
            await loadAll();
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: 'Failed to remove SMTP config.' });
        }
    };

    const handleSaveRecipient = async () => {
        if (!recipientEmail || !recipientEmail.includes('@')) {
            setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
            return;
        }
        setSaving(true);
        setStatusMessage(null);
        try {
            await saveEmailSettings({
                email: recipientEmail,
                notify_orders: notifyOrders,
                notify_connections: notifyConnections,
                notify_site_changes: notifySiteChanges,
            });
            setStatusMessage({ type: 'success', text: 'Notification settings saved!' });
            setTestEmail(recipientEmail);
            await loadAll();
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err?.response?.data?.error || 'Failed to save settings.' });
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        const emailToTest = testEmail || recipientEmail;
        if (!emailToTest || !emailToTest.includes('@')) {
            setStatusMessage({ type: 'error', text: 'Please save a recipient email first.' });
            return;
        }
        setTesting(true);
        setStatusMessage(null);
        try {
            const result = await sendTestEmail(emailToTest);
            setStatusMessage({ type: 'success', text: result.message || 'Test email sent successfully!' });
            await loadAll();
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err?.response?.data?.error || 'Failed to send test email. Check your SMTP credentials.' });
        } finally {
            setTesting(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteEmailSetting(id);
            setStatusMessage({ type: 'success', text: 'Email removed.' });
            setRecipientEmail('');
            setNotifyOrders(true);
            setNotifyConnections(true);
            setNotifySiteChanges(true);
            await loadAll();
        } catch (err) {
            setStatusMessage({ type: 'error', text: 'Failed to remove email.' });
        }
    };

    const StepBadge = ({ num, label, done }: { num: number; label: string; done: boolean }) => (
        <div className="flex items-center gap-2 mb-4">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                done ? 'bg-green-600 text-white' : 'bg-stone-800 text-white'
            }`}>
                {done ? '✓' : num}
            </div>
            <h2 className="text-lg font-medium text-stone-700">{label}</h2>
        </div>
    );

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
                                <p className="text-sm text-stone-500">Set up your email provider and notification preferences</p>
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
                                {/* ============================================ */}
                                {/* STEP 1: Configure Email Provider (SMTP)       */}
                                {/* ============================================ */}
                                <div className="mb-8">
                                    <StepBadge num={1} label="Configure Email Provider" done={!!smtp?.configured && !!smtp?.is_verified} />

                                    {smtp?.configured ? (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-green-800 font-medium flex items-center gap-2">
                                                        {PROVIDER_ICONS[smtp.provider] || '📧'} {smtp.providers?.[smtp.provider]?.name || smtp.provider} configured
                                                        {smtp.is_verified && <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">Verified</span>}
                                                    </p>
                                                    <p className="text-green-700 text-sm mt-1">Sending from: {smtp.smtp_user}</p>
                                                </div>
                                                <button
                                                    onClick={handleRemoveSmtp}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-sm text-stone-500">
                                                Enter the email address you want to send notifications <strong>from</strong>. 
                                                We'll auto-detect your provider (Gmail, Outlook, Yahoo, iCloud, or custom).
                                            </p>

                                            {/* Sender Email */}
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-1">Sender Email Address</label>
                                                <input
                                                    type="email"
                                                    value={smtpEmail}
                                                    onChange={(e) => handleSmtpEmailChange(e.target.value)}
                                                    placeholder="youremail@gmail.com"
                                                    className="w-full text-stone-900 border border-stone-300 rounded-md p-3 focus:ring-2 focus:ring-stone-500 focus:outline-none"
                                                />
                                            </div>

                                            {/* Auto-detected provider badge */}
                                            {detectedProvider && (
                                                <div className={`flex items-center gap-2 p-3 rounded-md border ${
                                                    detectedProvider !== 'custom' 
                                                        ? 'bg-blue-50 border-blue-200 text-blue-800' 
                                                        : 'bg-amber-50 border-amber-200 text-amber-800'
                                                }`}>
                                                    <span className="text-lg">{PROVIDER_ICONS[detectedProvider]}</span>
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {detectedProvider !== 'custom' 
                                                                ? `Detected: ${smtp?.providers?.[detectedProvider]?.name || detectedProvider}`
                                                                : 'Custom Email Provider'}
                                                        </p>
                                                        {detectedProvider === 'gmail' && (
                                                            <p className="text-xs mt-0.5">
                                                                You'll need an App Password →{' '}
                                                                <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-900">
                                                                    Create App Password here
                                                                </a>
                                                            </p>
                                                        )}
                                                        {detectedProvider === 'outlook' && (
                                                            <p className="text-xs mt-0.5">
                                                                Use your password or create an app password →{' '}
                                                                <a href="https://account.live.com/proofs/AppPassword" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-900">
                                                                    Create App Password here
                                                                </a>
                                                            </p>
                                                        )}
                                                        {detectedProvider === 'yahoo' && (
                                                            <p className="text-xs mt-0.5">
                                                                You'll need an App Password →{' '}
                                                                <a href="https://login.yahoo.com/account/security#other-apps" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-900">
                                                                    Generate App Password here
                                                                </a>
                                                            </p>
                                                        )}
                                                        {detectedProvider === 'icloud' && (
                                                            <p className="text-xs mt-0.5">
                                                                You'll need an App-Specific Password →{' '}
                                                                <a href="https://appleid.apple.com/account/manage/section/security" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-900">
                                                                    Generate at Apple ID here
                                                                </a>
                                                            </p>
                                                        )}
                                                        {detectedProvider === 'custom' && (
                                                            <p className="text-xs mt-0.5 opacity-80">Enter your SMTP server details from your email hosting provider</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* App Password */}
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                                    {detectedProvider && detectedProvider !== 'custom' ? 'App Password' : 'Password'}
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={smtpPassword}
                                                        onChange={(e) => setSmtpPassword(e.target.value)}
                                                        placeholder={detectedProvider === 'gmail' ? 'xxxx xxxx xxxx xxxx' : '••••••••'}
                                                        className="w-full text-stone-900 border border-stone-300 rounded-md p-3 pr-10 focus:ring-2 focus:ring-stone-500 focus:outline-none"
                                                    />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700">
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                                {detectedProvider === 'gmail' && (
                                                    <p className="mt-1 text-xs text-stone-400">
                                                        Generate at:{' '}
                                                        <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                            myaccount.google.com/apppasswords
                                                        </a>
                                                    </p>
                                                )}
                                                {detectedProvider === 'yahoo' && (
                                                    <p className="mt-1 text-xs text-stone-400">
                                                        Generate at: Yahoo → Account Security → App Passwords
                                                    </p>
                                                )}
                                                {detectedProvider === 'icloud' && (
                                                    <p className="mt-1 text-xs text-stone-400">
                                                        Generate at:{' '}
                                                        <a href="https://appleid.apple.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                            appleid.apple.com
                                                        </a>{' '}→ App-Specific Passwords
                                                    </p>
                                                )}
                                            </div>

                                            {/* Custom SMTP fields */}
                                            {detectedProvider === 'custom' && (
                                                <div className="space-y-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
                                                    <p className="text-xs text-stone-500 font-medium flex items-center gap-1">
                                                        <Server size={12} /> Custom SMTP Server Settings
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-stone-600 mb-1">SMTP Host</label>
                                                            <input
                                                                type="text"
                                                                value={customHost}
                                                                onChange={(e) => setCustomHost(e.target.value)}
                                                                placeholder="smtp.yourdomain.com"
                                                                className="w-full text-stone-900 border border-stone-300 rounded p-2 text-sm focus:ring-2 focus:ring-stone-500 focus:outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-stone-600 mb-1">Port</label>
                                                            <input
                                                                type="number"
                                                                value={customPort}
                                                                onChange={(e) => setCustomPort(parseInt(e.target.value) || 587)}
                                                                className="w-full text-stone-900 border border-stone-300 rounded p-2 text-sm focus:ring-2 focus:ring-stone-500 focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* From Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-1">Display Name (From)</label>
                                                <input
                                                    type="text"
                                                    value={fromName}
                                                    onChange={(e) => setFromName(e.target.value)}
                                                    placeholder="Corner Grounds Cafe"
                                                    className="w-full text-stone-900 border border-stone-300 rounded-md p-3 focus:ring-2 focus:ring-stone-500 focus:outline-none"
                                                />
                                                <p className="mt-1 text-xs text-stone-400">
                                                    This name appears as the sender in email clients
                                                </p>
                                            </div>

                                            <button
                                                onClick={handleSaveSmtp}
                                                disabled={savingSmtp || !smtpEmail || !smtpPassword}
                                                className="w-full bg-stone-800 hover:bg-stone-700 disabled:bg-stone-300 text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
                                            >
                                                {savingSmtp ? (
                                                    <><Loader2 size={16} className="animate-spin" /> Saving...</>
                                                ) : (
                                                    <><Settings size={16} /> Save Email Configuration</>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* ============================================ */}
                                {/* STEP 2: Add Notification Recipients           */}
                                {/* ============================================ */}
                                <div className={`mb-8 pt-6 border-t border-stone-200 ${!smtp?.configured ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <StepBadge num={2} label="Add Notification Recipients" done={settings.length > 0} />

                                    <p className="text-sm text-stone-500 mb-4">
                                        Which email should <strong>receive</strong> notifications? This can be different from the sender email above.
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Recipient Email</label>
                                            <input
                                                type="email"
                                                value={recipientEmail}
                                                onChange={(e) => setRecipientEmail(e.target.value)}
                                                placeholder="admin@cornergrounds.com"
                                                className="w-full text-stone-900 border border-stone-300 rounded-md p-3 focus:ring-2 focus:ring-stone-500 focus:outline-none"
                                            />
                                        </div>

                                        {/* Notification Preferences */}
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-4 p-4 rounded-lg border border-stone-200 hover:border-stone-300 cursor-pointer transition-colors bg-stone-50/50">
                                                <input type="checkbox" checked={notifyOrders} onChange={(e) => setNotifyOrders(e.target.checked)}
                                                    className="w-5 h-5 rounded border-stone-300 accent-[#2d7a31]" />
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center flex-shrink-0">
                                                        <ShoppingBag size={16} className="text-green-700" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-stone-800">Online Orders</p>
                                                        <p className="text-xs text-stone-500">Get notified when a new order is placed</p>
                                                    </div>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-4 p-4 rounded-lg border border-stone-200 hover:border-stone-300 cursor-pointer transition-colors bg-stone-50/50">
                                                <input type="checkbox" checked={notifyConnections} onChange={(e) => setNotifyConnections(e.target.checked)}
                                                    className="w-5 h-5 rounded border-stone-300 accent-[#2563eb]" />
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center flex-shrink-0">
                                                        <Link2 size={16} className="text-blue-700" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-stone-800">Connection Confirmations</p>
                                                        <p className="text-xs text-stone-500">Clover POS connected or updated</p>
                                                    </div>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-4 p-4 rounded-lg border border-stone-200 hover:border-stone-300 cursor-pointer transition-colors bg-stone-50/50">
                                                <input type="checkbox" checked={notifySiteChanges} onChange={(e) => setNotifySiteChanges(e.target.checked)}
                                                    className="w-5 h-5 rounded border-stone-300 accent-[#d97706]" />
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-8 h-8 bg-amber-100 rounded-md flex items-center justify-center flex-shrink-0">
                                                        <RefreshCw size={16} className="text-amber-700" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-stone-800">Website Changes</p>
                                                        <p className="text-xs text-stone-500">Get notified when changes are made</p>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>

                                        <button
                                            onClick={handleSaveRecipient}
                                            disabled={saving}
                                            className="w-full bg-stone-800 hover:bg-stone-700 disabled:bg-stone-400 text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
                                        >
                                            {saving ? (
                                                <><Loader2 size={16} className="animate-spin" /> Saving...</>
                                            ) : (
                                                <><Check size={16} /> Save Recipient</>
                                            )}
                                        </button>

                                        {/* Existing Recipients List */}
                                        {settings.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-stone-100">
                                                <h3 className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wide">Registered Recipients</h3>
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
                                    </div>
                                </div>

                                {/* ============================================ */}
                                {/* STEP 3: Test Email                            */}
                                {/* ============================================ */}
                                <div className={`pt-6 border-t border-stone-200 ${!smtp?.configured || settings.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <StepBadge num={3} label="Send Test Email" done={!!smtp?.is_verified} />

                                    <p className="text-sm text-stone-500 mb-4">
                                        Send a test email to verify your configuration is working end-to-end.
                                    </p>

                                    <button
                                        onClick={handleTest}
                                        disabled={testing || !smtp?.configured}
                                        className="w-full bg-[#2d7a31] hover:bg-[#236327] disabled:bg-stone-300 text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
                                    >
                                        {testing ? (
                                            <><Loader2 size={16} className="animate-spin" /> Sending...</>
                                        ) : (
                                            <><Send size={16} /> Send Test Email to {testEmail || recipientEmail || '...'}</>
                                        )}
                                    </button>

                                    {smtp?.is_verified && (
                                        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                            <p className="text-green-800 font-medium">✅ Email system is fully configured and verified!</p>
                                            <p className="text-green-600 text-sm mt-1">You will automatically receive notifications for new orders, connections, and site changes.</p>
                                        </div>
                                    )}
                                </div>
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
