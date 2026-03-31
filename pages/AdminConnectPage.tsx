import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { startCloverAuth, checkCloverConnection, bypassCloverAuth } from '../lib/api';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import { Eye, EyeOff } from 'lucide-react';

interface HealthStatus {
    connected: boolean;
    merchant_id: string | null;
    token_valid: boolean;
    token_expires_in: number | null;
    token_expires_at: string | null;
    has_refresh_token: boolean;
    permissions: {
        read_merchant: boolean;
        read_inventory: boolean;
        write_inventory: boolean;
        read_orders: boolean;
        write_orders: boolean;
    };
    all_ready: boolean;
    errors: string[];
}

// =====================================================
// Change Credentials Component
// =====================================================
const ChangeCredentials: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'verify' | 'change'>('verify');
    const [currentUsername, setCurrentUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setStep('verify');
        setCurrentUsername('');
        setCurrentPassword('');
        setNewUsername('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post('/api/admin/login', { username: currentUsername, password: currentPassword });
            setStep('change');
            setNewUsername(currentUsername); // Pre-fill with current username
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleChangeCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!newUsername.trim()) {
            setError('Username cannot be empty');
            return;
        }
        if (!newPassword.trim()) {
            setError('Password cannot be empty');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }
        if (newPassword.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }

        setLoading(true);
        try {
            await axios.put('/api/admin/credentials', {
                currentUsername,
                currentPassword,
                newUsername: newUsername.trim(),
                newPassword: newPassword.trim(),
            });
            setSuccess('Credentials updated successfully! Use your new credentials next time you log in.');
            setStep('verify');
            setCurrentUsername('');
            setCurrentPassword('');
            setNewUsername('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-6 border-t border-stone-200 mt-6">
            <button
                onClick={() => { setIsOpen(!isOpen); if (!isOpen) { resetForm(); } }}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center group-hover:bg-stone-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-600"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-medium text-stone-800">Change Login Credentials</p>
                        <p className="text-xs text-stone-500">Update your admin username and password</p>
                    </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-stone-400 group-hover:text-stone-600 transition-all ${isOpen ? 'rotate-90' : ''}`}><path d="m9 18 6-6-6-6"/></svg>
            </button>

            {isOpen && (
                <div className="mt-4 p-5 bg-stone-50 rounded-lg border border-stone-200">
                    {success && (
                        <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm text-center border border-green-200">
                            ✅ {success}
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm text-center border border-red-200">
                            {error}
                        </div>
                    )}

                    {step === 'verify' && (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <p className="text-sm text-stone-600 mb-2">First, verify your current credentials:</p>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Current Username</label>
                                <input
                                    type="text"
                                    value={currentUsername}
                                    onChange={(e) => setCurrentUsername(e.target.value)}
                                    className="w-full text-stone-900 border border-stone-300 rounded p-2 focus:ring-2 focus:ring-stone-500 focus:outline-none bg-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full text-stone-900 border border-stone-300 rounded p-2 pr-10 focus:ring-2 focus:ring-stone-500 focus:outline-none bg-white"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700">
                                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-stone-800 text-white py-2 rounded hover:bg-stone-700 disabled:bg-stone-400 transition-colors">
                                {loading ? 'Verifying...' : 'Verify Identity'}
                            </button>
                        </form>
                    )}

                    {step === 'change' && (
                        <form onSubmit={handleChangeCredentials} className="space-y-4">
                            <div className="bg-green-50 text-green-700 p-2 rounded text-sm text-center border border-green-200 mb-2">
                                ✅ Identity verified — enter your new credentials below
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">New Username</label>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="w-full text-stone-900 border border-stone-300 rounded p-2 focus:ring-2 focus:ring-stone-500 focus:outline-none bg-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full text-stone-900 border border-stone-300 rounded p-2 pr-10 focus:ring-2 focus:ring-stone-500 focus:outline-none bg-white"
                                        required
                                        minLength={4}
                                    />
                                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700">
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full text-stone-900 border border-stone-300 rounded p-2 focus:ring-2 focus:ring-stone-500 focus:outline-none bg-white"
                                    required
                                    minLength={4}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => { setStep('verify'); setError(''); }} className="flex-1 bg-stone-200 text-stone-700 py-2 rounded hover:bg-stone-300 transition-colors">
                                    Back
                                </button>
                                <button type="submit" disabled={loading} className="flex-1 bg-stone-800 text-white py-2 rounded hover:bg-stone-700 disabled:bg-stone-400 transition-colors">
                                    {loading ? 'Saving...' : 'Save New Credentials'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};


const AdminConnectPage: React.FC = () => {
    const [connections, setConnections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<any>(null);
    const [syncError, setSyncError] = useState('');
    const [oauthError, setOauthError] = useState('');
    const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
    const [checkingHealth, setCheckingHealth] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('adminAuthenticated');
        if (!isAuthenticated) {
            navigate('/admin/login');
            return;
        }

        const success = searchParams.get('success');
        const merchantId = searchParams.get('merchantId');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            setOauthError(decodeURIComponent(errorParam));
            setLoading(false);
            return;
        }

        if (success === 'true' && merchantId) {
            setConnections([{ merchant_id: merchantId, updated_at: new Date().toISOString() }]);
            setLoading(false);
            // Auto-run health check after successful connection
            runHealthCheck();
            return;
        }

        checkCloverConnection()
            .then(res => {
                setConnections(res);
                if (res.length > 0) {
                    runHealthCheck();
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [navigate, searchParams]);

    const runHealthCheck = async () => {
        setCheckingHealth(true);
        try {
            const res = await axios.get('/api/admin/clover-health');
            setHealthStatus(res.data);
        } catch (err) {
            console.error('Health check failed:', err);
        } finally {
            setCheckingHealth(false);
        }
    };

    const handleMenuSync = async () => {
        setSyncing(true);
        setSyncResult(null);
        setSyncError('');
        try {
            const res = await axios.post('/api/admin/menu-sync');
            setSyncResult(res.data);
        } catch (err: any) {
            setSyncError(err.response?.data?.error || 'Menu sync failed');
        } finally {
            setSyncing(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect from Clover? This will remove all menu item mappings.')) return;
        setDisconnecting(true);
        try {
            await axios.delete('/api/admin/clover-health');
            setConnections([]);
            setHealthStatus(null);
            setSyncResult(null);
            setSyncError('');
            setOauthError('');
        } catch (err: any) {
            alert('Failed to disconnect: ' + (err.response?.data?.message || err.message));
        } finally {
            setDisconnecting(false);
        }
    };

    const PermissionBadge = ({ label, granted }: { label: string; granted: boolean }) => (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
            granted
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
            <span>{granted ? '✅' : '❌'}</span>
            <span>{label}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar isScrolled={true} />
            <main className="flex-grow container mx-auto px-4 pt-32 pb-12">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-stone-200">
                    <h1 className="text-3xl font-serif text-stone-800 mb-6">Connect to Clover POS</h1>

                    {/* OAuth Error Banner */}
                    {oauthError && (
                        <div className="mb-6 bg-red-50 border border-red-300 p-5 rounded-md">
                            <p className="text-red-800 font-bold text-lg mb-2">❌ Connection Failed</p>
                            <p className="text-red-700 text-sm mb-3">Clover returned: <strong>{oauthError}</strong></p>
                            <div className="text-sm text-red-600 space-y-1">
                                <p>This usually means:</p>
                                <ul className="list-disc ml-5 space-y-1">
                                    <li>The authorization code expired — try clicking <strong>"Connect Clover Account"</strong> again</li>
                                    <li>The app's Client ID or Secret doesn't match the Clover Developer Dashboard</li>
                                    <li>The Redirect URI in your <code className="bg-red-100 px-1 rounded">.env</code> doesn't match what's configured in the Clover app</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Connection Status */}
                    <div className="mb-6">
                        <h2 className="text-xl font-medium text-stone-700 mb-4">Connection Status</h2>
                        {loading ? (
                            <p className="text-stone-500">Checking status...</p>
                        ) : connections.length > 0 ? (
                            <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-800 font-medium">✅ Connected to {connections.length} merchant(s)</p>
                                        <ul className="mt-2 text-sm text-green-700">
                                            {connections.map((c: any) => (
                                                <li key={c.merchant_id}>Merchant ID: {c.merchant_id} (Updated: {new Date(c.updated_at).toLocaleDateString()})</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <button
                                        onClick={handleDisconnect}
                                        disabled={disconnecting}
                                        className="ml-4 bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-700 font-medium text-sm px-4 py-2 rounded-md transition-colors whitespace-nowrap border border-red-300"
                                    >
                                        {disconnecting ? 'Disconnecting...' : '🔌 Disconnect'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                                <p className="text-amber-800">⚠️ Not connected to Clover</p>
                            </div>
                        )}
                    </div>

                    {/* Connect / Reconnect Buttons */}
                    <div className="flex flex-col gap-4 mb-8">
                        <p className="text-stone-600">
                            Click the button below to authorize this application to access your Clover merchant account.
                            You will be redirected to Clover to sign in and approve permissions.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={startCloverAuth}
                                className="flex-1 bg-[#2d7a31] hover:bg-[#236327] text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
                            >
                                {connections.length > 0 ? 'Reconnect Clover Account' : 'Connect Clover Account'}
                            </button>
                            <button
                                onClick={bypassCloverAuth}
                                className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
                                title="Use this to instantly mock a connection for local testing"
                            >
                                Bypass (Mock Connection)
                            </button>
                        </div>
                    </div>

                    {/* Permission Health Check */}
                    {connections.length > 0 && (
                        <div className="mb-8 pt-6 border-t border-stone-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-medium text-stone-700">Permission Check</h2>
                                <button
                                    onClick={runHealthCheck}
                                    disabled={checkingHealth}
                                    className="text-sm bg-stone-100 hover:bg-stone-200 disabled:bg-stone-50 px-4 py-2 rounded-md transition-colors text-stone-700 font-medium"
                                >
                                    {checkingHealth ? '⏳ Checking...' : '🔄 Re-check'}
                                </button>
                            </div>

                            {checkingHealth && !healthStatus && (
                                <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-md">
                                    <svg className="animate-spin h-5 w-5 text-stone-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                    <span className="text-stone-600">Verifying Clover API permissions...</span>
                                </div>
                            )}

                            {healthStatus && (
                                <>
                                    {/* Overall Status */}
                                    <div className={`p-4 rounded-md mb-4 ${
                                        healthStatus.all_ready
                                            ? 'bg-green-50 border border-green-200'
                                            : 'bg-red-50 border border-red-200'
                                    }`}>
                                        <p className={`font-bold ${healthStatus.all_ready ? 'text-green-800' : 'text-red-800'}`}>
                                            {healthStatus.all_ready
                                                ? '✅ All permissions verified — ready for menu sync!'
                                                : '❌ Missing required permissions — menu sync will fail'
                                            }
                                        </p>
                                        {healthStatus.token_expires_at && (() => {
                                            const mins = healthStatus.token_expires_in ?? 0;
                                            const days = Math.floor(mins / 1440);
                                            const hours = Math.floor((mins % 1440) / 60);
                                            const expiry = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${mins % 60}m` : `${mins}m`;
                                            const urgent = mins < 1440; // < 1 day
                                            return (
                                                <p className={`text-sm mt-1 ${urgent ? 'text-amber-700 font-medium' : 'text-stone-600'}`}>
                                                    {urgent ? '⚠️ ' : ''}Token expires in {expiry} ({new Date(healthStatus.token_expires_at).toLocaleDateString()})
                                                </p>
                                            );
                                        })()}
                                        {!healthStatus.has_refresh_token && healthStatus.token_valid && (
                                            <p className="text-sm text-amber-700 mt-1">⚠️ No refresh token — when this token expires you must reconnect manually</p>
                                        )}
                                    </div>

                                    {/* Permission Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                        <PermissionBadge label="Read Merchant" granted={healthStatus.permissions.read_merchant} />
                                        <PermissionBadge label="Read Inventory" granted={healthStatus.permissions.read_inventory} />
                                        <PermissionBadge label="Write Inventory" granted={healthStatus.permissions.write_inventory} />
                                        <PermissionBadge label="Read Orders" granted={healthStatus.permissions.read_orders} />
                                        <PermissionBadge label="Write Orders" granted={healthStatus.permissions.write_orders} />
                                    </div>

                                    {/* Fix Instructions */}
                                    {!healthStatus.all_ready && (
                                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                                            <p className="text-amber-800 font-semibold mb-2">How to fix missing permissions:</p>
                                            <ol className="list-decimal ml-5 text-sm text-amber-700 space-y-1">
                                                <li>
                                                    Go to your{' '}
                                                    <a href="https://sandbox.dev.clover.com/developer-home/apps" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-medium">
                                                        Clover Developer Dashboard
                                                    </a>
                                                </li>
                                                <li>Select your app → <strong>Settings → Requested Permissions</strong></li>
                                                <li>Enable: <strong>Read/Write Inventory</strong>, <strong>Read/Write Orders</strong>, <strong>Read Merchant</strong></li>
                                                <li>Save the permissions</li>
                                                <li>On your merchant dashboard → <strong>More Tools</strong> → Uninstall → Reinstall the app</li>
                                                <li>Click <strong>"Reconnect Clover Account"</strong> above, then click <strong>"Re-check"</strong></li>
                                            </ol>
                                        </div>
                                    )}

                                    {/* Errors */}
                                    {healthStatus.errors.length > 0 && (
                                        <details className="mt-3">
                                            <summary className="text-xs text-stone-500 cursor-pointer hover:text-stone-700">View detailed errors ({healthStatus.errors.length})</summary>
                                            <ul className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded-md space-y-1">
                                                {healthStatus.errors.map((err, i) => (
                                                    <li key={i}>• {err}</li>
                                                ))}
                                            </ul>
                                        </details>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Menu Sync — Only shown when all permissions pass */}
                    {healthStatus?.all_ready && (
                        <div className="mb-8 pt-6 border-t border-stone-200">
                            <h2 className="text-xl font-medium text-stone-700 mb-3">Menu Sync</h2>
                            <p className="text-sm text-stone-500 mb-4">
                                Push your website menu items and categories to your Clover inventory.
                                New items will be created; existing items will be updated.
                            </p>

                            <button
                                onClick={handleMenuSync}
                                disabled={syncing}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
                            >
                                {syncing ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                        Syncing Menu...
                                    </>
                                ) : (
                                    '🔄 Sync Menu to Clover'
                                )}
                            </button>

                            {syncError && (
                                <div className="mt-4 bg-red-50 border border-red-200 p-4 rounded-md">
                                    <p className="text-red-800 text-sm">{syncError}</p>
                                </div>
                            )}

                            {syncResult && (
                                <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-md space-y-3">
                                    <p className="text-green-800 font-medium text-lg">✅ Menu synced successfully!</p>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                                        <div className="bg-white p-3 rounded border border-green-100 text-center">
                                            <p className="text-2xl font-bold text-blue-600">{syncResult.summary.items_matched || 0}</p>
                                            <p className="text-stone-500 text-xs">Linked to Existing</p>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-green-100 text-center">
                                            <p className="text-2xl font-bold text-green-600">{syncResult.summary.items_created || 0}</p>
                                            <p className="text-stone-500 text-xs">New Items Created</p>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-green-100 text-center">
                                            <p className="text-2xl font-bold text-amber-600">{syncResult.summary.items_updated || 0}</p>
                                            <p className="text-stone-500 text-xs">Prices Updated</p>
                                        </div>
                                    </div>

                                    <div className="text-xs text-green-700 space-y-1">
                                        <p>📂 Categories: {syncResult.summary.categories_matched || 0} matched, {syncResult.summary.categories_created || 0} created</p>
                                        {(syncResult.summary.errors || 0) > 0 && (
                                            <p className="text-amber-700">⚠️ Errors: {syncResult.summary.errors}</p>
                                        )}
                                    </div>

                                    {syncResult.details?.matched?.length > 0 && (
                                        <details>
                                            <summary className="text-xs text-blue-600 cursor-pointer font-medium">View matched items ({syncResult.details.matched.length})</summary>
                                            <ul className="mt-1 text-xs text-blue-600 ml-4 space-y-0.5">
                                                {syncResult.details.matched.map((item: any, i: number) => (
                                                    <li key={i}>✅ {item.name} → linked to Clover "{item.clover_name}" (${item.price})</li>
                                                ))}
                                            </ul>
                                        </details>
                                    )}

                                    {syncResult.details?.created?.length > 0 && (
                                        <details>
                                            <summary className="text-xs text-green-600 cursor-pointer font-medium">View created items ({syncResult.details.created.length})</summary>
                                            <ul className="mt-1 text-xs text-green-600 ml-4 space-y-0.5">
                                                {syncResult.details.created.map((item: any, i: number) => (
                                                    <li key={i}>✨ {item.name} → {item.clover_id}</li>
                                                ))}
                                            </ul>
                                        </details>
                                    )}

                                    {syncResult.details?.updated?.length > 0 && (
                                        <details>
                                            <summary className="text-xs text-amber-600 cursor-pointer font-medium">View price updates ({syncResult.details.updated.length})</summary>
                                            <ul className="mt-1 text-xs text-amber-600 ml-4 space-y-0.5">
                                                {syncResult.details.updated.map((item: any, i: number) => (
                                                    <li key={i}>🔄 {item.name}: ${item.old_price} → ${item.new_price}</li>
                                                ))}
                                            </ul>
                                        </details>
                                    )}

                                    {syncResult.details?.errors?.length > 0 && (
                                        <details>
                                            <summary className="text-xs text-red-600 cursor-pointer font-medium">View errors ({syncResult.details.errors.length})</summary>
                                            <ul className="mt-1 text-xs text-red-600 ml-4 space-y-0.5">
                                                {syncResult.details.errors.map((err: string, i: number) => (
                                                    <li key={i}>• {err}</li>
                                                ))}
                                            </ul>
                                        </details>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Email Notifications Link */}
                    <div className="pt-6 border-t border-stone-200">
                        <button
                            onClick={() => navigate('/admin/email')}
                            className="w-full flex items-center justify-between p-4 rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center group-hover:bg-stone-200 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-600"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-stone-800">Email Notifications</p>
                                    <p className="text-xs text-stone-500">Manage alerts for orders, connections & updates</p>
                                </div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400 group-hover:text-stone-600 transition-colors"><path d="m9 18 6-6-6-6"/></svg>
                        </button>

                        {/* SMS Notifications Link */}
                        <button
                            onClick={() => navigate('/admin/sms')}
                            className="w-full flex items-center justify-between p-4 rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all group mt-3"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-stone-800">SMS Notifications</p>
                                    <p className="text-xs text-stone-500">Set up Clover SMS for order & pickup text alerts</p>
                                </div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400 group-hover:text-stone-600 transition-colors"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                    </div>

                    {/* Change Credentials Section */}
                    <ChangeCredentials />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminConnectPage;
