
import React, { useState, useEffect, createContext, useContext } from 'react';
import ReactDOM from 'react-dom/client';

// --- Constants & RBAC Configuration ---
const ROLES = {
    ADMIN: 'Admin',
    CUSTOMER: 'Customer',
    SERVICE_PROVIDER: 'Service Provider',
};

const PERMISSIONS = {
    [ROLES.ADMIN]: {
        dashboards: ['Admin'],
        kpis: ['Total Orders', 'Revenue', 'Avg Turnaround Time', 'Delivery vs Pickup count'],
        charts: ['Revenue Trend', 'TAT Gauge', 'Delivery vs Pickup'],
        activities: ['All activities'],
        forms: ['Rate Setup', 'Partner Setup'],
        grids: ['Orders', 'Partners'],
        actions: ['Edit Order', 'Approve Partner', 'Decline Partner', 'Update Rates'],
    },
    [ROLES.CUSTOMER]: {
        dashboards: ['Customer'],
        kpis: ['Orders Placed', 'Orders Ready'],
        charts: ['Order Status'],
        activities: ['Order Placed', 'Order Ready', 'Delivery Scheduled'],
        forms: ['Registration', 'Order'],
        grids: ['Orders'],
        actions: ['Place Order', 'Track Order'],
    },
    [ROLES.SERVICE_PROVIDER]: {
        dashboards: ['Service Provider'],
        kpis: ['Orders Received', 'Orders In Progress', 'Orders Completed', 'Deliveries Scheduled'],
        charts: ['Orders by Status', 'Daily Volume Trend', 'Delivery vs Pickup'],
        activities: ['Order Accepted', 'Order Completed', 'Delivery Completed'],
        forms: ['Order Update'],
        grids: ['Orders Queue'],
        actions: ['Accept Order', 'Mark Ironing', 'Mark Ready', 'Mark Delivered', 'Mark Picked'],
    },
};

const STATUS_COLORS_MAP = {
    'Created': 'status-draft-archived',
    'Accepted': 'status-in-progress-assigned',
    'Ironing': 'status-in-progress-assigned',
    'Ready': 'status-approved-completed',
    'Delivered': 'status-approved-completed',
    'Picked': 'status-approved-completed',
    'Rejected': 'status-rejected-breach',
    'Pending Approval': 'status-pending-action', // For partners
};

const ORDER_WORKFLOW_STEPS = [
    { name: 'Created', icon: '🧺' },
    { name: 'Accepted', icon: '✔️' },
    { name: 'Ironing', icon: '👕' },
    { name: 'Ready', icon: '📦' },
    { name: 'Completed', icon: '✅' }, // Placeholder for Delivered/Picked
];

