"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PriceTracker from "@/components/PriceTracker";
import Navbar from "@/components/Navbar";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
      const isAdmin = user.isAdmin || user.email === "superoffer@mail.com";
      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!email.endsWith("@rediffmail.com") && email !== "superoffer@mail.com") {
      setLoginError("Only @rediffmail.com accounts are allowed.");
      return;
    }

    const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoggedIn(true);
        setCurrentUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        setEmail("");
        setPassword("");
        const isAdmin = data.isAdmin || data.email === "superoffer@mail.com";
        if (isAdmin) {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setLoginError(data.message || "An error occurred");
      }
    } catch (error) {
      setLoginError("Could not connect to server. Make sure backend is running.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem("user");
    setDropdownOpen(false);
    setEmail("");
    setPassword("");
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onSignIn={() => setShowLoginModal(true)} />

      {/* Login Modal */}
      {showLoginModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '2rem' }}>
          <div className="card animate-fade-in" style={{ padding: '3rem', position: 'relative', overflow: 'hidden', maxWidth: '450px', width: '100%' }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '50%', filter: 'blur(40px)' }}></div>

            <button
              onClick={() => setShowLoginModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.5 }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Account <span className="gradient-text">{isRegistering ? 'Sign Up' : 'Sign In'}</span></h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{isRegistering ? 'Create your specialized price tracking account.' : 'Access your specialized price tracking engine.'}</p>
              </div>

              <form onSubmit={handleLogin} style={{ display: 'flex', gap: '1.2rem', flexDirection: 'column' }}>
                <div>
                  <label className="label">Email Address</label>
                  <input
                    className="input"
                    placeholder="user@rediffmail.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Security Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="input"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ paddingRight: '48px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {loginError && (
                  <p style={{ color: '#ff4444', fontSize: '0.8rem', textAlign: 'center' }}>{loginError}</p>
                )}

                <button type="submit" className="btn-primary" style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1rem', marginTop: '1rem' }}>
                  <span className="material-symbols-outlined">{isRegistering ? 'person_add' : 'key'}</span>
                  {isRegistering ? 'Register Account' : 'Authenticate'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 2rem 4rem 2rem', textAlign: 'center' }}>

        {!isLoggedIn && (
          <>
            {/* STEP 1 Section */}
            <section style={{ marginTop: '4rem', width: '100%', maxWidth: '1200px' }}>
              <div style={{ textAlign: 'left', marginBottom: '3rem' }}>
                <div className="glass" style={{ display: 'inline-block', padding: '4px 16px', borderRadius: '100px', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 700, background: 'var(--primary)', color: 'black' }}>
                  STEP 01
                </div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>Account Synchronization</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Link your Rediff Mail to your Flipkart Account to enable automated tracking.</p>
              </div>

              <div className="glass" style={{
                height: '450px',
                width: '100%',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.02)'
              }}>
                {/* Background Decoration */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '300px',
                  height: '300px',
                  background: 'var(--primary)',
                  filter: 'blur(100px)',
                  opacity: 0.1,
                  zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '2rem' }}>
                  <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '64px', opacity: 0.8 }}>sync_alt</span>
                  </div>
                  <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Mandatory Linking Required</h3>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <a href="https://mail.rediff.com" target="_blank" className="btn-primary" style={{ textDecoration: 'none' }}>
                      Open Rediff Mail and Created New Account
                    </a>
                    <a href="https://www.flipkart.com/account" target="_blank" className="glass" style={{ textDecoration: 'none', padding: '12px 24px', color: 'white', fontWeight: 600 }}>
                      Change Flipkart Email to Rediff-mail(newly Cereated)
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* STEP 2 Section */}
            <section style={{ marginTop: '6rem', width: '100%', maxWidth: '600px', alignSelf: 'center' }}>
              <div className="card" style={{ padding: '2.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-15px', left: '20px', padding: '4px 16px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 800, background: 'white', color: 'black' }}>
                  STEP 02
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Secure Credential Storage</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Share your Rediff credentials here to bridge the secure API connection.</p>
                </div>

                <form
                  onSubmit={handleLogin}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}
                >
                  <div>
                    <label className="label">Rediff Email ID</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="name@rediffmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Mail Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="input"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ paddingRight: '48px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {loginError && !showLoginModal && (
                    <p style={{ color: '#ff4444', fontSize: '0.8rem', textAlign: 'center' }}>{loginError}</p>
                  )}

                  <div style={{ marginTop: '0.5rem' }}>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                      {isLoggedIn ? 'Accounts Linked ✅' : 'Authorize & Link Accounts'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', justifyContent: 'center', marginTop: '1rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock</span>
                    Encrypted with AES-256 for secure bridging
                  </div>
                </form>
              </div>
            </section>
          </>
        )}

        <div style={{ marginTop: isLoggedIn ? '4rem' : '0' }}>
          <PriceTracker />
        </div>

        <section style={{ marginTop: '8rem', width: '100%', maxWidth: '1200px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="card">
              <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Instant Sync</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Your data is always up to date across all devices with zero-latency synchronization.</p>
            </div>
            <div className="card">
              <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Secure by Design</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Enterprise-grade encryption ensures your strategic plans remain completely confidential.</p>
            </div>
            <div className="card">
              <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>AI Insights</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Intelligent suggestions to optimize your workflow and identify potential bottlenecks.</p>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ padding: '4rem 2rem', borderTop: '1px solid var(--glass-border)', marginTop: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>© 2026 Flipkart Plan. All rights reserved.</p>
      </footer>
    </div>
  );
}
