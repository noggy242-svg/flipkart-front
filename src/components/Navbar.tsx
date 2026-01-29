"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar({ onSignIn }: { onSignIn?: () => void }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);
    const [bankDetails, setBankDetails] = useState({
        bankName: "",
        accountOwner: "",
        accountNumber: "",
        ifscCode: "",
        upiId: ""
    });
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
            setIsLoggedIn(true);
        }
    }, []);

    const fetchBankDetails = async () => {
        if (!currentUser?._id) return;
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/profile/${currentUser._id}`);
            const data = await response.json();
            if (response.ok) {
                setBankDetails({
                    bankName: data.bankName || "",
                    accountOwner: data.accountOwner || "",
                    accountNumber: data.accountNumber || "",
                    ifscCode: data.ifscCode || "",
                    upiId: data.upiId || ""
                });
            }
        } catch (error) {
            console.error("Error fetching bank details:", error);
        }
    };

    const handleSaveBankDetails = async () => {
        if (!currentUser?._id) return;
        setIsSaving(true);
        setSaveStatus('idle');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/profile/${currentUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bankDetails)
            });
            if (response.ok) {
                setSaveStatus('success');
                setTimeout(() => {
                    setShowBankModal(false);
                    setSaveStatus('idle');
                }, 2000);
            } else {
                setSaveStatus('error');
            }
        } catch (error) {
            console.error("Error saving bank details:", error);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setCurrentUser(null);
        setDropdownOpen(false);
        router.push("/");
    };

    return (
        <header className="glass" style={{ margin: '0', borderBottom: '1px solid var(--glass-border)', padding: '0.8rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '0', zIndex: 100, borderRadius: '0' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.05em' }} className="gradient-text">
                    OFFERS
                </div>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>
                {!isLoggedIn ? (
                    <button
                        onClick={onSignIn}
                        className="glass"
                        style={{ padding: '8px 20px', fontSize: '0.9rem', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Sign In
                    </button>
                ) : (
                    <>
                        <div
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'rgba(255,255,255,0.05)',
                                padding: '6px 14px',
                                borderRadius: '100px',
                                border: '1px solid var(--glass-border)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            className="nav-item-hover"
                        >
                            <div style={{ width: '28px', height: '28px', background: 'linear-gradient(45deg, #fff, #888)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 800, fontSize: '0.7rem' }}>
                                {currentUser?.email?.substring(0, 2).toUpperCase() || 'JD'}
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9 }}>{currentUser?.email?.split('@')[0] || 'User'}</span>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', opacity: 0.5 }}>
                                {dropdownOpen ? 'expand_less' : 'expand_more'}
                            </span>
                        </div>

                        {dropdownOpen && (
                            <div className="glass animate-fade-in" style={{
                                position: 'absolute',
                                top: '120%',
                                right: 0,
                                width: '240px',
                                padding: '1.5rem',
                                background: 'rgba(10, 10, 10, 0.95)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                zIndex: 1000
                            }}>
                                <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <p style={{ fontWeight: 800, fontSize: '1rem' }}>{currentUser?.email?.split('@')[0] || 'User'}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{currentUser?.email}</p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => { fetchBankDetails(); setShowBankModal(true); setDropdownOpen(false); }}
                                        className="nav-item-hover"
                                        style={{ background: 'none', border: 'none', color: 'white', textAlign: 'left', padding: '8px 0', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>account_balance</span> Add bank account/UPI
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="nav-item-hover"
                                        style={{ background: 'none', border: 'none', color: '#ff4444', textAlign: 'left', padding: '8px 0', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span> Sign Out
                                    </button>
                                </div>
                            </div>
                        )}

                        {(currentUser?.isAdmin || currentUser?.email === "superoffer@mail.com") ? (
                            <Link href="/admin">
                                <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>Admin Panel</button>
                            </Link>
                        ) : (
                            <Link href="/dashboard">
                                <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>Dashboard</button>
                            </Link>
                        )}
                    </>
                )}
            </div>

            {showBankModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '2rem' }}>
                    <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', background: 'var(--card-bg)', border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Bank / UPI Details</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enter your details to receive money back.</p>
                            </div>
                            <button
                                onClick={() => setShowBankModal(false)}
                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                            </button>
                        </div>

                        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '4px' }}>Bank Name</label>
                                <input className="input" placeholder="e.g. HDFC Bank" value={bankDetails.bankName} onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '4px' }}>Account Owner Name</label>
                                <input className="input" placeholder="Name as per bank records" value={bankDetails.accountOwner} onChange={(e) => setBankDetails({ ...bankDetails, accountOwner: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '4px' }}>Account Number</label>
                                    <input className="input" placeholder="0000 0000 0000" value={bankDetails.accountNumber} onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '4px' }}>IFSC Code</label>
                                    <input className="input" placeholder="SBIN0000000" value={bankDetails.ifscCode} onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', position: 'relative', margin: '0.5rem 0' }}>
                                <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />
                                <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgb(15, 15, 15)', padding: '0 15px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800 }}>OR</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '4px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '4px' }}>UPI ID</label>
                                    {bankDetails.upiId && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4ade80', fontSize: '0.65rem', fontWeight: 800, background: 'rgba(74, 222, 128, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>verified</span> SAVED
                                        </div>
                                    )}
                                </div>
                                <input className="input" placeholder="yourname@upi" value={bankDetails.upiId} onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })} />
                            </div>

                            {saveStatus === 'success' && (
                                <div className="animate-fade-in" style={{ padding: '1rem', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', borderRadius: '12px', color: '#4ade80', fontSize: '0.9rem', textAlign: 'center', fontWeight: 600 }}>
                                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px', fontSize: '18px' }}>check_circle</span>
                                    Information saved successfully!
                                </div>
                            )}

                            {saveStatus === 'error' && (
                                <div className="animate-fade-in" style={{ padding: '1rem', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', borderRadius: '12px', color: '#f87171', fontSize: '0.9rem', textAlign: 'center', fontWeight: 600 }}>
                                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px', fontSize: '18px' }}>error</span>
                                    Failed to save information. Please try again.
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleSaveBankDetails}
                                disabled={isSaving || saveStatus === 'success'}
                                className="btn-primary"
                                style={{ marginTop: '1rem', height: '54px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: (isSaving || saveStatus === 'success') ? 0.7 : 1 }}
                            >
                                {isSaving ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px' }}>sync</span>
                                        Saving...
                                    </>
                                ) : saveStatus === 'success' ? (
                                    <>
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check</span>
                                        Saved
                                    </>
                                ) : (
                                    'Save Information'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </header>
    );
}