// --- Dummy Data ---
const DUMMY_DATA = {
    users: [
        { id: 'u1', name: 'Admin User', role: ROLES.ADMIN, email: 'admin@iron.com', password: 'password' },
        { id: 'u2', name: 'Customer User', role: ROLES.CUSTOMER, email: 'customer@iron.com', password: 'password' },
        { id: 'u3', name: 'Ironman Laundry', role: ROLES.SERVICE_PROVIDER, email: 'ironman@iron.com', password: 'password' },
        { id: 'u4', name: 'Sparkle Clean', role: ROLES.SERVICE_PROVIDER, email: 'sparkle@iron.com', password: 'password' },
    ],
    orders: [
        {
            id: 'ORD001', customerId: 'u2', serviceProviderId: 'u3',
            status: 'Ready', deliveryOption: 'Doorstep',
            items: [{ type: 'Shirt', qty: 5 }, { type: 'Trouser', qty: 2 }],
            totalPrice: 45.00,
            placedDate: '2023-10-26T10:00:00Z',
            expectedReadyDate: '2023-10-27T14:00:00Z',
            deliveryDate: null,
            pickupDate: null,
            activityLog: [
                { timestamp: '2023-10-26T10:00:00Z', by: 'Customer User', action: 'Order Placed', status: 'Created' },
                { timestamp: '2023-10-26T10:30:00Z', by: 'Ironman Laundry', action: 'Order Accepted', status: 'Accepted' },
                { timestamp: '2023-10-27T09:00:00Z', by: 'Ironman Laundry', action: 'Started Ironing', status: 'Ironing' },
                { timestamp: '2023-10-27T13:00:00Z', by: 'Ironman Laundry', action: 'Order Ready for Delivery/Pickup', status: 'Ready' },
            ],
        },
        {
            id: 'ORD002', customerId: 'u2', serviceProviderId: null,
            status: 'Created', deliveryOption: 'Customer Pickup',
            items: [{ type: 'Saree', qty: 1 }],
            totalPrice: 20.00,
            placedDate: '2023-10-27T11:30:00Z',
            expectedReadyDate: '2023-10-28T16:00:00Z',
            deliveryDate: null,
            pickupDate: null,
            activityLog: [
                { timestamp: '2023-10-27T11:30:00Z', by: 'Customer User', action: 'Order Placed', status: 'Created' },
            ],
        },
        {
            id: 'ORD003', customerId: 'u2', serviceProviderId: 'u4',
            status: 'Ironing', deliveryOption: 'Doorstep',
            items: [{ type: 'Bed Sheet', qty: 3 }, { type: 'Towel', qty: 6 }],
            totalPrice: 60.00,
            placedDate: '2023-10-25T09:00:00Z',
            expectedReadyDate: '2023-10-26T18:00:00Z',
            deliveryDate: null,
            pickupDate: null,
            activityLog: [
                { timestamp: '2023-10-25T09:00:00Z', by: 'Customer User', action: 'Order Placed', status: 'Created' },
                { timestamp: '2023-10-25T09:45:00Z', by: 'Sparkle Clean', action: 'Order Accepted', status: 'Accepted' },
                { timestamp: '2023-10-26T08:30:00Z', by: 'Sparkle Clean', action: 'Started Ironing', status: 'Ironing' },
            ],
        },
        {
            id: 'ORD004', customerId: 'u2', serviceProviderId: 'u3',
            status: 'Delivered', deliveryOption: 'Doorstep',
            items: [{ type: 'Jeans', qty: 4 }],
            totalPrice: 30.00,
            placedDate: '2023-10-24T14:00:00Z',
            expectedReadyDate: '2023-10-25T17:00:00Z',
            deliveryDate: '2023-10-25T17:30:00Z',
            pickupDate: null,
            activityLog: [
                { timestamp: '2023-10-24T14:00:00Z', by: 'Customer User', action: 'Order Placed', status: 'Created' },
                { timestamp: '2023-10-24T14:30:00Z', by: 'Ironman Laundry', action: 'Order Accepted', status: 'Accepted' },
                { timestamp: '2023-10-25T09:00:00Z', by: 'Ironman Laundry', action: 'Started Ironing', status: 'Ironing' },
                { timestamp: '2023-10-25T16:00:00Z', by: 'Ironman Laundry', action: 'Order Ready for Delivery', status: 'Ready' },
                { timestamp: '2023-10-25T17:30:00Z', by: 'Ironman Laundry', action: 'Order Delivered', status: 'Delivered' },
            ],
        },
        {
            id: 'ORD005', customerId: 'u2', serviceProviderId: 'u4',
            status: 'Picked', deliveryOption: 'Customer Pickup',
            items: [{ type: 'Shirt', qty: 7 }],
            totalPrice: 35.00,
            placedDate: '2023-10-23T10:00:00Z',
            expectedReadyDate: '2023-10-24T12:00:00Z',
            deliveryDate: null,
            pickupDate: '2023-10-24T12:30:00Z',
            activityLog: [
                { timestamp: '2023-10-23T10:00:00Z', by: 'Customer User', action: 'Order Placed', status: 'Created' },
                { timestamp: '2023-10-23T10:45:00Z', by: 'Sparkle Clean', action: 'Order Accepted', status: 'Accepted' },
                { timestamp: '2023-10-24T08:00:00Z', by: 'Sparkle Clean', action: 'Started Ironing', status: 'Ironing' },
                { timestamp: '2023-10-24T11:00:00Z', by: 'Sparkle Clean', action: 'Order Ready for Pickup', status: 'Ready' },
                { timestamp: '2023-10-24T12:30:00Z', by: 'Customer User', action: 'Order Picked Up', status: 'Picked' },
            ],
        },
        {
            id: 'ORD006', customerId: 'u2', serviceProviderId: 'u3',
            status: 'Rejected', deliveryOption: 'Doorstep',
            items: [{ type: 'Blouse', qty: 2 }],
            totalPrice: 15.00,
            placedDate: '2023-10-28T09:00:00Z',
            expectedReadyDate: '2023-10-29T11:00:00Z',
            deliveryDate: null,
            pickupDate: null,
            rejectionReason: 'Service unavailable in area',
            activityLog: [
                { timestamp: '2023-10-28T09:00:00Z', by: 'Customer User', action: 'Order Placed', status: 'Created' },
                { timestamp: '2023-10-28T09:15:00Z', by: 'Ironman Laundry', action: 'Order Rejected: Service unavailable', status: 'Rejected' },
            ],
        },
        {
            id: 'ORD007', customerId: 'u2', serviceProviderId: 'u4',
            status: 'Accepted', deliveryOption: 'Customer Pickup',
            items: [{ type: 'Kurta', qty: 3 }],
            totalPrice: 30.00,
            placedDate: '2023-10-28T10:00:00Z',
            expectedReadyDate: '2023-10-29T13:00:00Z',
            deliveryDate: null,
            pickupDate: null,
            activityLog: [
                { timestamp: '2023-10-28T10:00:00Z', by: 'Customer User', action: 'Order Placed', status: 'Created' },
                { timestamp: '2023-10-28T10:45:00Z', by: 'Sparkle Clean', action: 'Order Accepted', status: 'Accepted' },
            ],
        },
        {
            id: 'ORD008', customerId: 'u2', serviceProviderId: 'u3',
            status: 'Ironing', deliveryOption: 'Doorstep',
            items: [{ type: 'Blazer', qty: 1 }],
            totalPrice: 25.00,
            placedDate: '2023-10-28T11:00:00Z',
            expectedReadyDate: '2023-10-29T15:00:00Z',
            deliveryDate: null,
            pickupDate: null,
            activityLog: [
                { timestamp: '2023-10-28T11:00:00Z', by: 'Customer User', action: 'Order Placed', status: 'Created' },
                { timestamp: '2023-10-28T11:20:00Z', by: 'Ironman Laundry', action: 'Order Accepted', status: 'Accepted' },
                { timestamp: '2023-10-28T14:00:00Z', by: 'Ironman Laundry', action: 'Started Ironing', status: 'Ironing' },
            ],
        },
    ],
    partners: [
        { id: 'p1', name: 'Ironman Laundry', contactEmail: 'ironman@iron.com', status: 'Approved', joinedDate: '2022-01-15' },
        { id: 'p2', name: 'Sparkle Clean', contactEmail: 'sparkle@iron.com', status: 'Approved', joinedDate: '2022-03-20' },
        { id: 'p3', name: 'Pressed Perfect', contactEmail: 'perfect@iron.com', status: 'Pending Approval', joinedDate: '2023-09-01' },
    ],
    rates: [
        { id: 'r1', clothType: 'Shirt', price: 5.00 },
        { id: 'r2', clothType: 'Trouser', price: 7.50 },
        { id: 'r3', clothType: 'Saree', price: 20.00 },
        { id: 'r4', clothType: 'Bed Sheet', price: 10.00 },
        { id: 'r5', clothType: 'Towel', price: 3.00 },
        { id: 'r6', clothType: 'Jeans', price: 7.00 },
        { id: 'r7', clothType: 'Blouse', price: 7.50 },
        { id: 'r8', clothType: 'Kurta', price: 10.00 },
        { id: 'r9', clothType: 'Blazer', price: 25.00 },
    ],
    activities: [
        { id: 'a1', role: ROLES.ADMIN, type: 'New Order', description: 'New order ORD007 placed by Customer User.', timestamp: '2023-10-28T10:00:00Z', status: 'Created' },
        { id: 'a2', role: ROLES.ADMIN, type: 'Order Update', description: 'Order ORD008 status changed to Ironing by Ironman Laundry.', timestamp: '2023-10-28T14:00:00Z', status: 'Ironing' },
        { id: 'a3', role: ROLES.ADMIN, type: 'Partner Onboarding', description: 'New partner Pressed Perfect submitted for approval.', timestamp: '2023-10-27T16:00:00Z', status: 'Pending Approval' },

        { id: 'a4', role: ROLES.CUSTOMER, type: 'Order Placed', description: 'You placed order ORD008.', timestamp: '2023-10-28T11:00:00Z', status: 'Created' },
        { id: 'a5', role: ROLES.CUSTOMER, type: 'Order Ready', description: 'Order ORD001 is ready for delivery.', timestamp: '2023-10-27T13:00:00Z', status: 'Ready' },
        { id: 'a6', role: ROLES.CUSTOMER, type: 'Delivery Scheduled', description: 'Delivery for ORD001 scheduled for 2023-10-27.', timestamp: '2023-10-27T14:00:00Z', status: 'Ready' },

        { id: 'a7', role: ROLES.SERVICE_PROVIDER, type: 'Order Accepted', description: 'You accepted order ORD008 from Customer User.', timestamp: '2023-10-28T11:20:00Z', status: 'Accepted' },
        { id: 'a8', role: ROLES.SERVICE_PROVIDER, type: 'Order In Progress', description: 'Order ORD008 is now in ironing stage.', timestamp: '2023-10-28T14:00:00Z', status: 'Ironing' },
        { id: 'a9', role: ROLES.SERVICE_PROVIDER, type: 'Order Completed', description: 'Order ORD004 successfully delivered.', timestamp: '2023-10-25T17:30:00Z', status: 'Delivered' },
        { id: 'a10', role: ROLES.SERVICE_PROVIDER, type: 'Order Pending Action', description: 'New order ORD007 assigned to you.', timestamp: '2023-10-28T10:00:00Z', status: 'Created' },
    ]
};

// --- Contexts ---
const AuthContext = createContext(null);
const NavigationContext = createContext(null);
const ToastContext = createContext(null);

// --- Utility Functions ---
const hasAccess = (userRole, requiredPermissions) => {
    if (!userRole || !requiredPermissions) return false;
    const rolePermissions = PERMISSIONS[userRole];
    if (!rolePermissions) return false;

    if (Array.isArray(requiredPermissions)) {
        return requiredPermissions.some(perm => {
            for (const key in rolePermissions) {
                if (Array.isArray(rolePermissions[key]) && rolePermissions[key].includes(perm)) {
                    return true;
                }
            }
            return false;
        });
    } else { // Check if a specific permission category contains the item
        for (const key in rolePermissions) {
            if (Array.isArray(rolePermissions[key]) && rolePermissions[key].includes(requiredPermissions)) {
                return true;
            }
        }
    }
    return false;
};

const getStatusColorClass = (status) => STATUS_COLORS_MAP[status] || 'status-draft-archived';

const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
const formatDateTime = (dateString) => new Date(dateString).toLocaleString();

const getRoleName = (roleId) => {
    const user = DUMMY_DATA.users.find(u => u.id === roleId);
    return user ? user.name : 'N/A';
};

const getServiceProviderName = (id) => {
    const partner = DUMMY_DATA.partners.find(p => p.id === id || p.contactEmail === DUMMY_DATA.users.find(u => u.id === id)?.email);
    return partner ? partner.name : 'Unassigned';
};

// --- Reusable UI Components ---

const ToastNotification = ({ message, type, id, removeToast }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(id);
        }, 5000); // Auto-dismiss after 5 seconds
        return () => clearTimeout(timer);
    }, [id, removeToast]);

    let icon = '';
    switch (type) {
        case 'info': icon = '💡'; break;
        case 'success': icon = '✅'; break;
        case 'action': icon = '⚠️'; break;
        case 'error': icon = '❌'; break;
        default: icon = '💬';
    }

    return (
        <div className={`toast ${type}`}>
            <span className="icon">{icon}</span>
            <span>{message}</span>
        </div>
    );
};

