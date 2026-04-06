import React, { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';

const StatusBadge = ({ status }) => {
    const cls = { Pending: 'badge-pending', Completed: 'badge-completed', Approved: 'badge-approved' };
    return <span className={`badge-status ${cls[status] || 'badge-pending'}`}>{status}</span>;
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');

    const fetchOrders = () => {
        setLoading(true);
        fetch(`${API}/orders`)
            .then(r => r.json())
            .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => { setOrders([]); setLoading(false); });
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleMarkComplete = async (id) => {
        try {
            await fetch(`${API}/orders/${id}/complete`, { method: 'POST' });
            fetchOrders();
            showAlertMsg('Order marked as Completed & payment generated!', 'success');
        } catch { showAlertMsg('Action failed.', 'danger'); }
    };

    const showAlertMsg = (msg, type) => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 3500); };

    const filtered = filterStatus === 'All' ? orders : orders.filter(o => o.status === filterStatus);

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 style={{fontWeight:800,fontSize:'1.6rem',letterSpacing:'-0.025em',color:'#0F172A',margin:0}}>Purchase Orders</h2>
                    <p style={{color:'#64748B',fontSize:'0.92rem',margin:0}}>View and fulfill procurement orders</p>
                </div>
            </div>

            {alert && (
                <div className={`alert alert-${alert.type} border-0 d-flex align-items-center py-2 px-3 mb-3`} style={{fontSize:'0.88rem'}}>
                    <i className={`bi bi-${alert.type === 'success' ? 'check-circle-fill text-success' : 'exclamation-triangle-fill text-danger'} me-2`}></i>
                    {alert.msg}
                </div>
            )}

            <div className="d-flex gap-2 mb-4 flex-wrap">
                {['All', 'Pending', 'Completed'].map(s => (
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
                                <th>Order #</th>
                                <th>Item</th>
                                <th>Supplier</th>
                                <th>Qty</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-5 text-muted"><i className="bi bi-cart-x d-block mb-2" style={{fontSize:'2rem'}}></i>No orders found.</td></tr>
                            ) : filtered.map(o => (
                                <tr key={o.id}>
                                    <td><span className="fw-bold" style={{color:'#6366F1',fontSize:'0.9rem'}}>PO-{String(o.id).padStart(4,'0')}</span></td>
                                    <td><div className="fw-bold" style={{fontSize:'0.9rem',color:'#0F172A'}}>{o.item_name}</div></td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{width:'30px',height:'30px',borderRadius:'8px',background:'linear-gradient(135deg,#EEF2FF,#E0E7FF)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                                <i className="bi bi-building-fill" style={{fontSize:'0.85rem',color:'#6366F1'}}></i>
                                            </div>
                                            <span style={{fontSize:'0.88rem'}}>{o.supplier_name || '—'}</span>
                                        </div>
                                    </td>
                                    <td className="fw-bold">{o.quantity}</td>
                                    <td><span className="fw-bold" style={{color:'#0F172A'}}>${Number(o.total_amount).toLocaleString()}</span></td>
                                    <td><StatusBadge status={o.status} /></td>
                                    <td><small className="text-muted">{new Date(o.created_at).toLocaleDateString()}</small></td>
                                    <td>
                                        {o.status === 'Pending' && (
                                            <button className="btn btn-sm btn-primary-custom" style={{padding:'0.3rem 0.75rem',fontSize:'0.78rem'}} onClick={() => handleMarkComplete(o.id)}>
                                                <i className="bi bi-check-circle me-1"></i>Complete
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

export default Orders;
