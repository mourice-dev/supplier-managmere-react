import React, { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';

const StatusBadge = ({ status }) => {
    const cls = { Pending: 'badge-pending', Approved: 'badge-approved', Rejected: 'badge-rejected' };
    return <span className={`badge-status ${cls[status] || 'badge-pending'}`}>{status}</span>;
};

const EMPTY = { item_name: '', quantity: 1, estimated_price: '', department: '', description: '', supplier_id: '' };

const Requests = () => {
    const user = JSON.parse(localStorage.getItem('user')) || { username: 'user', role: 'User' };
    const isAdmin = user.role === 'Admin';

    const [requests, setRequests] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [supplierId, setSupplierId] = useState('');
    const [alert, setAlert] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            fetch(`${API}/requests`).then(r => r.json()).catch(() => []),
            fetch(`${API}/suppliers`).then(r => r.json()).catch(() => []),
        ]).then(([reqs, sups]) => {
            setRequests(Array.isArray(reqs) ? reqs : []);
            setSuppliers(Array.isArray(sups) ? sups : []);
            setLoading(false);
        });
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch(`${API}/requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            setShowModal(false);
            setForm(EMPTY);
            fetchData();
            showAlertMsg('Request submitted successfully!', 'success');
        } catch { showAlertMsg('Failed to submit request.', 'danger'); }
    };

    const handleApprove = async () => {
        try {
            await fetch(`${API}/requests/${selectedReq.id}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ supplier_id: supplierId }) });
            setShowApproveModal(false);
            fetchData();
            showAlertMsg('Request approved & order created!', 'success');
        } catch { showAlertMsg('Approval failed.', 'danger'); }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject this request?')) return;
        try {
            await fetch(`${API}/requests/${id}/reject`, { method: 'POST' });
            fetchData();
            showAlertMsg('Request rejected.', 'success');
        } catch { showAlertMsg('Rejection failed.', 'danger'); }
    };

    const showAlertMsg = (msg, type) => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 3000); };

    const filtered = filterStatus === 'All' ? requests : requests.filter(r => r.status === filterStatus);

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 style={{fontWeight:800,fontSize:'1.6rem',letterSpacing:'-0.025em',color:'#0F172A',margin:0}}>Procurement Requests</h2>
                    <p style={{color:'#64748B',fontSize:'0.92rem',margin:0}}>Track and manage purchase requests</p>
                </div>
                <button className="btn btn-primary-custom d-flex align-items-center gap-2" onClick={() => { setForm(EMPTY); setShowModal(true); }}>
                    <i className="bi bi-plus-lg"></i> New Request
                </button>
            </div>

            {alert && (
                <div className={`alert alert-${alert.type} border-0 d-flex align-items-center py-2 px-3 mb-3`} style={{fontSize:'0.88rem'}}>
                    <i className={`bi bi-${alert.type === 'success' ? 'check-circle-fill text-success' : 'exclamation-triangle-fill text-danger'} me-2`}></i>
                    {alert.msg}
                </div>
            )}

            {/* Filter tabs */}
            <div className="d-flex gap-2 mb-4 flex-wrap">
                {['All', 'Pending', 'Approved', 'Rejected'].map(s => (
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
                                <th>#</th>
                                <th>Item</th>
                                <th>Department</th>
                                <th>Qty</th>
                                <th>Est. Price</th>
                                <th>Status</th>
                                <th>Date</th>
                                {isAdmin && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={isAdmin ? 8 : 7} className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={isAdmin ? 8 : 7} className="text-center py-5 text-muted"><i className="bi bi-clipboard-x d-block mb-2" style={{fontSize:'2rem'}}></i>No requests found.</td></tr>
                            ) : filtered.map(req => (
                                <tr key={req.id}>
                                    <td><small className="text-muted fw-bold">#{req.id}</small></td>
                                    <td>
                                        <div className="fw-bold" style={{fontSize:'0.9rem',color:'#0F172A'}}>{req.item_name}</div>
                                        {req.description && <small className="text-muted">{req.description.substring(0,50)}{req.description.length > 50 ? '…' : ''}</small>}
                                    </td>
                                    <td><small className="text-muted">{req.department || '—'}</small></td>
                                    <td className="fw-bold">{req.quantity}</td>
                                    <td className="fw-bold" style={{color:'#0F172A'}}>${Number(req.estimated_price).toLocaleString()}</td>
                                    <td><StatusBadge status={req.status} /></td>
                                    <td><small className="text-muted">{new Date(req.created_at).toLocaleDateString()}</small></td>
                                    {isAdmin && (
                                        <td>
                                            {req.status === 'Pending' && (
                                                <div className="d-flex gap-2">
                                                    <button className="btn btn-sm btn-success btn-primary-custom" style={{padding:'0.3rem 0.75rem',fontSize:'0.78rem'}} onClick={() => { setSelectedReq(req); setSupplierId(''); setShowApproveModal(true); }}>
                                                        <i className="bi bi-check-lg me-1"></i>Approve
                                                    </button>
                                                    <button className="btn btn-sm btn-danger" style={{padding:'0.3rem 0.75rem',fontSize:'0.78rem',borderRadius:'var(--radius-md)'}} onClick={() => handleReject(req.id)}>
                                                        <i className="bi bi-x-lg me-1"></i>Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Request Modal */}
            {showModal && (
                <div className="modal show d-block" style={{background:'rgba(0,0,0,0.4)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header border-0">
                                    <h5 className="modal-title"><i className="bi bi-clipboard-plus me-2 text-primary"></i>New Procurement Request</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-12"><label className="form-label">Item Name</label><input className="form-control" required value={form.item_name} onChange={e => setForm({...form, item_name: e.target.value})} placeholder="e.g. Office Chairs" /></div>
                                        <div className="col-6"><label className="form-label">Quantity</label><input className="form-control" type="number" min="1" required value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} /></div>
                                        <div className="col-6"><label className="form-label">Est. Price ($)</label><input className="form-control" type="number" step="0.01" required value={form.estimated_price} onChange={e => setForm({...form, estimated_price: e.target.value})} placeholder="0.00" /></div>
                                        <div className="col-12"><label className="form-label">Department</label><input className="form-control" value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="e.g. IT, Finance, HR" /></div>
                                        <div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Additional details…"></textarea></div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary-custom"><i className="bi bi-send me-1"></i>Submit Request</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Modal */}
            {showApproveModal && selectedReq && (
                <div className="modal show d-block" style={{background:'rgba(0,0,0,0.4)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header border-0">
                                <h5 className="modal-title"><i className="bi bi-check-circle me-2 text-success"></i>Approve Request</h5>
                                <button type="button" className="btn-close" onClick={() => setShowApproveModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-light border" style={{fontSize:'0.88rem'}}>
                                    <strong>{selectedReq.item_name}</strong> — Qty: {selectedReq.quantity} • ${Number(selectedReq.estimated_price).toLocaleString()}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Assign Supplier</label>
                                    <select className="form-select" required value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                                        <option value="">— Select a supplier —</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button type="button" className="btn btn-light" onClick={() => setShowApproveModal(false)}>Cancel</button>
                                <button className="btn btn-primary-custom" onClick={handleApprove} disabled={!supplierId}><i className="bi bi-check-lg me-1"></i>Approve & Create Order</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Requests;