const Navbar = ({ currentUser, onLogout, onNavigate }) => {
    const { addToast } = useContext(ToastContext);
    const handleSearch = () => {
        addToast({ message: 'Global search functionality is simulated.', type: 'info' });
    };
    const handleNotificationClick = () => {
        addToast({ message: 'In-app notification center coming soon!', type: 'info' });
    };

    return (
        <nav className="navbar">
            <a href="#" className="navbar-brand" onClick={() => onNavigate('dashboard')}>IronEase</a>
            <div className="navbar-right">
                <div className="navbar-search">
                    <input type="text" placeholder="Search..." onClick={handleSearch} />
                    <span className="icon icon-search" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}></span>
                </div>
                <button className="btn btn-ghost" onClick={handleNotificationClick} aria-label="Notifications">
                    <span className="icon icon-notification"></span>
                </button>
                <div className="navbar-user">
                    <span className="icon icon-user"></span>
                    <span>{currentUser?.name} ({currentUser?.role})</span>
                    <button className="btn btn-secondary" onClick={onLogout}>Logout</button>
                </div>
            </div>
        </nav>
    );
};

const KpiCard = ({ title, value, unit = '', trend = 'neutral', iconClass, onClick }) => {
    let trendArrow = '';
    let trendClass = '';
    if (trend === 'up') { trendArrow = '▲'; trendClass = 'positive'; }
    if (trend === 'down') { trendArrow = '▼'; trendClass = 'negative'; }
    if (trend === 'neutral') { trendArrow = '▶'; trendClass = 'neutral'; }

    return (
        <div className="kpi-card" onClick={onClick} tabIndex="0" role="button">
            <span className={`kpi-icon-background icon ${iconClass}`}></span>
            <div className="kpi-card-header">
                <h3>{title}</h3>
                <span className={`icon ${iconClass}`} style={{ color: 'var(--primary-teal)', fontSize: '1.5rem' }}></span>
            </div>
            <div className={`kpi-card-value ${trendClass}`}>
                {value}{unit} <span className="trend-arrow">{trendArrow}</span>
            </div>
            <div className="kpi-card-footer">Last updated: {new Date().toLocaleTimeString()}</div>
        </div>
    );
};

const ChartCard = ({ title, chartType, children }) => {
    return (
        <div className="chart-container">
            <h3>{title}</h3>
            {children ? children : (
                <div className="chart-placeholder">
                    {chartType} Chart Placeholder
                </div>
            )}
        </div>
    );
};

