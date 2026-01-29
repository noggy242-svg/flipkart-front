"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import PriceTracker from "@/components/PriceTracker";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [pendingItems, setPendingItems] = useState<any[]>([]);

    const fetchOrders = async () => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            try {
                console.log(`Fetching orders for user ID: ${user._id}`);
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${user._id}`);

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await response.text();
                    console.error("Expected JSON but got:", text.substring(0, 100));
                    return;
                }

                const data = await response.json();
                if (response.ok) {
                    setPendingItems(data);
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            window.location.href = "/";
            return;
        }
        const user = JSON.parse(storedUser);
        const isAdmin = user.isAdmin || user.email === "superoffer@mail.com";
        if (isAdmin) {
            window.location.href = "/admin";
            return;
        }
        fetchOrders();
    }, []);

    const refreshOrders = () => {
        fetchOrders();
    };

    const successCount = pendingItems.filter(i => i.status === 'Success').length;
    const [showRotationModal, setShowRotationModal] = useState(false);

    useEffect(() => {
        if (successCount >= 2) {
            setShowRotationModal(true);
        }
    }, [successCount]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--background)', color: 'var(--foreground)' }}>
            <Navbar />
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Sidebar */}
                <aside style={{ width: '280px', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(20px)' }}>
                    <div style={{ padding: '2.5rem 1.5rem', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '3rem', padding: '0 0.5rem' }}>
                            <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-symbols-outlined" style={{ color: 'black', fontSize: '20px' }}>inventory_2</span>
                            </div>
                            <div>
                                <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-1px' }}>OFFERS</h1>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px' }}>UNIFIED TRACKING</p>
                            </div>
                        </div>

                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <NavItem icon="dashboard" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                            <NavItem icon="shopping_bag" label="Amazon" active={activeTab === 'amazon'} onClick={() => setActiveTab('amazon')} />
                            <NavItem icon="shopping_cart" label="Flipkart" active={activeTab === 'flipkart'} onClick={() => setActiveTab('flipkart')} />
                            <NavItem icon="bar_chart" label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                        </nav>
                    </div>


                </aside>

                {/* Main Content */}
                <main style={{ flex: 1, overflowY: 'auto', padding: '3rem 4rem' }}>
                    {activeTab === 'dashboard' ? (
                        <>
                            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Dashboard Overview</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Manage your Amazon and Flipkart orders in one place.</p>
                                </div>
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    padding: '1.5rem 2.5rem',
                                    borderRadius: '24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    maxWidth: '500px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#EAD8B1' }}>info</span>
                                        <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'white' }}>Important Guidelines</span>
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                                        <li>Orders must be placed as <strong style={{ color: '#EAD8B1' }}>Cash on Delivery</strong>.</li>
                                        <li>Add <strong style={{ color: '#EAD8B1' }}>Bank Details/UPI</strong> in profile for money back.</li>
                                        <li>After <strong style={{ color: '#ff4444' }}>2 Successful Orders</strong>, you must change your Flipkart account.</li>
                                    </ul>
                                </div>

                            </header>

                            {/* Stats Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                                <StatCard label="Total Orders" value={pendingItems.length} growth="" trend="Current user total" icon="shopping_basket" />
                                <StatCard label="Pending" value={pendingItems.filter(i => i.status === 'Pending').length} growth="" trend="In queue" icon="hourglass_empty" color="#EAD8B1" />
                                <StatCard label="Succeeded" value={pendingItems.filter(i => i.status === 'Success').length} growth="" trend="Completed" icon="check_circle" color="white" />
                                <StatCard label="Failed" value={pendingItems.filter(i => i.status === 'Failed').length} growth="" trend="Errors" icon="error" color="#ff4444" />
                            </div>

                            {/* Recent Orders Table */}
                            <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent Orders</h3>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ position: 'relative' }}>
                                            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'var(--text-muted)' }}>search</span>
                                            <input className="input" placeholder="Search orders..." style={{ paddingLeft: '40px', width: '250px', fontSize: '0.9rem' }} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                                <th style={tableHeaderStyle}>Platform</th>
                                                <th style={tableHeaderStyle}>Order ID</th>
                                                <th style={tableHeaderStyle}>Item Name</th>
                                                <th style={tableHeaderStyle}>Status</th>
                                                <th style={tableHeaderStyle}>Total Price</th>
                                                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingItems.map((item, idx) => (
                                                <OrderRow
                                                    key={idx}
                                                    platform={item.platform}
                                                    id={`#ID-${item._id.substring(item._id.length - 5).toUpperCase()}`}
                                                    item={item.title}
                                                    date={new Date(item.createdAt).toLocaleDateString()}
                                                    status={item.status}
                                                    price={`₹${item.price}`}
                                                    url={item.url}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Showing 1 to 4 of 128 orders</p>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="glass" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', cursor: 'pointer' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                                        </button>
                                        <button className="glass" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', cursor: 'pointer' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </>
                    ) : activeTab === 'flipkart' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <header style={{ textAlign: 'left' }}>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Flipkart Inventory</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Track prices and manage your Flipkart products.</p>
                            </header>
                            <PriceTracker onAdd={() => {
                                setActiveTab('dashboard');
                                refreshOrders();
                            }} />
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '5rem' }}>
                            <h2 style={{ fontSize: '2rem', opacity: 0.5 }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View Coming Soon</h2>
                        </div>
                    )}
                </main>
            </div>
            {showRotationModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '2rem' }}>
                    <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '900px', height: '80vh', padding: '0', background: 'var(--card-bg)', border: '1px solid var(--glass-border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 68, 68, 0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="material-symbols-outlined" style={{ color: '#ff4444', fontSize: '28px' }}>warning</span>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Account Rotation Required</h2>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Security Protocol: 2-Order Limit Reached</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowRotationModal(false)}
                                className="btn-primary"
                                style={{ padding: '8px 16px', fontSize: '0.85rem', height: 'auto', background: '#ff4444', color: 'white', border: 'none' }}
                            >
                                I Have Switched Accounts
                            </button>
                        </div>

                        <div style={{ flex: 1, position: 'relative', background: 'white' }}>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', flexDirection: 'column', gap: '1rem', padding: '2rem', textAlign: 'center', zIndex: 0 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.3 }}>lock</span>
                                <p style={{ maxWidth: '400px', lineHeight: 1.5 }}>
                                    If the Flipkart page does not load below (due to browser security), please open Flipkart in a new tab, logout, and login with a fresh account.
                                </p>
                                <a href="https://www.flipkart.com/account/login?ret=/" target="_blank" className="btn-primary" style={{ background: '#2874f0', color: 'white', border: 'none' }}>
                                    Open Flipkart Login
                                </a>
                            </div>
                            <iframe
                                src="https://www.flipkart.com/account/login?ret=/"
                                style={{ width: '100%', height: '100%', border: 'none', position: 'relative', zIndex: 1 }}
                                title="Flipkart Login"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function NavItem({ icon, label, active = false, onClick }: { icon: string; label: string; active?: boolean; onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.8rem 1rem',
                borderRadius: '12px',
                cursor: 'pointer',
                background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: active ? 'white' : 'var(--text-muted)',
                fontWeight: active ? 600 : 500,
                transition: 'all 0.2s ease',
            }} className="nav-item-hover">
            <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
            <span style={{ fontSize: '0.9rem' }}>{label}</span>
            {active && <div style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: 'white' }} />}
        </div>
    );
}

