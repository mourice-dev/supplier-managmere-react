import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API = 'http://localhost:5000/api';

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user')) || { username: 'Admin', role: 'Admin' };
    const [stats, setStats] = useState({ total_suppliers: 0, pending_requests: 0, total_orders: 0, total_revenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/stats`)
            .then(r => r.json())
            .then(data => { setStats(data); setLoading(false); })
            .catch(() => {
                setStats({ total_suppliers: 14, pending_requests: 5, total_orders: 12, total_revenue: 45000 });
                setLoading(false);
            });
    }, []);

    const cards = [
        { title: 'Total Suppliers', value: stats.total_suppliers, icon: 'bi bi-building', colorClass: 'text-primary' },
        { title: 'Pending Requests', value: stats.pending_requests, icon: 'bi bi-clipboard-pulse', colorClass: 'text-warning' },
        { title: 'Total Orders', value: stats.total_orders, icon: 'bi bi-cart-check', colorClass: 'text-success' },
        { title: 'Total Revenue', value: `$${Number(stats.total_revenue || 0).toLocaleString()}`, icon: 'bi bi-currency-dollar', colorClass: 'text-info' },
    ];

    return (
        <>
            {/* Welcome Section */}
            <div className="mb-4">
                <h2 style={{fontWeight:800,fontSize:'1.6rem',letterSpacing:'-0.025em',color:'#0F172A'}}>
                    Welcome back, {user.username}! <span style={{fontSize:'1.4rem'}}>👋</span>
                </h2>
                <p style={{color:'#64748B',fontSize:'0.92rem',margin:0}}>Here's your procurement overview for today.</p>
            </div>

            {/* Stat Cards */}
            <div className="row g-4 mb-5">
                {cards.map((card, index) => (
                    <div className="col-md-6 col-xl-3" key={index}>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <i className={`${card.icon} ${card.colorClass}`}></i>
                            </div>
                            <div className="stat-details">
                                <h3>{card.title}</h3>
                                <p>{loading ? <span className="spinner-border spinner-border-sm"></span> : card.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-3 d-flex align-items-center gap-2">
                <h5 style={{fontWeight:700,fontSize:'1.05rem',margin:0,letterSpacing:'-0.01em'}}>Quick Actions</h5>
                <span style={{height:'2px',flex:1,background:'linear-gradient(90deg,#E2E8F0,transparent)',display:'block'}}></span>
            </div>
            <div className="row g-3">
                <div className="col-md-4">
                    <Link to="/requests" className="text-decoration-none">
                        <div className="card border-0 h-100" style={{cursor:'pointer'}}>
                            <div className="card-body d-flex align-items-center">
                                <div style={{width:'48px',height:'48px',borderRadius:'12px',background:'linear-gradient(135deg,#EEF2FF,#E0E7FF)',display:'flex',alignItems:'center',justifyContent:'center',marginRight:'1rem',flexShrink:0}}>
                                    <i className="bi bi-clipboard-plus-fill" style={{fontSize:'1.2rem',color:'#6366F1'}}></i>
                                </div>
                                <div>
                                    <h6 style={{margin:'0 0 2px',fontWeight:700,color:'#0F172A',fontSize:'0.92rem'}}>New Request</h6>
                                    <small style={{color:'#64748B',fontSize:'0.82rem'}}>Submit an item purchase</small>
                                </div>
                                <i className="bi bi-chevron-right ms-auto text-muted"></i>
                            </div>
                        </div>
                    </Link>
                </div>

                {user.role === 'Admin' && (
                    <>
                        <div className="col-md-4">
                            <Link to="/orders" className="text-decoration-none">
                                <div className="card border-0 h-100" style={{cursor:'pointer'}}>
                                    <div className="card-body d-flex align-items-center">
                                        <div style={{width:'48px',height:'48px',borderRadius:'12px',background:'linear-gradient(135deg,#ECFDF5,#D1FAE5)',display:'flex',alignItems:'center',justifyContent:'center',marginRight:'1rem',flexShrink:0}}>
                                            <i className="bi bi-cart-check-fill" style={{fontSize:'1.2rem',color:'#10B981'}}></i>
                                        </div>
                                        <div>
                                            <h6 style={{margin:'0 0 2px',fontWeight:700,color:'#0F172A',fontSize:'0.92rem'}}>Manage Orders</h6>
                                            <small style={{color:'#64748B',fontSize:'0.82rem'}}>Process approved workflow</small>
                                        </div>
                                        <i className="bi bi-chevron-right ms-auto text-muted"></i>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div className="col-md-4">
                            <Link to="/suppliers" className="text-decoration-none">
                                <div className="card border-0 h-100" style={{cursor:'pointer'}}>
                                    <div className="card-body d-flex align-items-center">
                                        <div style={{width:'48px',height:'48px',borderRadius:'12px',background:'linear-gradient(135deg,#FFFBEB,#FEF3C7)',display:'flex',alignItems:'center',justifyContent:'center',marginRight:'1rem',flexShrink:0}}>
                                            <i className="bi bi-building-fill" style={{fontSize:'1.2rem',color:'#F59E0B'}}></i>
                                        </div>
                                        <div>
                                            <h6 style={{margin:'0 0 2px',fontWeight:700,color:'#0F172A',fontSize:'0.92rem'}}>Manage Suppliers</h6>
                                            <small style={{color:'#64748B',fontSize:'0.82rem'}}>Add or edit vendors</small>
                                        </div>
                                        <i className="bi bi-chevron-right ms-auto text-muted"></i>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default Dashboard;