const ActivityFeed = ({ activities }) => {
    return (
        <div className="activity-feed-card">
            <h3><span className="icon icon-activity"></span> Recent Activities</h3>
            {activities.length > 0 ? (
                <div>
                    {activities.map((activity, index) => (
                        <div key={index} className="activity-item">
                            <span className="activity-icon">{activity.status === 'Created' ? '🆕' : (activity.status === 'Ready' ? '📦' : (activity.status === 'Delivered' ? '🚚' : (activity.status === 'Accepted' ? '✔️' : '🔄')))}</span>
                            <div className="activity-details">
                                <p><strong>{activity.description}</strong></p>
                                <small className="activity-time">{formatDateTime(activity.timestamp)}</small>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No recent activities.</p>
            )}
        </div>
    );
};

const OrderCard = ({ order, onCardClick }) => {
    const statusClass = getStatusColorClass(order.status);
    const serviceProvider = DUMMY_DATA.partners.find(p => p.contactEmail === DUMMY_DATA.users.find(u => u.id === order.serviceProviderId)?.email);

    return (
        <div
            className={`card card-status-${order.status.toLowerCase()} ${statusClass}`}
            onClick={() => onCardClick(order.id, 'Order')}
            tabIndex="0"
            role="button"
        >
            <div className="card-header">
                Order #{order.id}
                <span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span>
            </div>
            <div className="card-content">
                <p><strong>Customer:</strong> {DUMMY_DATA.users.find(u => u.id === order.customerId)?.name}</p>
                <p><strong>Items:</strong> {order.items.map(i => `${i.qty}x ${i.type}`).join(', ')}</p>
                <p><strong>Total:</strong> {formatCurrency(order.totalPrice)}</p>
                <p><strong>Delivery:</strong> {order.deliveryOption} {order.deliveryOption === 'Doorstep' ? <span className="icon icon-doorstep"></span> : <span className="icon icon-pickup"></span>}</p>
                {serviceProvider && <p><strong>Provider:</strong> {serviceProvider.name}</p>}
            </div>
            <div className="card-footer">
                <span>Placed: {formatDate(order.placedDate)}</span>
                <span>Expected: {formatDate(order.expectedReadyDate)}</span>
            </div>
        </div>
    );
};

const PartnerCard = ({ partner, onCardClick }) => {
    const statusClass = getStatusColorClass(partner.status);
    return (
        <div
            className={`card card-status-${partner.status.toLowerCase()} ${statusClass}`}
            onClick={() => onCardClick(partner.id, 'Partner')}
            tabIndex="0"
            role="button"
        >
            <div className="card-header">
                Partner: {partner.name}
                <span className={`status-badge status-${partner.status.toLowerCase()}`}>{partner.status}</span>
            </div>
            <div className="card-content">
                <p><strong>Email:</strong> {partner.contactEmail}</p>
                <p><strong>Joined:</strong> {formatDate(partner.joinedDate)}</p>
            </div>
            <div className="card-footer">
                <span>ID: {partner.id}</span>
            </div>
        </div>
    );
};

const FullScreenContainer = ({ title, onBack, children }) => {
    return (
        <div className="full-screen-container">
            <header className="full-screen-header">
                <button className="btn btn-ghost" onClick={onBack}>
                    <span className="icon icon-back"></span> Back
                </button>
                <h2>{title}</h2>
            </header>
            <main className="full-screen-content">
                {children}
            </main>
        </div>
    );
};

// --- Dashboards ---
const CustomerDashboard = ({ currentUser, onNavigate, onDrillDown }) => {
    const customerOrders = DUMMY_DATA.orders.filter(order => order.customerId === currentUser.id);
    const ordersPlaced = customerOrders.length;
    const ordersReady = customerOrders.filter(order => order.status === 'Ready' || order.status === 'Delivered' || order.status === 'Picked').length;

    const statusCounts = customerOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {});

    const customerActivities = DUMMY_DATA.activities.filter(a => a.role === ROLES.CUSTOMER);

    return (
        <>
            <h1 className="h2">Customer Dashboard</h1>
            <div className="dashboard-grid">
                <KpiCard
                    title="Orders Placed"
                    value={ordersPlaced}
                    iconClass="icon-orders"
                    onClick={() => onDrillDown('Orders', 'list', { status: 'All' })}
                />
                <KpiCard
                    title="Orders Ready"
                    value={ordersReady}
                    iconClass="icon-ready"
                    trend={ordersReady > ordersPlaced * 0.5 ? 'up' : 'neutral'}
                    onClick={() => onDrillDown('Orders', 'list', { status: 'Ready' })}
                />
            </div>

            <div className="chart-section">
                <ChartCard title="Order Status Distribution" chartType="Donut">
                    <div className="chart-placeholder">
                        <p>Order Status:</p>
                        {Object.entries(statusCounts).map(([status, count]) => (
                            <p key={status}>- {status}: {count}</p>
                        ))}
                    </div>
                </ChartCard>
                <ActivityFeed activities={customerActivities} />
            </div>
            <div className="content-actions" style={{marginTop: 'var(--space-xxl)'}}>
                <button className="btn btn-primary" onClick={() => onNavigate('form', { entity: 'Order' })}>
                    <span className="icon icon-add"></span> Place New Order
                </button>
            </div>
        </>
    );
};

const ServiceProviderDashboard = ({ currentUser, onNavigate, onDrillDown }) => {
    const spUser = DUMMY_DATA.users.find(u => u.id === currentUser.id);
    const spPartners = DUMMY_DATA.partners.filter(p => p.contactEmail === spUser.email);
    const spId = spPartners.length > 0 ? spPartners[0].id : null;

    const spOrders = DUMMY_DATA.orders.filter(order => order.serviceProviderId === currentUser.id);

    const ordersReceived = spOrders.filter(o => o.status !== 'Rejected').length;
    const ordersInProgress = spOrders.filter(o => o.status === 'Accepted' || o.status === 'Ironing').length;
    const ordersCompleted = spOrders.filter(o => o.status === 'Delivered' || o.status === 'Picked').length;
    const deliveriesScheduled = spOrders.filter(o => o.deliveryOption === 'Doorstep' && o.status === 'Ready').length;

    const statusCounts = spOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {});

    const deliveryPickupCounts = spOrders.reduce((acc, order) => {
        if (order.status === 'Delivered' || order.status === 'Picked') {
            acc[order.deliveryOption] = (acc[order.deliveryOption] || 0) + 1;
        }
        return acc;
    }, {});

    const serviceProviderActivities = DUMMY_DATA.activities.filter(a => a.role === ROLES.SERVICE_PROVIDER);

    return (
        <>
            <h1 className="h2">Service Provider Dashboard</h1>
            <div className="dashboard-grid">
                <KpiCard
                    title="Orders Received"
                    value={ordersReceived}
                    iconClass="icon-orders"
                    onClick={() => onDrillDown('Orders Queue', 'list', { status: 'All' })}
                />
                <KpiCard
                    title="Orders In Progress"
                    value={ordersInProgress}
                    iconClass="icon-inprogress"
                    trend={ordersInProgress > 0 ? 'up' : 'neutral'}
                    onClick={() => onDrillDown('Orders Queue', 'list', { status: 'Accepted,Ironing' })}
                />
                <KpiCard
                    title="Orders Completed"
                    value={ordersCompleted}
                    iconClass="icon-approved"
                    onClick={() => onDrillDown('Orders Queue', 'list', { status: 'Delivered,Picked' })}
                />
                <KpiCard
                    title="Deliveries Scheduled"
                    value={deliveriesScheduled}
                    iconClass="icon-delivered"
                    onClick={() => onDrillDown('Orders Queue', 'list', { status: 'Ready', deliveryOption: 'Doorstep' })}
                />
            </div>

            <div className="chart-section">
                <ChartCard title="Orders by Status" chartType="Bar">
                    <div className="chart-placeholder">
                        <p>Status Distribution:</p>
                        {Object.entries(statusCounts).map(([status, count]) => (
                            <p key={status}>- {status}: {count}</p>
                        ))}
                    </div>
                </ChartCard>
                <ChartCard title="Delivery vs Pickup" chartType="Donut">
                    <div className="chart-placeholder">
                        <p>Completion Type:</p>
                        {Object.entries(deliveryPickupCounts).map(([type, count]) => (
                            <p key={type}>- {type}: {count}</p>
                        ))}
                    </div>
                </ChartCard>
                <ActivityFeed activities={serviceProviderActivities} />
            </div>
        </>
    );
};

const AdminDashboard = ({ currentUser, onNavigate, onDrillDown }) => {
    const totalOrders = DUMMY_DATA.orders.length;
    const revenue = DUMMY_DATA.orders.filter(o => o.status === 'Delivered' || o.status === 'Picked').reduce((sum, order) => sum + order.totalPrice, 0);

    const completedOrders = DUMMY_DATA.orders.filter(o => o.status === 'Delivered' || o.status === 'Picked');
    const totalTurnaroundTime = completedOrders.reduce((sum, order) => {
        const placed = new Date(order.placedDate);
        const completed = new Date(order.deliveryDate || order.pickupDate);
        return sum + (completed - placed); // milliseconds
    }, 0);
    const avgTurnaroundTimeHours = completedOrders.length > 0 ? (totalTurnaroundTime / completedOrders.length / (1000 * 60 * 60)).toFixed(1) : 0;

    const deliveryPickupCounts = DUMMY_DATA.orders.reduce((acc, order) => {
        if (order.status === 'Delivered' || order.status === 'Picked') {
            acc[order.deliveryOption] = (acc[order.deliveryOption] || 0) + 1;
        }
        return acc;
    }, {});

    const adminActivities = DUMMY_DATA.activities.filter(a => a.role === ROLES.ADMIN);

    return (
        <>
            <h1 className="h2">Admin Dashboard</h1>
            <div className="dashboard-grid">
                <KpiCard
                    title="Total Orders"
                    value={totalOrders}
                    iconClass="icon-orders"
                    onClick={() => onDrillDown('Orders', 'list', { status: 'All' })}
                />
                <KpiCard
                    title="Total Revenue"
                    value={formatCurrency(revenue)}
                    iconClass="icon-revenue"
                    trend="up"
                    onClick={() => onDrillDown('Orders', 'list', { status: 'Delivered,Picked' })}
                />
                <KpiCard
                    title="Avg Turnaround Time"
                    value={avgTurnaroundTimeHours}
                    unit="h"
                    iconClass="icon-tat"
                    trend="down" // lower is better
                    onClick={() => onDrillDown('Orders', 'list', { status: 'Delivered,Picked' })}
                />
                <KpiCard
                    title="Delivery vs Pickup"
                    value={`${deliveryPickupCounts['Doorstep'] || 0} / ${deliveryPickupCounts['Customer Pickup'] || 0}`}
                    unit=""
                    iconClass="icon-delivered"
                    onClick={() => onDrillDown('Orders', 'list', { status: 'Delivered,Picked' })}
                />
            </div>

            <div className="chart-section">
                <ChartCard title="Revenue Trend (Last 7 Days)" chartType="Line">
                    <div className="chart-placeholder">
                        <p>Revenue: $2k, $2.1k, $2.5k, $2.3k, $2.7k, $3k, $3.2k</p>
                    </div>
                </ChartCard>
                <ChartCard title="TAT Gauge" chartType="Gauge">
                    <div className="chart-placeholder">
                        <p>Current Avg TAT: {avgTurnaroundTimeHours} hours (Target 18h)</p>
                    </div>
                </ChartCard>
                <ChartCard title="Delivery vs Pickup Count" chartType="Bar">
                    <div className="chart-placeholder">
                        <p>Doorstep: {deliveryPickupCounts['Doorstep'] || 0}</p>
                        <p>Customer Pickup: {deliveryPickupCounts['Customer Pickup'] || 0}</p>
                    </div>
                </ChartCard>
                <ActivityFeed activities={adminActivities} />
            </div>
            <div className="content-actions" style={{marginTop: 'var(--space-xxl)'}}>
                <button className="btn btn-primary" onClick={() => onNavigate('form', { entity: 'Rate' })}>
                    <span className="icon icon-add"></span> Set Rates
                </button>
                <button className="btn btn-primary" onClick={() => onNavigate('form', { entity: 'Partner' })}>
                    <span className="icon icon-add"></span> Add Partner
                </button>
            </div>
        </>
    );
};

// --- List/Grid Screens ---
const OrdersListScreen = ({ currentUser, onNavigate, filters = {} }) => {
    const { addToast } = useContext(ToastContext);

    let filteredOrders = DUMMY_DATA.orders;

    if (currentUser.role === ROLES.CUSTOMER) {
        filteredOrders = filteredOrders.filter(o => o.customerId === currentUser.id);
    } else if (currentUser.role === ROLES.SERVICE_PROVIDER) {
        filteredOrders = filteredOrders.filter(o => o.serviceProviderId === currentUser.id);
    }

    if (filters.status && filters.status !== 'All') {
        const statuses = filters.status.split(',');
        filteredOrders = filteredOrders.filter(o => statuses.includes(o.status));
    }
    if (filters.deliveryOption && filters.deliveryOption !== 'All') {
        filteredOrders = filteredOrders.filter(o => o.deliveryOption === filters.deliveryOption);
    }

    const handleFilterChange = (e) => {
        addToast({ message: `Filter by ${e.target.name} to "${e.target.value}" is simulated.`, type: 'info' });
        // In a real app, this would update local state and re-filter
    };

    const handleBulkAction = () => {
        addToast({ message: 'Bulk action functionality is simulated.', type: 'action' });
    };

    return (
        <>
            <h1 className="h2">My Orders</h1>
            <div className="controls" style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <select onChange={handleFilterChange} name="status" defaultValue={filters.status || 'All'}>
                    <option value="All">All Statuses</option>
                    <option value="Created">Created</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Ironing">Ironing</option>
                    <option value="Ready">Ready</option>
                    <option value="Delivered,Picked">Completed</option>
                    <option value="Rejected">Rejected</option>
                </select>
                <select onChange={handleFilterChange} name="deliveryOption" defaultValue={filters.deliveryOption || 'All'}>
                    <option value="All">All Delivery Types</option>
                    <option value="Doorstep">Doorstep</option>
                    <option value="Customer Pickup">Customer Pickup</option>
                </select>
                {hasAccess(currentUser.role, ['Edit Order']) && (
                     <button className="btn btn-secondary" onClick={handleBulkAction}>
                        <span className="icon icon-edit"></span> Bulk Edit
                    </button>
                )}
            </div>
            <div className="card-grid">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                        <OrderCard key={order.id} order={order} onCardClick={onNavigate} />
                    ))
                ) : (
                    <div className="card" style={{gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-xl)'}}>
                        <p>No orders found matching the criteria.</p>
                        {currentUser.role === ROLES.CUSTOMER && (
                             <button className="btn btn-primary" onClick={() => onNavigate('form', { entity: 'Order' })} style={{marginTop: 'var(--space-md)'}}>
                                <span className="icon icon-add"></span> Place New Order
                            </button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

const PartnersListScreen = ({ currentUser, onNavigate }) => {
    const { addToast } = useContext(ToastContext);

    const handleFilterChange = (e) => {
        addToast({ message: `Filter by ${e.target.name} to "${e.target.value}" is simulated.`, type: 'info' });
    };

    return (
        <>
            <h1 className="h2">Partners</h1>
            <div className="controls" style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <select onChange={handleFilterChange} name="status" defaultValue="All">
                    <option value="All">All Statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending Approval">Pending Approval</option>
                </select>
                <button className="btn btn-primary" onClick={() => onNavigate('form', { entity: 'Partner' })}>
                    <span className="icon icon-add"></span> Add New Partner
                </button>
            </div>
            <div className="card-grid">
                {DUMMY_DATA.partners.length > 0 ? (
                    DUMMY_DATA.partners.map(partner => (
                        <PartnerCard key={partner.id} partner={partner} onCardClick={onNavigate} />
                    ))
                ) : (
                    <div className="card" style={{gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-xl)'}}>
                        <p>No partners found.</p>
                    </div>
                )}
            </div>
        </>
    );
};

// --- Detail Views ---
const OrderDetailScreen = ({ orderId, currentUser, onBack, onNavigate, onUpdateOrder }) => {
    const order = DUMMY_DATA.orders.find(o => o.id === orderId);
    const { addToast } = useContext(ToastContext);

    if (!order) {
        addToast({ message: `Order ${orderId} not found.`, type: 'error' });
        onBack();
        return null;
    }

    // RBAC for record-level visibility
    if (currentUser.role === ROLES.CUSTOMER && order.customerId !== currentUser.id) {
        addToast({ message: 'You do not have permission to view this order.', type: 'error' });
        onBack();
        return null;
    }
    if (currentUser.role === ROLES.SERVICE_PROVIDER && order.serviceProviderId !== currentUser.id) {
        addToast({ message: 'You do not have permission to view this order.', type: 'error' });
        onBack();
        return null;
    }

    const currentStepIndex = ORDER_WORKFLOW_STEPS.findIndex(step => step.name === order.status);
    const progressWidth = currentStepIndex >= 0 ? (currentStepIndex / (ORDER_WORKFLOW_STEPS.length - 1)) * 100 : 0;

    const handleAction = (actionType) => {
        let newStatus = order.status;
        let actionDesc = '';

        if (actionType === 'Accept' && order.status === 'Created' && currentUser.role === ROLES.SERVICE_PROVIDER) {
            newStatus = 'Accepted';
            actionDesc = 'Order Accepted';
        } else if (actionType === 'Mark Ironing' && order.status === 'Accepted' && currentUser.role === ROLES.SERVICE_PROVIDER) {
            newStatus = 'Ironing';
            actionDesc = 'Started Ironing';
        } else if (actionType === 'Mark Ready' && order.status === 'Ironing' && currentUser.role === ROLES.SERVICE_PROVIDER) {
            newStatus = 'Ready';
            actionDesc = 'Order Ready for Delivery/Pickup';
        } else if (actionType === 'Mark Delivered' && order.status === 'Ready' && order.deliveryOption === 'Doorstep' && currentUser.role === ROLES.SERVICE_PROVIDER) {
            newStatus = 'Delivered';
            actionDesc = 'Order Delivered';
            order.deliveryDate = new Date().toISOString();
        } else if (actionType === 'Mark Picked' && order.status === 'Ready' && order.deliveryOption === 'Customer Pickup' && currentUser.role === ROLES.SERVICE_PROVIDER) {
            newStatus = 'Picked';
            actionDesc = 'Order Picked Up';
            order.pickupDate = new Date().toISOString();
        } else {
            addToast({ message: `Invalid action "${actionType}" for current status "${order.status}" or role.`, type: 'error' });
            return;
        }

        const updatedOrder = {
            ...order,
            status: newStatus,
            activityLog: [
                ...order.activityLog,
                { timestamp: new Date().toISOString(), by: currentUser.name, action: actionDesc, status: newStatus }
            ]
        };
        onUpdateOrder(updatedOrder);
        addToast({ message: `Order ${order.id} status updated to ${newStatus}.`, type: 'success' });
        onBack(); // Go back to list/dashboard after action
    };

    const spUser = DUMMY_DATA.users.find(u => u.id === order.serviceProviderId);
    const spName = spUser ? DUMMY_DATA.partners.find(p => p.contactEmail === spUser.email)?.name : 'N/A';
    const customerName = DUMMY_DATA.users.find(u => u.id === order.customerId)?.name;

    return (
        <FullScreenContainer title={`Order Details: #${order.id}`} onBack={onBack}>
            <div className="workflow-tracker">
                {ORDER_WORKFLOW_STEPS.map((step, index) => {
                    const isCompleted = currentStepIndex >= index;
                    const isActive = currentStepIndex === index;
                    const stepName = step.name === 'Completed' ? (order.deliveryDate ? 'Delivered' : (order.pickupDate ? 'Picked' : 'Ready')) : step.name;

                    return (
                        <div
                            key={step.name}
                            className={`workflow-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                        >
                            <div className="workflow-step-icon">{step.icon}</div>
                            <span className="workflow-step-label">{stepName}</span>
                        </div>
                    );
                })}
                <div className="workflow-progress-line" style={{ width: `${progressWidth}%` }}></div>
            </div>

            <div className="detail-grid">
                <div className="detail-main">
                    <div className="detail-card">
                        <h3>Order Information <span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span></h3>
                        <p><span>Order ID:</span> <span>{order.id}</span></p>
                        <p><span>Customer:</span> <span>{customerName}</span></p>
                        <p><span>Service Provider:</span> <span>{spName}</span></p>
                        <p><span>Delivery Option:</span> <span>{order.deliveryOption} {order.deliveryOption === 'Doorstep' ? <span className="icon icon-doorstep"></span> : <span className="icon icon-pickup"></span>}</span></p>
                        <p><span>Placed Date:</span> <span>{formatDateTime(order.placedDate)}</span></p>
                        <p><span>Expected Ready:</span> <span>{formatDate(order.expectedReadyDate)}</span></p>
                        {order.deliveryDate && <p><span>Delivered Date:</span> <span>{formatDateTime(order.deliveryDate)}</span></p>}
                        {order.pickupDate && <p><span>Picked Up Date:</span> <span>{formatDateTime(order.pickupDate)}</span></p>}
                        {order.rejectionReason && <p><span>Rejection Reason:</span> <span style={{color: 'var(--status-rejected-breach)', fontWeight: 'bold'}}>{order.rejectionReason}</span></p>}
                    </div>

                    <div className="detail-card" style={{marginTop: 'var(--space-xl)'}}>
                        <h3>Items & Pricing</h3>
                        {order.items.map((item, index) => (
                            <p key={index}><span>{item.qty}x {item.type}</span> <span>{formatCurrency(item.qty * (DUMMY_DATA.rates.find(r => r.clothType === item.type)?.price || 0))}</span></p>
                        ))}
                        <p style={{borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)'}}>
                            <span><strong>Total Price:</strong></span> <span><strong>{formatCurrency(order.totalPrice)}</strong></span>
                        </p>
                    </div>

                    <div className="detail-card" style={{marginTop: 'var(--space-xl)'}}>
                        <h3>Order Timeline / Audit Log</h3>
                        {order.activityLog.map((log, index) => (
                            <p key={index}>
                                <span>{log.action} by {log.by}</span>
                                <span>{formatDateTime(log.timestamp)}</span>
                            </p>
                        ))}
                    </div>
                </div>

                <div className="detail-sidebar">
                    <div className="detail-actions">
                        <h3>Actions</h3>
                        {hasAccess(currentUser.role, ['Accept Order']) && order.status === 'Created' && (
                            <button className="btn btn-action" onClick={() => handleAction('Accept')}>
                                <span className="icon icon-approved"></span> Accept Order
                            </button>
                        )}
                        {hasAccess(currentUser.role, ['Mark Ironing']) && order.status === 'Accepted' && (
                            <button className="btn btn-action" onClick={() => handleAction('Mark Ironing')}>
                                <span className="icon icon-inprogress"></span> Mark As Ironing
                            </button>
                        )}
                        {hasAccess(currentUser.role, ['Mark Ready']) && order.status === 'Ironing' && (
                            <button className="btn btn-action" onClick={() => handleAction('Mark Ready')}>
                                <span className="icon icon-ready"></span> Mark As Ready
                            </button>
                        )}
                        {hasAccess(currentUser.role, ['Mark Delivered']) && order.status === 'Ready' && order.deliveryOption === 'Doorstep' && (
                            <button className="btn btn-success" onClick={() => handleAction('Mark Delivered')}>
                                <span className="icon icon-delivered"></span> Mark As Delivered
                            </button>
                        )}
                        {hasAccess(currentUser.role, ['Mark Picked']) && order.status === 'Ready' && order.deliveryOption === 'Customer Pickup' && (
                            <button className="btn btn-success" onClick={() => handleAction('Mark Picked')}>
                                <span className="icon icon-pickup"></span> Mark As Picked Up
                            </button>
                        )}
                        {hasAccess(currentUser.role, ['Edit Order']) && (
                            <button className="btn btn-secondary" onClick={() => addToast({ message: 'Edit order form is simulated.', type: 'info' })}>
                                <span className="icon icon-edit"></span> Edit Order Details
                            </button>
                        )}
                        {/* More actions like Cancel/Reject (for SP or Admin) can be added */}
                    </div>
                </div>
            </div>
        </FullScreenContainer>
    );
};

const PartnerDetailScreen = ({ partnerId, currentUser, onBack, onUpdatePartner }) => {
    const partner = DUMMY_DATA.partners.find(p => p.id === partnerId);
    const { addToast } = useContext(ToastContext);

    if (!partner) {
        addToast({ message: `Partner ${partnerId} not found.`, type: 'error' });
        onBack();
        return null;
    }

    if (!hasAccess(currentUser.role, 'Partners')) { // Only admins can view partner details for now
        addToast({ message: 'You do not have permission to view partner details.', type: 'error' });
        onBack();
        return null;
    }

    const handleAction = (actionType) => {
        let newStatus = partner.status;
        let actionDesc = '';

        if (actionType === 'Approve' && partner.status === 'Pending Approval' && currentUser.role === ROLES.ADMIN) {
            newStatus = 'Approved';
            actionDesc = 'Partner Approved';
        } else if (actionType === 'Decline' && partner.status === 'Pending Approval' && currentUser.role === ROLES.ADMIN) {
            newStatus = 'Declined'; // Add 'Declined' as a status
            actionDesc = 'Partner Declined';
        } else {
            addToast({ message: `Invalid action "${actionType}" for current status "${partner.status}" or role.`, type: 'error' });
            return;
        }

        const updatedPartner = { ...partner, status: newStatus };
        onUpdatePartner(updatedPartner);
        addToast({ message: `Partner ${partner.name} status updated to ${newStatus}.`, type: 'success' });
        onBack();
    };

    return (
        <FullScreenContainer title={`Partner Details: ${partner.name}`} onBack={onBack}>
            <div className="detail-grid">
                <div className="detail-main">
                    <div className="detail-card">
                        <h3>Partner Information <span className={`status-badge status-${partner.status.toLowerCase().replace(' ', '-')}`}>{partner.status}</span></h3>
                        <p><span>Partner ID:</span> <span>{partner.id}</span></p>
                        <p><span>Name:</span> <span>{partner.name}</span></p>
                        <p><span>Contact Email:</span> <span>{partner.contactEmail}</span></p>
                        <p><span>Joined Date:</span> <span>{formatDate(partner.joinedDate)}</span></p>
                    </div>
                </div>
                <div className="detail-sidebar">
                    <div className="detail-actions">
                        <h3>Actions</h3>
                        {hasAccess(currentUser.role, ['Approve Partner']) && partner.status === 'Pending Approval' && (
                            <button className="btn btn-success" onClick={() => handleAction('Approve')}>
                                <span className="icon icon-approved"></span> Approve Partner
                            </button>
                        )}
                        {hasAccess(currentUser.role, ['Decline Partner']) && partner.status === 'Pending Approval' && (
                            <button className="btn btn-danger" onClick={() => handleAction('Decline')}>
                                <span className="icon icon-rejected"></span> Decline Partner
                            </button>
                        )}
                        {hasAccess(currentUser.role, ['Update Rates']) && partner.status === 'Approved' && (
                            <button className="btn btn-secondary" onClick={() => addToast({ message: 'Edit partner details form is simulated.', type: 'info' })}>
                                <span className="icon icon-edit"></span> Edit Partner
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </FullScreenContainer>
    );
};

// --- Forms ---
const OrderForm = ({ currentUser, onBack, onSubmit }) => {
    const { addToast } = useContext(ToastContext);
    const [formData, setFormData] = useState({
        customerId: currentUser.id,
        serviceProviderId: '',
        deliveryOption: 'Doorstep',
        items: [{ type: '', qty: 1 }],
        placedDate: new Date().toISOString().substring(0, 10),
        expectedReadyDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // 2 days from now
        status: 'Created',
        totalPrice: 0,
    });
    const [errors, setErrors] = useState({});
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        // Calculate total price whenever items change
        let calculatedPrice = 0;
        formData.items.forEach(item => {
            const rate = DUMMY_DATA.rates.find(r => r.clothType === item.type);
            if (rate && item.qty > 0) {
                calculatedPrice += rate.price * item.qty;
            }
        });
        setFormData(prev => ({ ...prev, totalPrice: calculatedPrice }));
    }, [formData.items]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = formData.items.map((item, i) =>
            i === index ? { ...item, [name]: name === 'qty' ? parseInt(value) : value } : item
        );
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { type: '', qty: 1 }]
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const validateStep = () => {
        let newErrors = {};
        if (currentStep === 1) { // Items and Delivery
            if (formData.items.length === 0) {
                newErrors.items = 'At least one item is required.';
            }
            formData.items.forEach((item, index) => {
                if (!item.type) newErrors[`itemType${index}`] = 'Cloth type is required.';
                if (item.qty <= 0) newErrors[`itemQty${index}`] = 'Quantity must be positive.';
            });
            if (!formData.deliveryOption) newErrors.deliveryOption = 'Delivery option is required.';
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                addToast({message: 'Please fill all required fields.', type: 'error'});
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateStep()) { // Final validation on last step
            return;
        }

        // Simulate auto-assigning SP if not selected
        let assignedSP = formData.serviceProviderId;
        if (!assignedSP) {
            const availableSPs = DUMMY_DATA.users.filter(u => u.role === ROLES.SERVICE_PROVIDER);
            if (availableSPs.length > 0) {
                assignedSP = availableSPs[Math.floor(Math.random() * availableSPs.length)].id;
                addToast({ message: `No Service Provider selected, auto-assigned to ${getServiceProviderName(assignedSP)}.`, type: 'info' });
            } else {
                addToast({ message: 'No Service Providers available to assign.', type: 'error' });
                setErrors(prev => ({ ...prev, serviceProviderId: 'No service provider could be assigned.' }));
                return;
            }
        }

        const newOrder = {
            id: `ORD${String(DUMMY_DATA.orders.length + 1).padStart(3, '0')}`,
            ...formData,
            serviceProviderId: assignedSP,
            placedDate: new Date().toISOString(),
            expectedReadyDate: new Date(formData.expectedReadyDate).toISOString(),
            activityLog: [{ timestamp: new Date().toISOString(), by: currentUser.name, action: 'Order Placed', status: 'Created' }],
        };
        onSubmit(newOrder, 'Order');
        addToast({ message: `Order ${newOrder.id} placed successfully!`, type: 'success' });
        onBack(); // Navigate back to dashboard or list
    };

    const clothTypes = DUMMY_DATA.rates.map(r => r.clothType);
    const serviceProviders = DUMMY_DATA.users.filter(u => u.role === ROLES.SERVICE_PROVIDER);

    return (
        <FullScreenContainer title="Place New Order" onBack={onBack}>
            <div className="form-container">
                <div className="form-step-indicator">
                    <span className={currentStep === 1 ? 'active' : ''}></span>
                    <span className={currentStep === 2 ? 'active' : ''}></span>
                </div>
                <form onSubmit={handleSubmit}>
                    {currentStep === 1 && (
                        <>
                            <h3>Step 1: Order Details</h3>
                            <div className="form-group">
                                <label>Items for Ironing:</label>
                                {formData.items.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                                        <select
                                            name="type"
                                            value={item.type}
                                            onChange={(e) => handleItemChange(index, e)}
                                            required
                                            style={{ flex: 2 }}
                                        >
                                            <option value="">Select Cloth Type</option>
                                            {clothTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            name="qty"
                                            value={item.qty}
                                            onChange={(e) => handleItemChange(index, e)}
                                            min="1"
                                            required
                                            style={{ flex: 1 }}
                                        />
                                        {formData.items.length > 1 && (
                                            <button type="button" className="btn btn-danger" onClick={() => removeItem(index)} style={{ flex: 'none', width: 'auto' }}>
                                                <span className="icon icon-delete"></span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {errors.items && <p className="error-message">{errors.items}</p>}
                                <button type="button" className="btn btn-ghost" onClick={addItem} style={{marginTop: 'var(--space-sm)'}}>
                                    <span className="icon icon-add"></span> Add More Items
                                </button>
                            </div>

                            <div className="form-group">
                                <label htmlFor="deliveryOption">Delivery Option:</label>
                                <select
                                    id="deliveryOption"
                                    name="deliveryOption"
                                    value={formData.deliveryOption}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Doorstep">Doorstep Delivery</option>
                                    <option value="Customer Pickup">Customer Pickup</option>
                                </select>
                                {errors.deliveryOption && <p className="error-message">{errors.deliveryOption}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="expectedReadyDate">Expected Ready Date:</label>
                                <input
                                    type="date"
                                    id="expectedReadyDate"
                                    name="expectedReadyDate"
                                    value={formData.expectedReadyDate}
                                    onChange={handleChange}
                                    min={new Date().toISOString().substring(0, 10)}
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={onBack}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={handleNext}>Next</button>
                            </div>
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            <h3>Step 2: Review & Submit</h3>
                            <div className="detail-card">
                                <h3>Order Summary</h3>
                                <p><span>Customer:</span> <span>{currentUser.name}</span></p>
                                <p><span>Delivery Option:</span> <span>{formData.deliveryOption}</span></p>
                                <p><span>Expected Ready:</span> <span>{formatDate(formData.expectedReadyDate)}</span></p>
                                <p><span>Items:</span></p>
                                <ul>
                                    {formData.items.map((item, index) => (
                                        <li key={index}>{item.qty}x {item.type} ({formatCurrency(item.qty * (DUMMY_DATA.rates.find(r => r.clothType === item.type)?.price || 0))})</li>
                                    ))}
                                </ul>
                                <p style={{borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)'}}>
                                    <span><strong>Estimated Total:</strong></span> <span><strong>{formatCurrency(formData.totalPrice)}</strong></span>
                                </p>
                            </div>
                            <div className="form-group" style={{marginTop: 'var(--space-md)'}}>
                                <label htmlFor="serviceProviderId">Assign Service Provider (Optional):</label>
                                <select
                                    id="serviceProviderId"
                                    name="serviceProviderId"
                                    value={formData.serviceProviderId}
                                    onChange={handleChange}
                                >
                                    <option value="">Auto Assign</option>
                                    {serviceProviders.map(sp => (
                                        <option key={sp.id} value={sp.id}>{DUMMY_DATA.partners.find(p => p.contactEmail === sp.email)?.name || sp.name}</option>
                                    ))}
                                </select>
                                {errors.serviceProviderId && <p className="error-message">{errors.serviceProviderId}</p>}
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(prev => prev - 1)}>Back</button>
                                <button type="submit" className="btn btn-primary"><span className="icon icon-submit"></span> Place Order</button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </FullScreenContainer>
    );
};

const RateSetupForm = ({ currentUser, onBack, onSubmit }) => {
    const { addToast } = useContext(ToastContext);
    const [formData, setFormData] = useState({
        clothType: '',
        price: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let newErrors = {};
        if (!formData.clothType) newErrors.clothType = 'Cloth type is required.';
        if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Price must be a positive number.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            addToast({message: 'Please fill all required fields correctly.', type: 'error'});
            return;
        }

        const newRate = {
            id: `r${String(DUMMY_DATA.rates.length + 1)}`,
            clothType: formData.clothType,
            price: parseFloat(formData.price),
        };
        onSubmit(newRate, 'Rate');
        addToast({ message: `Rate for ${newRate.clothType} set successfully!`, type: 'success' });
        onBack();
    };

    if (currentUser.role !== ROLES.ADMIN) {
        addToast({ message: 'You do not have permission to set rates.', type: 'error' });
        onBack();
        return null;
    }

    return (
        <FullScreenContainer title="Set Pricing Rates" onBack={onBack}>
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="clothType">Cloth Type:</label>
                        <input
                            type="text"
                            id="clothType"
                            name="clothType"
                            value={formData.clothType}
                            onChange={handleChange}
                            placeholder="e.g., Shirt, Trouser, Saree"
                            required
                        />
                        {errors.clothType && <p className="error-message">{errors.clothType}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="price">Price Per Item ($):</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0.01"
                            step="0.01"
                            placeholder="e.g., 5.00"
                            required
                        />
                        {errors.price && <p className="error-message">{errors.price}</p>}
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onBack}>Cancel</button>
                        <button type="submit" className="btn btn-primary"><span className="icon icon-save"></span> Save Rate</button>
                    </div>
                </form>
            </div>
        </FullScreenContainer>
    );
};

const PartnerSetupForm = ({ currentUser, onBack, onSubmit }) => {
    const { addToast } = useContext(ToastContext);
    const [formData, setFormData] = useState({
        name: '',
        contactEmail: '',
        status: 'Pending Approval',
        joinedDate: new Date().toISOString().substring(0, 10),
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let newErrors = {};
        if (!formData.name) newErrors.name = 'Partner name is required.';
        if (!formData.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) newErrors.contactEmail = 'A valid email is required.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            addToast({message: 'Please fill all required fields correctly.', type: 'error'});
            return;
        }

        const newPartner = {
            id: `p${String(DUMMY_DATA.partners.length + 1)}`,
            ...formData,
        };
        onSubmit(newPartner, 'Partner');
        addToast({ message: `Partner ${newPartner.name} added successfully!`, type: 'success' });
        onBack();
    };

    if (currentUser.role !== ROLES.ADMIN) {
        addToast({ message: 'You do not have permission to add partners.', type: 'error' });
        onBack();
        return null;
    }

    return (
        <FullScreenContainer title="Add New Partner" onBack={onBack}>
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Partner Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Sparkle Clean Laundry"
                            required
                        />
                        {errors.name && <p className="error-message">{errors.name}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="contactEmail">Contact Email:</label>
                        <input
                            type="email"
                            id="contactEmail"
                            name="contactEmail"
                            value={formData.contactEmail}
                            onChange={handleChange}
                            placeholder="e.g., contact@sparkleclean.com"
                            required
                        />
                        {errors.contactEmail && <p className="error-message">{errors.contactEmail}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Status:</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            disabled /* For new partners, status is always pending approval initially */
                        >
                            <option value="Pending Approval">Pending Approval</option>
                            <option value="Approved">Approved</option>
                        </select>
                        <small style={{display: 'block', marginTop: 'var(--space-xs)', color: 'var(--status-draft-archived)'}}>New partners are always 'Pending Approval' by default.</small>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onBack}>Cancel</button>
                        <button type="submit" className="btn btn-primary"><span className="icon icon-add"></span> Add Partner</button>
                    </div>
                </form>
            </div>
        </FullScreenContainer>
    );
};


// --- Login Component ---
const LoginScreen = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        const user = DUMMY_DATA.users.find(u => u.email === email && u.password === password);
        if (user) {
            onLogin(user);
        } else {
            setError('Invalid email or password.');
        }
    };

    return (
        <div className="full-screen-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className="form-container" style={{ maxWidth: '400px', padding: 'var(--space-xl)' }}>
                <h2>Welcome to IronEase</h2>
                <p style={{marginBottom: 'var(--space-lg)'}}>Login to access your enterprise application.</p>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-message" style={{textAlign: 'center'}}>{error}</p>}
                    <div className="form-actions" style={{justifyContent: 'center'}}>
                        <button type="submit" className="btn btn-primary">Login</button>
                    </div>
                    <div style={{marginTop: 'var(--space-md)', textAlign: 'center', fontSize: 'var(--font-size-sm)'}}>
                        <p><strong>Admin:</strong> admin@iron.com / password</p>
                        <p><strong>Customer:</strong> customer@iron.com / password</p>
                        <p><strong>Service Provider:</strong> ironman@iron.com / password</p>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main App Component ---
function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentView, setCurrentView] = useState({ type: 'dashboard', id: null, entity: null, filters: {} });
    const [notifications, setNotifications] = useState([]);

    const addToast = (newToast) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, ...newToast }]);
    };

    const removeToast = (id) => {
        setNotifications((prev) => prev.filter((toast) => toast.id !== id));
    };

    const handleLogin = (user) => {
        setCurrentUser(user);
        setCurrentView({ type: 'dashboard', id: null, entity: null, filters: {} });
        addToast({ message: `Welcome, ${user.name}!`, type: 'success' });
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentView({ type: 'dashboard', id: null, entity: null, filters: {} });
        addToast({ message: 'You have been logged out.', type: 'info' });
    };

    const handleNavigate = (viewType, { id = null, entity = null, filters = {} } = {}) => {
        setCurrentView({ type: viewType, id, entity, filters });
    };

    const handleUpdateOrder = (updatedOrder) => {
        DUMMY_DATA.orders = DUMMY_DATA.orders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
        // Refresh view or navigate back if in detail
        setCurrentView({ type: 'list', entity: 'Orders', filters: {} }); // Return to list after update
    };

    const handleUpdatePartner = (updatedPartner) => {
        DUMMY_DATA.partners = DUMMY_DATA.partners.map(p => p.id === updatedPartner.id ? updatedPartner : p);
        setCurrentView({ type: 'list', entity: 'Partners', filters: {} });
    };

    const handleCreateRecord = (newRecord, entityType) => {
        if (entityType === 'Order') {
            DUMMY_DATA.orders.unshift(newRecord); // Add to beginning for freshness
            addToast({ message: `New order ${newRecord.id} created!`, type: 'success' });
        } else if (entityType === 'Rate') {
            DUMMY_DATA.rates.unshift(newRecord);
            addToast({ message: `New rate for ${newRecord.clothType} created!`, type: 'success' });
        } else if (entityType === 'Partner') {
            DUMMY_DATA.partners.unshift(newRecord);
            // Also create a dummy user for the new partner
            DUMMY_DATA.users.push({
                id: `u${String(DUMMY_DATA.users.length + 1)}`,
                name: newRecord.name,
                role: ROLES.SERVICE_PROVIDER,
                email: newRecord.contactEmail,
                password: 'password' // Default password for new partner login
            });
            addToast({ message: `New partner ${newRecord.name} added!`, type: 'success' });
        }
    };

    if (!currentUser) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    const renderMainContent = () => {
        if (currentView.type === 'dashboard') {
            if (currentUser.role === ROLES.ADMIN && hasAccess(currentUser.role, 'Admin')) {
                return <AdminDashboard currentUser={currentUser} onNavigate={handleNavigate} onDrillDown={handleNavigate} />;
            }
            if (currentUser.role === ROLES.CUSTOMER && hasAccess(currentUser.role, 'Customer')) {
                return <CustomerDashboard currentUser={currentUser} onNavigate={handleNavigate} onDrillDown={handleNavigate} />;
            }
            if (currentUser.role === ROLES.SERVICE_PROVIDER && hasAccess(currentUser.role, 'Service Provider')) {
                return <ServiceProviderDashboard currentUser={currentUser} onNavigate={handleNavigate} onDrillDown={handleNavigate} />;
            }
            return <p>Dashboard not available for your role.</p>;
        }

        if (currentView.type === 'list') {
            if (currentView.entity === 'Orders' && hasAccess(currentUser.role, 'Orders')) {
                return <OrdersListScreen currentUser={currentUser} onNavigate={handleNavigate} filters={currentView.filters} />;
            }
            if (currentView.entity === 'Orders Queue' && hasAccess(currentUser.role, 'Orders Queue')) {
                return <OrdersListScreen currentUser={currentUser} onNavigate={handleNavigate} filters={currentView.filters} />;
            }
            if (currentView.entity === 'Partners' && hasAccess(currentUser.role, 'Partners')) {
                return <PartnersListScreen currentUser={currentUser} onNavigate={handleNavigate} />;
            }
            return <p>List view not available or no permission.</p>;
        }

        if (currentView.type === 'detail') {
            if (currentView.entity === 'Order' && currentView.id) {
                return <OrderDetailScreen orderId={currentView.id} currentUser={currentUser} onBack={() => handleNavigate('list', { entity: 'Orders', filters: currentView.filters })} onNavigate={handleNavigate} onUpdateOrder={handleUpdateOrder} />;
            }
            if (currentView.entity === 'Partner' && currentView.id) {
                return <PartnerDetailScreen partnerId={currentView.id} currentUser={currentUser} onBack={() => handleNavigate('list', { entity: 'Partners' })} onUpdatePartner={handleUpdatePartner} />;
            }
            return <p>Detail view not available or no permission.</p>;
        }

        if (currentView.type === 'form') {
            if (currentView.entity === 'Order' && hasAccess(currentUser.role, 'Order')) {
                return <OrderForm currentUser={currentUser} onBack={() => handleNavigate('dashboard')} onSubmit={handleCreateRecord} />;
            }
            if (currentView.entity === 'Rate' && hasAccess(currentUser.role, 'Rate Setup')) {
                return <RateSetupForm currentUser={currentUser} onBack={() => handleNavigate('dashboard')} onSubmit={handleCreateRecord} />;
            }
            if (currentView.entity === 'Partner' && hasAccess(currentUser.role, 'Partner Setup')) {
                return <PartnerSetupForm currentUser={currentUser} onBack={() => handleNavigate('dashboard')} onSubmit={handleCreateRecord} />;
            }
            return <p>Form not available or no permission.</p>;
        }

        return <p>Select a view from the navigation.</p>;
    };

    return (
        <AuthContext.Provider value={{ currentUser, hasAccess }}>
            <NavigationContext.Provider value={{ navigate: handleNavigate }}>
                <ToastContext.Provider value={{ addToast }}>
                    <div className="app-container">
                        <Navbar currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />
                        <main className="content-area">
                            {renderMainContent()}
                        </main>
                        <div className="toast-container">
                            {notifications.map((toast) => (
                                <ToastNotification
                                    key={toast.id}
                                    id={toast.id}
                                    message={toast.message}
                                    type={toast.type}
                                    removeToast={removeToast}
                                />
                            ))}
                        </div>
                    </div>
                </ToastContext.Provider>
            </NavigationContext.Provider>
        </AuthContext.Provider>
    );
}

// Ensure the root is created and rendered correctly
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
export default App;