function StatCard({ label, value, growth, trend, icon, color = 'white' }: any) {
    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
                <span className="material-symbols-outlined" style={{ color: color, opacity: 0.8 }}>{icon}</span>
            </div>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0' }}>{value}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {growth && <span style={{ fontSize: '0.8rem', fontWeight: 700, background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '6px' }}>{growth}</span>}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{trend}</span>
            </div>
        </div>
    );
}

function OrderRow({ platform, id, item, date, status, price, url }: any) {
    const isSuccess = status === "Success";
    const isFailed = status === "Failed";
    const isPending = status === "Pending";

    return (
        <tr style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s ease' }} className="table-row-hover">
            <td style={tableCellStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: platform === 'Amazon' ? '#333' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {/* Simple Initial for Platform */}
                        <span style={{ fontSize: '10px', fontWeight: 800, color: platform === 'Amazon' ? 'white' : 'black' }}>{platform[0]}</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>{platform}</span>
                </div>
            </td>
            <td style={tableCellStyle}><span style={{ fontFamily: 'monospace', opacity: 0.6 }}>{id}</span></td>
            <td style={tableCellStyle}>
                <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{date}</p>
                </div>
            </td>
            <td style={tableCellStyle}>
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '100px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: isSuccess ? 'rgba(74, 222, 128, 0.1)' : (isFailed ? 'rgba(248, 113, 113, 0.1)' : 'rgba(255,255,255,0.05)'),
                    color: isSuccess ? '#4ade80' : (isFailed ? '#f87171' : 'white'),
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isSuccess ? '#4ade80' : (isFailed ? '#f87171' : (isPending ? '#EAD8B1' : '#888')) }} />
                    {status}
                </span>
            </td>
            <td style={{ ...tableCellStyle, fontWeight: 700 }}>
                <p style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '0.75rem', marginBottom: '2px' }}>{price}</p>
                <p style={{ color: 'var(--accent)' }}>₹{(parseFloat(price.replace(/[^\d.]/g, '')) / 2).toLocaleString('en-IN')}</p>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Money Back</p>
            </td>
            <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>
                        Link
                    </a>
                ) : (
                    <button style={{ background: 'none', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>
                        Details
                    </button>
                )}
            </td>
        </tr>
    );
}

const tableHeaderStyle = {
    padding: '1rem 1.5rem',
    fontSize: '0.75rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
};

const tableCellStyle = {
    padding: '1.2rem 1.5rem',
    fontSize: '0.9rem',
};
