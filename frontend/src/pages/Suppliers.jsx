import React, { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';

const EMPTY_SUPPLIER = { name: '', contact_email: '', phone: '', address: '' };

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_SUPPLIER);
    const [search, setSearch] = useState('');
    const [alert, setAlert] = useState(null);

    const fetchSuppliers = () => {
        setLoading(true);
        fetch(`${API}/suppliers`)
            .then(r => r.json())
            .then(data => { setSuppliers(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => { setSuppliers([]); setLoading(false); });
    };

    useEffect(() => { fetchSuppliers(); }, []);

    const openAdd = () => { setEditing(null); setForm(EMPTY_SUPPLIER); setShowModal(true); };
    const openEdit = (s) => { setEditing(s.id); setForm({ name: s.name, contact_email: s.contact_email, phone: s.phone || '', address: s.address || '' }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editing ? `${API}/suppliers/${editing}` : `${API}/suppliers`;
        const method = editing ? 'PUT' : 'POST';
        try {
            await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            setShowModal(false);
            fetchSuppliers();
            showAlert(editing ? 'Supplier updated!' : 'Supplier added!', 'success');
        } catch { showAlert('Action failed.', 'danger'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this supplier?')) return;
        try {
            await fetch(`${API}/suppliers/${id}`, { method: 'DELETE' });
            fetchSuppliers();
            showAlert('Supplier deleted.', 'success');
        } catch { showAlert('Delete failed.', 'danger'); }
    };

    const showAlert = (msg, type) => {
        setAlert({ msg, type });
        setTimeout(() => setAlert(null), 3000);
    };

    const filtered = suppliers.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.contact_email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 style={{fontWeight:800,fontSize:'1.6rem',letterSpacing:'-0.025em',color:'#0F172A',margin:0}}>Suppliers</h2>
                    <p style={{color:'#64748B',fontSize:'0.92rem',margin:0}}>Manage your vendor directory</p>
                </div>
                <button className="btn btn-primary-custom d-flex align-items-center gap-2" onClick={openAdd}>
                    <i className="bi bi-plus-lg"></i> Add Supplier
                </button>
            </div>

            {alert && (
                <div className={`alert alert-${alert.type} border-0 d-flex align-items-center py-2 px-3 mb-3`} style={{fontSize:'0.88rem'}}>
                    <i className={`bi bi-${alert.type === 'success' ? 'check-circle-fill text-success' : 'exclamation-triangle-fill text-danger'} me-2`}></i>
                    {alert.msg}
                </div>
            )}

            <div className="mb-3">
                <div className="input-group" style={{maxWidth:'360px'}}>
                    <span className="input-group-text" style={{background:'#F8FAFC',border:'1.5px solid #E2E8F0',borderRight:'none',borderRadius:'12px 0 0 12px',color:'#94A3B8'}}><i className="bi bi-search"></i></span>
                    <input type="text" className="form-control" placeholder="Search suppliers…" value={search} onChange={e => setSearch(e.target.value)} style={{borderLeft:'none',borderRadius:'0 12px 12px 0'}} />
                </div>
            </div>

            <div className="row g-4">
                {loading ? (
                    <div className="col-12 text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : filtered.length === 0 ? (
                    <div className="col-12 text-center py-5">
                        <i className="bi bi-building text-muted" style={{fontSize:'3rem'}}></i>
                        <p className="text-muted mt-2">No suppliers found.</p>
                    </div>
                ) : filtered.map(s => (
                    <div className="col-md-6 col-xl-4" key={s.id}>
                        <div className="card h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-start justify-content-between mb-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div style={{width:'48px',height:'48px',borderRadius:'12px',background:'linear-gradient(135deg,#EEF2FF,#E0E7FF)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                            <i className="bi bi-building-fill" style={{fontSize:'1.3rem',color:'#6366F1'}}></i>
                                        </div>
                                        <div>
                                            <h6 className="card-title mb-0">{s.name}</h6>
                                            <small style={{color:'#64748B',fontSize:'0.8rem'}}>ID: #{s.id}</small>
                                        </div>
                                    </div>
                                    <div className="dropdown">
                                        <button className="btn btn-sm btn-light border-0" data-bs-toggle="dropdown"><i className="bi bi-three-dots-vertical"></i></button>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li><button className="dropdown-item" onClick={() => openEdit(s)}><i className="bi bi-pencil me-2"></i>Edit</button></li>
                                            <li><button className="dropdown-item text-danger" onClick={() => handleDelete(s.id)}><i className="bi bi-trash me-2"></i>Delete</button></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="d-flex flex-column gap-1">
                                    <small className="text-muted d-flex align-items-center gap-2"><i className="bi bi-envelope"></i>{s.contact_email}</small>
                                    {s.phone && <small className="text-muted d-flex align-items-center gap-2"><i className="bi bi-telephone"></i>{s.phone}</small>}
                                    {s.address && <small className="text-muted d-flex align-items-center gap-2"><i className="bi bi-geo-alt"></i>{s.address}</small>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block" style={{background:'rgba(0,0,0,0.4)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header border-0">
                                    <h5 className="modal-title"><i className="bi bi-building me-2 text-primary"></i>{editing ? 'Edit Supplier' : 'Add Supplier'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3"><label className="form-label">Company Name</label><input className="form-control" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Acme Corp" /></div>
                                    <div className="mb-3"><label className="form-label">Contact Email</label><input className="form-control" type="email" required value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} placeholder="contact@company.com" /></div>
                                    <div className="mb-3"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 234 567 890" /></div>
                                    <div className="mb-3"><label className="form-label">Address</label><textarea className="form-control" value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={2} placeholder="123 Business St, City"></textarea></div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary-custom"><i className="bi bi-check-lg me-1"></i>{editing ? 'Update' : 'Add Supplier'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Suppliers;
