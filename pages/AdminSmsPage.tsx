import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, ChevronLeft, ExternalLink, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminSmsPage: React.FC = () => {
    const navigate = useNavigate();
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('adminAuthenticated');
        if (!isAuthenticated) {
            navigate('/admin/login');
            return;
        }
        // Load saved progress
        const saved = localStorage.getItem('smsSetupProgress');
        if (saved) {
            try { setCompletedSteps(new Set(JSON.parse(saved))); } catch {}
        }
    }, [navigate]);

    const toggleStep = (step: number) => {
        setCompletedSteps(prev => {
            const next = new Set(prev);
            if (next.has(step)) next.delete(step);
            else next.add(step);
            localStorage.setItem('smsSetupProgress', JSON.stringify([...next]));
            return next;
        });
    };

    const allDone = completedSteps.size >= 5;

    const StepCard = ({ num, title, children, tip }: { num: number; title: string; children: React.ReactNode; tip?: string }) => {
        const done = completedSteps.has(num);
        return (
            <div className={`rounded-lg border transition-all ${done ? 'bg-green-50 border-green-200' : 'bg-white border-stone-200'}`}>
                <button
                    onClick={() => toggleStep(num)}
                    className="w-full flex items-start gap-3 p-5 text-left group"
                >
                    <div className="mt-0.5 flex-shrink-0">
                        {done ? (
                            <CheckCircle2 size={22} className="text-green-600" />
                        ) : (
                            <Circle size={22} className="text-stone-300 group-hover:text-stone-500 transition-colors" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${done ? 'bg-green-200 text-green-800' : 'bg-stone-200 text-stone-600'}`}>
                                Step {num}
                            </span>
                            <h3 className={`font-medium ${done ? 'text-green-800 line-through' : 'text-stone-800'}`}>{title}</h3>
                        </div>
                        <div className={`mt-2 text-sm leading-relaxed ${done ? 'text-green-700' : 'text-stone-600'}`}>
                            {children}
                        </div>
                        {tip && !done && (
                            <div className="mt-3 flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                                <span>{tip}</span>
                            </div>
                        )}
                    </div>
                </button>
            </div>
        );
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
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Smartphone className="text-green-700" size={20} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-serif text-stone-800">SMS Notifications</h1>
                                <p className="text-sm text-stone-500">Set up Clover's built-in transactional SMS for order updates</p>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="flex items-center gap-2 mb-6 mt-4">
                            <div className="flex-1 bg-stone-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(completedSteps.size / 5) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs font-medium text-stone-500">{completedSteps.size}/5</span>
                        </div>

                        {allDone && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
                                <p className="text-green-800 font-medium text-lg">🎉 All steps complete!</p>
                                <p className="text-green-600 text-sm mt-1">
                                    Clover will now automatically send SMS notifications to customers when orders are placed.
                                </p>
                            </div>
                        )}

                        {/* How it works */}
                        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-6">
                            <p className="font-medium text-stone-800 text-sm mb-2">💡 How Clover SMS works</p>
                            <p className="text-sm text-stone-600 leading-relaxed">
                                Clover provides <strong>built-in transactional SMS</strong> that sends order confirmations and updates
                                automatically — no third-party service needed. Since your online orders already go through
                                Clover's system, you just need to activate this feature in your Clover dashboard.
                            </p>
                        </div>

                        {/* Steps */}
                        <div className="space-y-3">
                            <StepCard num={1} title="Apply for a Toll-Free Number">
                                <ol className="list-decimal ml-4 space-y-1.5">
                                    <li>
                                        Log in to your{' '}
                                        <a href="https://www.clover.com/dashboard" target="_blank" rel="noopener noreferrer"
                                           className="text-green-700 underline font-medium inline-flex items-center gap-0.5 hover:text-green-900">
                                            Clover Dashboard <ExternalLink size={11} />
                                        </a>
                                    </li>
                                    <li>Navigate to <strong>Customers → Promos</strong> in the left menu</li>
                                    <li>Click the <strong>Settings</strong> (gear icon) or <strong>"View all settings"</strong></li>
                                    <li>Under <strong>"Business operations"</strong>, select <strong>"Customer communication preferences"</strong></li>
                                    <li>Click <strong>"Apply for a toll-free phone number"</strong></li>
                                    <li>Fill in your business info (legal name, address, website) and submit</li>
                                </ol>
                                <p className="mt-2 text-xs text-stone-500">
                                    📋 You'll need: business legal name, address, email (with your domain), and a link to your website or social media.
                                </p>
                            </StepCard>

                            <StepCard
                                num={2}
                                title="Wait for Approval"
                                tip="The review process can take up to 7 business days. Clover verifies your website, social media, and opt-in policies."
                            >
                                <p>
                                    Clover reviews your application to ensure compliance with carrier regulations.
                                    You'll receive an <strong>email with your assigned toll-free number</strong> once approved.
                                </p>
                                <p className="mt-1">
                                    While waiting, move on to Step 3 to prepare your POS settings.
                                </p>
                            </StepCard>

                            <StepCard num={3} title="Turn On Order-Related Messaging">
                                <ol className="list-decimal ml-4 space-y-1.5">
                                    <li>Once your toll-free number is approved, go back to <strong>Customers → Promos → Settings</strong></li>
                                    <li>Under <strong>"Customer communication preferences"</strong>, enable <strong>transactional messages</strong></li>
                                    <li>Make sure <strong>order-related messaging</strong> is turned on (order confirmations, ready-for-pickup, etc.)</li>
                                    <li>Optionally enable <strong>digital receipts and pickup notifications</strong> under <strong>POS Manager → Locations</strong></li>
                                </ol>
                            </StepCard>

                            <StepCard num={4} title="Set Up Promo Audience (Marketing Opt-In)">
                                <ol className="list-decimal ml-4 space-y-1.5">
                                    <li>In <strong>Customers → Promos</strong>, click <strong>"Create promo"</strong> or go to <strong>Audience</strong></li>
                                    <li>Set up your promo audience with <strong>explicit marketing opt-in</strong></li>
                                    <li>This is separate from transactional messages — marketing messages require customer consent</li>
                                    <li>Customize your opt-in message and set up your audience segments</li>
                                </ol>
                                <p className="mt-2 text-xs text-stone-500">
                                    ⚠️ Transactional messages (order updates) don't require opt-in. Marketing promos do.
                                </p>
                            </StepCard>

                            <StepCard num={5} title="Test With Internal Numbers">
                                <ol className="list-decimal ml-4 space-y-1.5">
                                    <li>Before going live, <strong>place a few test orders</strong> using internal phone numbers (your own, staff, etc.)</li>
                                    <li>Verify you receive the <strong>order confirmation SMS</strong> from your toll-free number</li>
                                    <li>Check that the message content is accurate (order details, pickup time)</li>
                                    <li>If using promos, send a test promo to your internal audience first</li>
                                    <li>Once everything looks good, you're ready to go live! 🎉</li>
                                </ol>
                            </StepCard>
                        </div>

                        {/* Additional info */}
                        <div className="mt-8 pt-6 border-t border-stone-200 space-y-4">
                            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 text-sm text-stone-600">
                                <p className="font-medium text-stone-800 mb-2">📱 What customers will receive:</p>
                                <ul className="space-y-1 ml-4 list-disc">
                                    <li><strong>Order confirmation</strong> — Sent automatically when an order is placed via Clover</li>
                                    <li><strong>Order ready</strong> — Sent when the order is marked ready on your Clover POS</li>
                                    <li><strong>Digital receipts</strong> — Optional, sent via SMS after payment</li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                                <p className="font-medium mb-1">📧 Email notifications are also active</p>
                                <p className="text-blue-700">
                                    In addition to Clover SMS, your system sends branded <strong>email order confirmations</strong> and
                                    <strong> pickup reminders</strong> (10 min before pickup) automatically when customers provide their email during checkout.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminSmsPage;
