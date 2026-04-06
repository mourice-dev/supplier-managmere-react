import React, { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';

const StatusBadge = ({ status }) => {
    const cls = { Pending: 'badge-pending', Completed: 'badge-completed', Failed: 'badge-rejected' };
    return <span className={`badge-status ${cls[status] || 'badge-pending'}`}>{status}</span>;
};

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');

    const fetchPayments = () => {
        setLoading(true);
        fetch(`${API}/payments`)
            .then(r => r.json())
            .then(data => { setPayments(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => { setPayments([]); setLoading(false); });
    };

    useEffect(() => { fetchPayments(); }, []);

    const handleMarkPaid = async (id) => {
        try {
            await fetch(`${API}/payments/${id}/complete`, { method: 'POST' });
            fetchPayments();
            showAlertMsg('Payment marked as Completed!', 'success');
        } catch { showAlertMsg('Action failed.', 'danger'); }
    };

    const showAlertMsg = (msg, type) => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 3500); };

    const filtered = filterStatus === 'All' ? payments : payments.filter(p => p.status === filterStatus);
    const totalCompleted = payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPending = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + Number(p.amount), 0);

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 style={{fontWeight:800,fontSize:'1.6rem',letterSpacing:'-0.025em',color:'#0F172A',margin:0}}>Payments</h2>
                    <p style={{color:'#64748B',fontSize:'0.92rem',margin:0}}>Track payment statuses for all orders</p>
                </div>
            </div>

            {alert && (
                <div className={`alert alert-${alert.type} border-0 d-flex align-items-center py-2 px-3 mb-3`} style={{fontSize:'0.88rem'}}>
                    <i className={`bi bi-${alert.type === 'success' ? 'check-circle-fill text-success' : 'exclamation-triangle-fill text-danger'} me-2`}></i>
                    {alert.msg}
                </div>
            )}

            {/* Summary Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="stat-card">
                        <div className="stat-icon"><i className="bi bi-check-circle text-success"></i></div>
                        <div className="stat-details"><h3>Total Paid</h3><p>${totalCompleted.toLocaleString()}</p></div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card">
                        <div className="stat-icon"><i className="bi bi-clock text-warning"></i></div>
                        <div className="stat-details"><h3>Pending</h3><p>${totalPending.toLocaleString()}</p></div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card">
                        <div className="stat-icon"><i className="bi bi-receipt text-info"></i></div>
                        <div className="stat-details"><h3>Total Payments</h3><p>{payments.length}</p></div>
                    </div>
                </div>
            </div>

            <div className="d-flex gap-2 mb-4 flex-wrap">
                {['All', 'Pending', 'Completed', 'Failed'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)} className={`btn btn-sm ${filterStatus === s ? 'btn-primary-custom' : 'btn-light'}`} style={{borderRadius:'var(--radius-full)',fontWeight:600,fontSize:'0.82rem',padding:'0.35rem 1rem'}}>
                        {s}
                    </button>
                ))}
            </div>

            <div className="table-card">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Payment #</th>
                                <th>Order #</th>
                                <th>Supplier</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-5 text-muted"><i className="bi bi-credit-card-2-front d-block mb-2" style={{fontSize:'2rem'}}></i>No payments found.</td></tr>
                            ) : filtered.map(p => (
                                <tr key={p.id}>
                                    <td><span className="fw-bold" style={{color:'#6366F1',fontSize:'0.9rem'}}>PAY-{String(p.id).padStart(4,'0')}</span></td>
                                    <td><span className="text-muted fw-bold">PO-{String(p.order_id).padStart(4,'0')}</span></td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{width:'30px',height:'30px',borderRadius:'8px',background:'linear-gradient(135deg,#FFFBEB,#FEF3C7)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                                <i className="bi bi-building-fill" style={{fontSize:'0.85rem',color:'#F59E0B'}}></i>
                                            </div>
                                            <span style={{fontSize:'0.88rem'}}>{p.supplier_name || '—'}</span>
                                        </div>
                                    </td>
                                    <td><span className="fw-bold" style={{color:'#0F172A'}}>${Number(p.amount).toLocaleString()}</span></td>
                                    <td>
                                        <span style={{background:'#F1F5F9',padding:'0.2rem 0.6rem',borderRadius:'6px',fontSize:'0.8rem',fontWeight:600,color:'#334155'}}>
                                            {p.payment_method || 'Bank Transfer'}
                                        </span>
                                    </td>
                                    <td><StatusBadge status={p.status} /></td>
                                    <td><small className="text-muted">{new Date(p.created_at).toLocaleDateString()}</small></td>
                                    <td>
                                        {p.status === 'Pending' && (
                                            <button className="btn btn-sm btn-primary-custom" style={{padding:'0.3rem 0.75rem',fontSize:'0.78rem'}} onClick={() => handleMarkPaid(p.id)}>
                                                <i className="bi bi-check-circle me-1"></i>Mark Paid
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Payments;
