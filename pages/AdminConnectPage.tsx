import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { startCloverAuth, checkCloverConnection, bypassCloverAuth } from '../lib/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminConnectPage: React.FC = () => {
    const [connections, setConnections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('adminAuthenticated');
        if (!isAuthenticated) {
            navigate('/admin/login');
            return;
        }

        // Check if we arrived from a bypass redirect
        const success = searchParams.get('success');
        const merchantId = searchParams.get('merchantId');
        if (success === 'true' && merchantId) {
            setConnections([{ merchant_id: merchantId, updated_at: new Date().toISOString() }]);
            setLoading(false);
            return;
        }

        checkCloverConnection()
            .then(res => setConnections(res))
            .catch(err => {
                console.error(err);
                // If the backend/DB is down, just show empty
            })
            .finally(() => setLoading(false));
    }, [navigate, searchParams]);

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar isScrolled={true} />
            <main className="flex-grow container mx-auto px-4 pt-32 pb-12">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-stone-200">
                    <h1 className="text-3xl font-serif text-stone-800 mb-6">Connect to Clover POS</h1>

                    <div className="mb-8">
                        <h2 className="text-xl font-medium text-stone-700 mb-4">Connection Status</h2>
                        {loading ? (
                            <p className="text-stone-500">Checking status...</p>
                        ) : connections.length > 0 ? (
                            <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                                <p className="text-green-800 font-medium">✅ Connected to {connections.length} merchant(s)</p>
                                <ul className="mt-2 text-sm text-green-700">
                                    {connections.map((c: any) => (
                                        <li key={c.merchant_id}>Merchant ID: {c.merchant_id} (Updated: {new Date(c.updated_at).toLocaleDateString()})</li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                                <p className="text-amber-800">⚠️ Not connected to Clover</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4">
                        <p className="text-stone-600">
                            Click the button below to authorize this application to access your Clover merchant account.
                            You will be redirected to Clover to sign in and approve permissions.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={startCloverAuth}
                                className="flex-1 bg-[#2d7a31] hover:bg-[#236327] text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
                            >
                                Connect Clover Account
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

                    {/* Email Notifications Link */}
                    <div className="mt-8 pt-6 border-t border-stone-200">
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
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminConnectPage;
