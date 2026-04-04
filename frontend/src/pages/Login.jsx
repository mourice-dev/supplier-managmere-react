import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else {
                setError(data.message || 'Invalid credentials. Please try again.');
            }
        } catch (err) {
            // Fallback demo login if backend not running
            if ((username === 'admin' && password === 'admin123')) {
                localStorage.setItem('user', JSON.stringify({ id: 1, username: 'admin', role: 'Admin' }));
                navigate('/dashboard');
            } else if (username === 'user' && password === 'user123') {
                localStorage.setItem('user', JSON.stringify({ id: 2, username: 'user', role: 'User' }));
                navigate('/dashboard');
            } else {
                setError('Invalid credentials. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="glass-card">
                <div className="text-center mb-4">
                    <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'60px',height:'60px',borderRadius:'16px',background:'linear-gradient(135deg,#6366F1,#06B6D4)',marginBottom:'0.75rem'}}>
                        <i className="bi bi-box-seam-fill text-white" style={{fontSize:'1.6rem'}}></i>
                    </div>
                    <h2 className="mt-1 mb-0">ProCureSys+</h2>
                    <p className="text-muted mb-0" style={{fontSize:'0.9rem'}}>Smart Procurement Workflow</p>
                </div>

                {error && (
                    <div className="alert alert-danger border-0 d-flex align-items-center py-2 px-3 mb-3" role="alert" style={{fontSize:'0.88rem'}}>
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <div>{error}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label" style={{fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',color:'#94A3B8'}}>Username</label>
                        <div className="input-group">
                            <span className="input-group-text" style={{background:'#F8FAFC',border:'1.5px solid #E2E8F0',borderRight:'none',borderRadius:'12px 0 0 12px',color:'#94A3B8'}}>
                                <i className="bi bi-person"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                                autoFocus
                                style={{borderLeft:'none',borderRadius:'0 12px 12px 0'}}
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="form-label" style={{fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',color:'#94A3B8'}}>Password</label>
                        <div className="input-group">
                            <span className="input-group-text" style={{background:'#F8FAFC',border:'1.5px solid #E2E8F0',borderRight:'none',borderRadius:'12px 0 0 12px',color:'#94A3B8'}}>
                                <i className="bi bi-lock"></i>
                            </span>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                style={{borderLeft:'none',borderRadius:'0 12px 12px 0'}}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary-custom w-100 py-3 d-flex align-items-center justify-content-center fw-bold"
                        style={{fontSize:'0.95rem'}}
                        disabled={loading}
                    >
                        {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Signing in…</> : <>Sign In <i className="bi bi-arrow-right-short ms-1 fs-5"></i></>}
                    </button>
                </form>

                <div className="text-center mt-4 pt-3" style={{borderTop:'1px solid #E2E8F0'}}>
                    <small className="text-muted d-block mb-2" style={{fontSize:'0.78rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em'}}>Demo Credentials</small>
                    <div className="d-flex gap-2 justify-content-center flex-wrap">
                        <span style={{background:'#F1F5F9',padding:'0.35rem 0.75rem',borderRadius:'8px',fontSize:'0.82rem',fontWeight:600,color:'#334155',cursor:'pointer'}} onClick={() => { setUsername('admin'); setPassword('admin123'); }}>
                            <i className="bi bi-shield-check text-success me-1"></i> admin / admin123
                        </span>
                        <span style={{background:'#F1F5F9',padding:'0.35rem 0.75rem',borderRadius:'8px',fontSize:'0.82rem',fontWeight:600,color:'#334155',cursor:'pointer'}} onClick={() => { setUsername('user'); setPassword('user123'); }}>
                            <i className="bi bi-person-check text-primary me-1"></i> user / user123
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
