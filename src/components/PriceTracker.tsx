"use client";

import { useState } from "react";
import { getFlipkartPrice } from "@/app/actions";

export default function PriceTracker({ onAdd }: { onAdd?: () => void }) {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const data = await getFlipkartPrice(url);
            if (data.error) {
                setError(data.error);
            } else {
                setResult(data);
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = async () => {
        if (!result) return;

        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            alert("Please login first");
            return;
        }

        const user = JSON.parse(storedUser);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user._id,
                    title: result.title,
                    price: result.price,
                    url: url,
                    image: result.image
                }),
            });

            if (response.ok) {
                if (onAdd) {
                    onAdd();
                }
            } else {
                alert("Failed to save to database");
            }
        } catch (error) {
            console.error("Error saving order:", error);
            alert("Could not connect to server");
        }
    };

    return (
        <section style={{ marginTop: '8rem', width: '100%', maxWidth: '900px', alignSelf: 'center' }}>
            <div className="card" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
                {/* Background Accent */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', filter: 'blur(40px)' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
                            Real-time <span className="gradient-text">Price Engine</span>
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                            Paste any Flipkart product link to instantly verify the current market price.
                        </p>
                    </div>

                    <form onSubmit={handleTrack} style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="input"
                                placeholder="https://www.flipkart.com/product-link-here..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                style={{
                                    height: '64px',
                                    padding: '0 24px',
                                    fontSize: '1.1rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '16px'
                                }}
                            />
                            <button
                                disabled={loading}
                                className="btn-primary"
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '8px',
                                    bottom: '8px',
                                    padding: '0 32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    opacity: 1,
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px' }}>sync</span>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bolt</span>
                                        Get Price
                                    </>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="animate-fade-in" style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                background: 'rgba(255,0,0,0.05)',
                                border: '1px solid rgba(255,0,0,0.1)',
                                borderRadius: '12px',
                                color: '#ff4444',
                                fontSize: '0.9rem',
                                textAlign: 'center'
                            }}>
                                <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px', fontSize: '18px' }}>error</span>
                                {error}
                            </div>
                        )}

                        {result && (
                            <div className="animate-fade-in" style={{
                                marginTop: '2.5rem',
                                padding: '2.5rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '32px',
                                display: 'flex',
                                gap: '2.5rem',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                boxShadow: '0 20px 40px rgba(255,255,255,0.05)'
                            }}>
                                {result.image && (
                                    <div style={{
                                        width: '120px',
                                        height: '140px',
                                        background: 'white',
                                        borderRadius: '20px',
                                        padding: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                                    }}>
                                        <img src={result.image} alt={result.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    </div>
                                )}

                                <div style={{ textAlign: 'left', flex: '1', minWidth: '200px' }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: 'rgba(255,255,255,0.1)',
                                        padding: '4px 12px',
                                        borderRadius: '100px',
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        marginBottom: '1rem',
                                        letterSpacing: '0.5px'
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                                        MATCH FOUND
                                    </div>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.8rem', lineHeight: 1.3 }}>{result.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
                                        Verified at {result.timestamp}
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right', minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Live Price</p>
                                        <p style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1, textDecoration: 'line-through', opacity: 0.6 }}>₹{result.price}</p>
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Money Back</p>
                                            <p style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-3px', lineHeight: 1 }}>₹{(parseFloat(result.price.replace(/,/g, '')) / 2).toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-primary"
                                        style={{
                                            width: '100%',
                                            padding: '12px 20px',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                                            border: 'none'
                                        }}
                                        onClick={handleAddClick}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>shopping_cart</span>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
}
