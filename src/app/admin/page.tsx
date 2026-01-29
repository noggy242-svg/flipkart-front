"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function AdminDashboard() {
    const [users, setUsers] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'orders'>('users');

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            window.location.href = "/";
            return;
        }
        const user = JSON.parse(storedUser);
        const isAdmin = user.isAdmin || user.email === "superoffer@mail.com";
        if (!isAdmin) {
            window.location.href = "/dashboard";
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, ordersRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/users`),
                fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/orders-all`)
            ]);

            if (usersRes.ok && ordersRes.ok) {
                const usersData = await usersRes.json();
                const ordersData = await ordersRes.json();
                setUsers(usersData);
                setOrders(ordersData);
            }
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                // Update local state
                setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'white' }}>
            <Navbar />

            <main style={{ padding: '3rem 4rem' }}>
                <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.05em' }}>Admin Control Panel</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Securely managing all system data and user orders.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                        <button
                            onClick={() => setActiveTab('users')}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '10px',
                                border: 'none',
                                background: activeTab === 'users' ? 'white' : 'transparent',
                                color: activeTab === 'users' ? 'black' : 'white',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Users ({users.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '10px',
                                border: 'none',
                                background: activeTab === 'orders' ? 'white' : 'transparent',
                                color: activeTab === 'orders' ? 'black' : 'white',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            All Orders ({orders.length})
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: '48px', opacity: 0.5 }}>sync</span>
                    </div>
                ) : (
                    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
                                    {activeTab === 'users' ? (
                                        <>
                                            <th style={tableHeaderStyle}>User Email</th>
                                            <th style={tableHeaderStyle}>Password</th>
                                            <th style={tableHeaderStyle}>Bank Name</th>
                                            <th style={tableHeaderStyle}>Acc Holder</th>
                                            <th style={tableHeaderStyle}>UPI ID</th>
                                            <th style={tableHeaderStyle}>Joined</th>
                                        </>
                                    ) : (
                                        <>
                                            <th style={tableHeaderStyle}>Product</th>
                                            <th style={tableHeaderStyle}>User</th>
                                            <th style={tableHeaderStyle}>Price</th>
                                            <th style={tableHeaderStyle}>Status</th>
                                            <th style={tableHeaderStyle}>Date</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {activeTab === 'users' ? (
                                    users.map((user, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={tableCellStyle}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontWeight: 700 }}>{user.email}</span>
                                                    <button onClick={() => copyToClipboard(user.email)} style={iconButtonStyle}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>content_copy</span>
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={tableCellStyle}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{user.password}</code>
                                                    <button onClick={() => copyToClipboard(user.password)} style={iconButtonStyle}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>content_copy</span>
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={tableCellStyle}>{user.bankName || '—'}</td>
                                            <td style={tableCellStyle}>{user.accountOwner || '—'}</td>
                                            <td style={tableCellStyle}>{user.upiId || '—'}</td>
                                            <td style={tableCellStyle}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    orders.map((order, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={tableCellStyle}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {order.image && <img src={order.image} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'contain', background: 'white', padding: '2px' }} />}
                                                    <span style={{ fontWeight: 600 }}>{order.title.substring(0, 30)}...</span>
                                                </div>
                                            </td>
                                            <td style={tableCellStyle}>{users.find(u => u._id === order.userId)?.email || 'Unknown'}</td>
                                            <td style={tableCellStyle}>₹{order.price}</td>
                                            <td style={tableCellStyle}>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '100px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 800,
                                                        background: order.status === 'Success' ? 'rgba(74, 222, 128, 0.1)' :
                                                            order.status === 'Failed' ? 'rgba(248, 113, 113, 0.1)' :
                                                                'rgba(255, 255, 255, 0.1)',
                                                        color: order.status === 'Success' ? '#4ade80' :
                                                            order.status === 'Failed' ? '#f87171' :
                                                                'white',
                                                        border: '1px solid var(--glass-border)',
                                                        cursor: 'pointer',
                                                        outline: 'none',
                                                        appearance: 'none',
                                                        WebkitAppearance: 'none'
                                                    }}
                                                >
                                                    <option value="Pending" style={{ background: '#111', color: 'white' }}>Pending</option>
                                                    <option value="Success" style={{ background: '#111', color: 'white' }}>Success</option>
                                                    <option value="Failed" style={{ background: '#111', color: 'white' }}>Failed</option>
                                                </select>
                                            </td>
                                            <td style={tableCellStyle}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}

const tableHeaderStyle = {
    padding: '1.2rem 1.5rem',
    fontSize: '0.75rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    textAlign: 'left' as const,
};

const tableCellStyle = {
    padding: '1.2rem 1.5rem',
    fontSize: '0.9rem',
};

const iconButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
};
