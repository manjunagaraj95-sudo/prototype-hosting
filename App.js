
const { useState, useEffect, createElement } = React;
const { createRoot } = ReactDOM;

// --- DUMMY DATA ---
const generateUUID = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const getStatusColorClass = (status) => {
    switch (status) {
        case 'Created': return 'status-orange';
        case 'Accepted': return 'status-blue';
        case 'Ironing': return 'status-blue';
        case 'Ready': return 'status-green';
        case 'Delivered': return 'status-green';
        case 'Picked': return 'status-green';
        case 'Rejected': return 'status-red';
        case 'Draft': return 'status-grey';
        default: return '';
    }
};

const DUMMY_USERS = [
    { id: 'u1', name: 'Alice Admin', role: 'Admin' },
    { id: 'u2', name: 'Bob Customer', role: 'Customer' },
    { id: 'u3', name: 'Charlie Provider', role: 'Service Provider' },
];

let DUMMY_PARTNERS = [
    { id: 'p1', name: 'CleanPress Laundry', contact: '987-654-3210', address: '123 Main St, City', status: 'Active', createdAt: '2023-01-01T10:00:00Z' },
    { id: 'p2', name: 'Sparkle Ironing Co.', contact: '555-123-4567', address: '456 Oak Ave, Town', status: 'Active', createdAt: '2023-02-15T11:30:00Z' },
    { id: 'p3', name: 'Rapid Iron Express', contact: '111-222-3333', address: '789 Pine Ln, Village', status: 'Inactive', createdAt: '2023-03-20T14:00:00Z' },
];

let DUMMY_RATES = [
    { id: 'r1', clothType: 'Shirt', pricePerItem: 2.50, createdAt: '2023-01-01T09:00:00Z' },
    { id: 'r2', clothType: 'Pant', pricePerItem: 3.00, createdAt: '2023-01-01T09:00:00Z' },
    { id: 'r3', clothType: 'Dress', pricePerItem: 5.00, createdAt: '2023-01-01T09:00:00Z' },
    { id: 'r4', clothType: 'Bed Linen', pricePerItem: 7.50, createdAt: '2023-01-01T09:00:00Z' },
];

let DUMMY_ORDERS = [
    {
        id: 'O001', customerId: 'u2', customerName: 'Bob Customer', serviceProviderId: 'p1', serviceProviderName: 'CleanPress Laundry',
        clothItems: [{ type: 'Shirt', quantity: 5, pricePerItem: 2.50 }, { type: 'Pant', quantity: 2, pricePerItem: 3.00 }],
        totalPrice: 18.50, status: 'Created', deliveryOption: 'Doorstep', deliveryAddress: '101 Elm St',
        createdAt: '2023-10-26T10:00:00Z', updatedAt: '2023-10-26T10:00:00Z',
        timeline: [{ status: 'Created', date: '2023-10-26T10:00:00Z', by: 'Bob Customer' }]
    },
    {
        id: 'O002', customerId: 'u2', customerName: 'Bob Customer', serviceProviderId: 'p1', serviceProviderName: 'CleanPress Laundry',
        clothItems: [{ type: 'Dress', quantity: 1, pricePerItem: 5.00 }, { type: 'Shirt', quantity: 3, pricePerItem: 2.50 }],
        totalPrice: 12.50, status: 'Accepted', deliveryOption: 'Customer Pickup', pickupTime: '2023-10-28T14:00:00Z',
        createdAt: '2023-10-25T11:30:00Z', updatedAt: '2023-10-25T12:00:00Z',
        timeline: [{ status: 'Created', date: '2023-10-25T11:30:00Z', by: 'Bob Customer' }, { status: 'Accepted', date: '2023-10-25T12:00:00Z', by: 'CleanPress Laundry' }]
    },
    {
        id: 'O003', customerId: 'u2', customerName: 'Bob Customer', serviceProviderId: 'p2', serviceProviderName: 'Sparkle Ironing Co.',
        clothItems: [{ type: 'Pant', quantity: 4, pricePerItem: 3.00 }],
        totalPrice: 12.00, status: 'Ironing', deliveryOption: 'Doorstep', deliveryAddress: '101 Elm St',
        createdAt: '2023-10-24T09:00:00Z', updatedAt: '2023-10-24T15:00:00Z',
        timeline: [{ status: 'Created', date: '2023-10-24T09:00:00Z', by: 'Bob Customer' }, { status: 'Accepted', date: '2023-10-24T10:00:00Z', by: 'Sparkle Ironing Co.' }, { status: 'Ironing', date: '2023-10-24T15:00:00Z', by: 'Sparkle Ironing Co.' }]
    },
    {
        id: 'O004', customerId: 'u2', customerName: 'Bob Customer', serviceProviderId: 'p2', serviceProviderName: 'Sparkle Ironing Co.',
        clothItems: [{ type: 'Shirt', quantity: 10, pricePerItem: 2.50 }],
        totalPrice: 25.00, status: 'Ready', deliveryOption: 'Customer Pickup', pickupTime: '2023-10-27T10:00:00Z',
        createdAt: '2023-10-23T14:00:00Z', updatedAt: '2023-10-23T18:00:00Z',
        timeline: [{ status: 'Created', date: '2023-10-23T14:00:00Z', by: 'Bob Customer' }, { status: 'Accepted', date: '2023-10-23T14:30:00Z', by: 'Sparkle Ironing Co.' }, { status: 'Ironing', date: '2023-10-23T16:00:00Z', by: 'Sparkle Ironing Co.' }, { status: 'Ready', date: '2023-10-23T18:00:00Z', by: 'Sparkle Ironing Co.' }]
    },
    {
        id: 'O005', customerId: 'u2', customerName: 'Bob Customer', serviceProviderId: 'p1', serviceProviderName: 'CleanPress Laundry',
        clothItems: [{ type: 'Bed Linen', quantity: 1, pricePerItem: 7.50 }],
        totalPrice: 7.50, status: 'Delivered', deliveryOption: 'Doorstep', deliveryAddress: '101 Elm St',
        createdAt: '2023-10-22T08:00:00Z', updatedAt: '2023-10-22T17:00:00Z',
        timeline: [{ status: 'Created', date: '2023-10-22T08:00:00Z', by: 'Bob Customer' }, { status: 'Accepted', date: '2023-10-22T08:30:00Z', by: 'CleanPress Laundry' }, { status: 'Ironing', date: '2023-10-22T10:00:00Z', by: 'CleanPress Laundry' }, { status: 'Ready', date: '2023-10-22T14:00:00Z', by: 'CleanPress Laundry' }, { status: 'Delivered', date: '2023-10-22T17:00:00Z', by: 'CleanPress Laundry' }]
    },
    {
        id: 'O006', customerId: 'u2', customerName: 'Bob Customer', serviceProviderId: 'p1', serviceProviderName: 'CleanPress Laundry',
        clothItems: [{ type: 'Shirt', quantity: 2, pricePerItem: 2.50 }],
        totalPrice: 5.00, status: 'Picked', deliveryOption: 'Customer Pickup', pickupTime: '2023-10-21T16:00:00Z',
        createdAt: '2023-10-21T09:00:00Z', updatedAt: '2023-10-21T16:00:00Z',
        timeline: [{ status: 'Created', date: '2023-10-21T09:00:00Z', by: 'Bob Customer' }, { status: 'Accepted', date: '2023-10-21T09:30:00Z', by: 'CleanPress Laundry' }, { status: 'Ironing', date: '2023-10-21T11:00:00Z', by: 'CleanPress Laundry' }, { status: 'Ready', date: '2023-10-21T13:00:00Z', by: 'CleanPress Laundry' }, { status: 'Picked', date: '2023-10-21T16:00:00Z', by: 'Bob Customer' }]
    },
    {
        id: 'O007', customerId: 'u2', customerName: 'Bob Customer', serviceProviderId: 'p2', serviceProviderName: 'Sparkle Ironing Co.',
        clothItems: [{ type: 'Pant', quantity: 3, pricePerItem: 3.00 }],
        totalPrice: 9.00, status: 'Created', deliveryOption: 'Doorstep', deliveryAddress: '101 Elm St',
        createdAt: '2023-10-27T08:00:00Z', updatedAt: '2023-10-27T08:00:00Z',
        timeline: [{ status: 'Created', date: '2023-10-27T08:00:00Z', by: 'Bob Customer' }]
    },
    {
        id: 'O008', customerId: 'u2', customerName: 'Bob Customer', serviceProviderId: 'p2', serviceProviderName: 'Sparkle Ironing Co.',
        clothItems: [{ type: 'Shirt', quantity: 7, pricePerItem: 2.50 }],
        totalPrice: 17.50, status: 'Created', deliveryOption: 'Customer Pickup', pickupTime: '2023-10-29T11:00:00Z',
        createdAt: '2023-10-27T09:00:00Z', updatedAt: '2023-10-27T09:00:00Z',
        timeline: [{ status: 'Created', date: '2023-10-27T09:00:00Z', by: 'Bob Customer' }]
    },
];

// --- RBAC & Auth Context ---
const AuthContext = React.createContext(null);

// --- Reusable Components ---
const Button = ({ onClick, children, className = 'btn-primary', disabled = false, iconClass, type = 'button' }) => (
    createElement('button', { className: `btn ${className}`, onClick, disabled, type },
        iconClass && createElement('i', { className: iconClass }),
        children
    )
);

const KPICard = ({ title, value, unit = '', trend = null, trendArrow = '', colorClass = '', onClick = () => {} }) => (
    createElement('div', { className: `kpi-card ${colorClass}`, onClick },
        createElement('div', { className: 'kpi-card-header' },
            createElement('span', { className: 'kpi-card-label' }, title)
        ),
        createElement('div', { className: 'kpi-card-value' },
            value,
            unit && createElement('span', { style: { fontSize: '0.5em', marginLeft: '5px', alignSelf: 'flex-end', color: 'var(--status-grey)' } }, unit),
            trendArrow && createElement('span', { className: `trend-arrow ${trendArrow === 'up' ? 'up' : 'down'}` },
                trendArrow === 'up' ? createElement('i', { className: 'fa-solid fa-arrow-up' }) : createElement('i', { className: 'fa-solid fa-arrow-down' })
            )
        )
    )
);

const ChartPlaceholder = ({ title, type }) => (
    createElement('div', { className: 'chart-card' },
        createElement('h4', null, title),
        createElement('div', { className: 'chart-placeholder' }, `[ ${type} Chart ]`)
    )
);

const ActivityFeed = ({ activities, title = 'Recent Activities' }) => (
    createElement('div', { className: 'activity-feed' },
        createElement('h3', { className: 'mb-md' }, createElement('i', { className: 'fa-solid fa-clock-rotate-left' }), ' ', title),
        createElement('ul', { className: 'activity-list' },
            activities.length > 0 ? activities.map((activity, index) => (
                createElement('li', { key: index, className: 'activity-item' },
                    createElement('i', { className: `icon fa-solid ${activity.icon || 'fa-circle-info'}` }),
                    createElement('div', { className: 'details' },
                        createElement('p', null, activity.description, createElement('span', { className: `status-badge ${getStatusColorClass(activity.status)}` }, activity.status)),
                        createElement('span', null, new Date(activity.date).toLocaleString())
                    )
                )
            )) : createElement('p', null, 'No recent activities.')
        )
    )
);

const Card = ({ item, type, onClick }) => {
    let headerText, mainContent, footerContent, cardClassExtra = '';

    if (type === 'Order') {
        headerText = `Order #${item.id}`;
        mainContent = createElement(React.Fragment, null,
            createElement('h4', null, item.customerName),
            createElement('p', null, item.serviceProviderName),
            createElement('p', null, `Items: ${item.clothItems.map(i => i.quantity + ' ' + i.type).join(', ')}`),
            createElement('p', null, `Total: $${item.totalPrice.toFixed(2)}`),
        );
        footerContent = createElement(React.Fragment, null,
            createElement('span', null, item.deliveryOption),
            createElement('span', { className: `status-badge ${getStatusColorClass(item.status)}` }, item.status)
        );
        cardClassExtra = getStatusColorClass(item.status);
    } else if (type === 'Partner') {
        headerText = `Partner: ${item.name}`;
        mainContent = createElement(React.Fragment, null,
            createElement('h4', null, item.contact),
            createElement('p', null, item.address)
        );
        footerContent = createElement(React.Fragment, null,
            createElement('span', null, `Since: ${new Date(item.createdAt).toLocaleDateString()}`),
            createElement('span', { className: `status-badge ${getStatusColorClass(item.status || 'Active').replace('status-', 'type-')}` }, item.status)
        );
        cardClassExtra = 'type-Partner'; // Specific class for partner card color
    } else if (type === 'Rate') {
        headerText = `Rate: ${item.clothType}`;
        mainContent = createElement(React.Fragment, null,
            createElement('h4', null, `$${item.pricePerItem.toFixed(2)} / item`),
            createElement('p', null, `Established: ${new Date(item.createdAt).toLocaleDateString()}`)
        );
        footerContent = createElement(React.Fragment, null,
            createElement('span', null, 'Pricing'),
            createElement('span', { className: 'status-badge type-Rate' }, 'Active') // Example static badge for Rate
        );
        cardClassExtra = 'type-Rate'; // Specific class for rate card color
    }

    return (
        createElement('div', { className: `card ${cardClassExtra}`, onClick: () => onClick(item) },
            createElement('div', { className: 'card-header-colored' }, headerText),
            createElement('div', { className: 'card-content' }, mainContent),
            createElement('div', { className: 'card-footer' }, footerContent)
        )
    );
};

const CardList = ({ title, data, type, onCardClick, addButton = null }) => (
    createElement('div', { className: 'card-list-wrapper' },
        createElement('div', { className: 'card-list-header' },
            createElement('h3', null, title),
            addButton
        ),
        createElement('div', { className: 'card-grid' },
            data.length > 0 ? data.map(item =>
                createElement(Card, { key: item.id, item, type, onClick: onCardClick })
            ) : createElement('p', { className: 'text-center' }, `No ${type}s found.`)
        )
    )
);

const WorkflowTracker = ({ currentStatus, timeline }) => {
    const stages = ['Created', 'Accepted', 'Ironing', 'Ready', 'Delivered/Picked'];
    const currentStatusIndex = stages.findIndex(s => s.startsWith(currentStatus) || currentStatus.startsWith(s));

    const getTimelineDate = (stage) => {
        const entry = timeline.find(t => stage.startsWith(t.status) || t.status.startsWith(stage));
        return entry ? new Date(entry.date).toLocaleString() : 'N/A';
    };

    return (
        createElement('div', { className: 'workflow-tracker' },
            stages.map((stage, index) => (
                createElement('div', {
                    key: stage,
                    className: `workflow-step ${index <= currentStatusIndex ? 'completed' : ''} ${index === currentStatusIndex ? 'current' : ''}`
                },
                    createElement('div', { className: 'workflow-step-icon' },
                        index <= currentStatusIndex ? createElement('i', { className: 'fa-solid fa-check' }) : createElement('i', { className: `fa-solid ${
                            stage === 'Created' ? 'fa-file-circle-plus' :
                            stage === 'Accepted' ? 'fa-handshake' :
                            stage === 'Ironing' ? 'fa-shirt' :
                            stage === 'Ready' ? 'fa-box-archive' :
                            'fa-truck-fast'
                        }` })
                    ),
                    createElement('span', { className: 'workflow-step-label' }, stage),
                    createElement('span', { style: { fontSize: '0.7em', color: 'var(--status-grey)' } }, getTimelineDate(stage))
                )
            ))
        )
    );
};

const ToastNotification = ({ message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 5000); // Hide after 5 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!isVisible) return null;

    let iconClass;
    switch (type) {
        case 'success': iconClass = 'fa-solid fa-circle-check'; break;
        case 'error': iconClass = 'fa-solid fa-circle-xmark'; break;
        case 'warning': iconClass = 'fa-solid fa-triangle-exclamation'; break;
        case 'info':
        default: iconClass = 'fa-solid fa-circle-info'; break;
    }

    return (
        createElement('div', { className: `toast ${type}` },
            createElement('i', { className: `icon ${iconClass}` }),
            createElement('span', null, message)
        )
    );
};


// --- Forms ---
const OrderForm = ({ order = {}, onSave, onCancel, currentUser, availablePartners, availableRates }) => {
    const isEdit = !!order.id;
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        customerId: currentUser.id,
        customerName: currentUser.name,
        serviceProviderId: order.serviceProviderId || '',
        serviceProviderName: order.serviceProviderName || '',
        deliveryOption: order.deliveryOption || 'Doorstep',
        deliveryAddress: order.deliveryOption === 'Doorstep' ? order.deliveryAddress || '' : '',
        pickupTime: order.deliveryOption === 'Customer Pickup' ? order.pickupTime || '' : '',
        clothItems: order.clothItems && order.clothItems.length > 0 ? order.clothItems : [{ type: '', quantity: '', pricePerItem: 0 }],
        status: order.status || 'Created',
        totalPrice: order.totalPrice || 0
    });
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        calculateTotalPrice();
    }, [formData.clothItems, availableRates]);

    const calculateTotalPrice = () => {
        let total = 0;
        formData.clothItems.forEach(item => {
            const rate = availableRates.find(r => r.clothType === item.type);
            const price = rate ? rate.pricePerItem : item.pricePerItem; // Use form price if rate not found or for edit
            total += (item.quantity || 0) * price;
        });
        setFormData(prev => ({ ...prev, totalPrice: total }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Update service provider name based on ID
        if (name === 'serviceProviderId') {
            const selectedPartner = availablePartners.find(p => p.id === value);
            if (selectedPartner) {
                setFormData(prev => ({ ...prev, serviceProviderName: selectedPartner.name }));
            } else {
                setFormData(prev => ({ ...prev, serviceProviderName: '' }));
            }
        }
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.clothItems];
        if (name === 'type') {
            const selectedRate = availableRates.find(r => r.clothType === value);
            newItems[index] = { ...newItems[index], [name]: value, pricePerItem: selectedRate ? selectedRate.pricePerItem : 0 };
        } else {
            newItems[index] = { ...newItems[index], [name]: name === 'quantity' ? parseInt(value) || 0 : value };
        }
        setFormData(prev => ({ ...prev, clothItems: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            clothItems: [...prev.clothItems, { type: '', quantity: '', pricePerItem: 0 }]
        }));
    };

    const removeItem = (index) => {
        const newItems = formData.clothItems.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, clothItems: newItems }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.serviceProviderId) newErrors.serviceProviderId = 'Service Provider is required.';
        if (!formData.deliveryOption) newErrors.deliveryOption = 'Delivery Option is required.';
        if (formData.deliveryOption === 'Doorstep' && !formData.deliveryAddress) newErrors.deliveryAddress = 'Delivery Address is required.';
        if (formData.deliveryOption === 'Customer Pickup' && !formData.pickupTime) newErrors.pickupTime = 'Pickup Time is required.';

        formData.clothItems.forEach((item, index) => {
            if (!item.type) newErrors[`itemType-${index}`] = 'Cloth type is required.';
            if (!item.quantity || item.quantity <= 0) newErrors[`itemQuantity-${index}`] = 'Quantity must be positive.';
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onSave(formData);
            setShowSuccess(true);
            setTimeout(() => { onCancel(); }, 2000); // Go back after success
        }
    };

    const formSteps = [
        { label: 'General Info', component: () => (
            createElement(React.Fragment, null,
                createElement('div', { className: 'form-group' },
                    createElement('label', { htmlFor: 'serviceProviderId' }, 'Service Provider'),
                    createElement('select', {
                        id: 'serviceProviderId',
                        name: 'serviceProviderId',
                        value: formData.serviceProviderId,
                        onChange: handleChange,
                        className: errors.serviceProviderId ? 'invalid' : ''
                    },
                        createElement('option', { value: '' }, 'Select a partner'),
                        availablePartners.map(p =>
                            createElement('option', { key: p.id, value: p.id }, p.name)
                        )
                    ),
                    errors.serviceProviderId && createElement('span', { className: 'error-message' }, errors.serviceProviderId)
                ),
                createElement('div', { className: 'form-group' },
                    createElement('label', { htmlFor: 'deliveryOption' }, 'Delivery Option'),
                    createElement('select', {
                        id: 'deliveryOption',
                        name: 'deliveryOption',
                        value: formData.deliveryOption,
                        onChange: handleChange,
                        className: errors.deliveryOption ? 'invalid' : ''
                    },
                        createElement('option', { value: 'Doorstep' }, 'Doorstep Delivery'),
                        createElement('option', { value: 'Customer Pickup' }, 'Customer Pickup')
                    ),
                    errors.deliveryOption && createElement('span', { className: 'error-message' }, errors.deliveryOption)
                ),
                formData.deliveryOption === 'Doorstep' &&
                createElement('div', { className: 'form-group' },
                    createElement('label', { htmlFor: 'deliveryAddress' }, 'Delivery Address'),
                    createElement('input', {
                        type: 'text',
                        id: 'deliveryAddress',
                        name: 'deliveryAddress',
                        value: formData.deliveryAddress,
                        onChange: handleChange,
                        className: errors.deliveryAddress ? 'invalid' : ''
                    }),
                    errors.deliveryAddress && createElement('span', { className: 'error-message' }, errors.deliveryAddress)
                ),
                formData.deliveryOption === 'Customer Pickup' &&
                createElement('div', { className: 'form-group' },
                    createElement('label', { htmlFor: 'pickupTime' }, 'Preferred Pickup Time'),
                    createElement('input', {
                        type: 'datetime-local',
                        id: 'pickupTime',
                        name: 'pickupTime',
                        value: formData.pickupTime,
                        onChange: handleChange,
                        className: errors.pickupTime ? 'invalid' : ''
                    }),
                    errors.pickupTime && createElement('span', { className: 'error-message' }, errors.pickupTime)
                )
            )
        )},
        { label: 'Items & Pricing', component: () => (
            createElement(React.Fragment, null,
                createElement('h4', {className: 'mb-md'}, 'Cloth Items'),
                formData.clothItems.map((item, index) => (
                    createElement('div', { key: index, style: { display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-end' } },
                        createElement('div', { className: 'form-group', style: { flex: 3 } },
                            createElement('label', null, 'Cloth Type'),
                            createElement('select', {
                                name: 'type',
                                value: item.type,
                                onChange: (e) => handleItemChange(index, e),
                                className: errors[`itemType-${index}`] ? 'invalid' : ''
                            },
                                createElement('option', { value: '' }, 'Select type'),
                                availableRates.map(rate => createElement('option', { key: rate.id, value: rate.clothType }, rate.clothType))
                            ),
                            errors[`itemType-${index}`] && createElement('span', { className: 'error-message' }, errors[`itemType-${index}`])
                        ),
                        createElement('div', { className: 'form-group', style: { flex: 1 } },
                            createElement('label', null, 'Quantity'),
                            createElement('input', {
                                type: 'number',
                                name: 'quantity',
                                value: item.quantity,
                                onChange: (e) => handleItemChange(index, e),
                                min: '1',
                                className: errors[`itemQuantity-${index}`] ? 'invalid' : ''
                            }),
                            errors[`itemQuantity-${index}`] && createElement('span', { className: 'error-message' }, errors[`itemQuantity-${index}`])
                        ),
                        createElement('div', { className: 'form-group', style: { flex: 1 } },
                            createElement('label', null, 'Price/Item'),
                            createElement('input', {
                                type: 'text',
                                value: item.pricePerItem.toFixed(2),
                                readOnly: true,
                                style: { backgroundColor: '#f0f0f0' }
                            })
                        ),
                        createElement(Button, { type: 'button', className: 'btn-danger', onClick: () => removeItem(index), iconClass: 'fa-solid fa-trash' }, 'Remove')
                    )
                )),
                createElement(Button, { type: 'button', className: 'btn-secondary', onClick: addItem, iconClass: 'fa-solid fa-plus' }, 'Add Item'),
                createElement('div', { style: { marginTop: 'var(--spacing-md)', textAlign: 'right', fontSize: '1.2em', fontWeight: 'bold' } },
                    `Total Price: $${formData.totalPrice.toFixed(2)}`
                )
            )
        )},
    ];

    return (
        createElement('div', { className: 'full-screen-overlay' },
            createElement('div', { className: 'full-screen-header' },
                createElement(Button, { className: 'back-btn btn-outline', onClick: onCancel, iconClass: 'fa-solid fa-arrow-left' }),
                createElement('h2', null, isEdit ? `Edit Order #${order.id}` : 'Place New Order')
            ),
            !showSuccess ? (
                createElement('div', { className: 'form-container' },
                    createElement('div', { className: 'form-progress-bar' },
                        formSteps.map((step, index) => (
                            createElement('div', { key: index, className: `step ${currentStep > index ? 'completed' : ''} ${currentStep === index + 1 ? 'active' : ''}` },
                                createElement('div', { className: 'step-dot' }, index + 1),
                                createElement('span', null, step.label)
                            )
                        ))
                    ),
                    formSteps[currentStep - 1].component(),
                    createElement('div', { className: 'form-actions' },
                        currentStep > 1 && createElement(Button, { className: 'btn-outline', onClick: () => setCurrentStep(prev => prev - 1) }, 'Previous'),
                        currentStep < formSteps.length && createElement(Button, { className: 'btn-primary', onClick: () => setCurrentStep(prev => prev + 1) }, 'Next'),
                        currentStep === formSteps.length && createElement(Button, { className: 'btn-primary', onClick: handleSubmit }, isEdit ? 'Update Order' : 'Place Order')
                    )
                )
            ) : (
                createElement('div', { className: 'detail-content' },
                    createElement('div', { className: 'success-screen' },
                        createElement('i', { className: 'icon fa-solid fa-circle-check' }),
                        createElement('h3', null, 'Success!'),
                        createElement('p', null, `Order ${isEdit ? 'updated' : 'placed'} successfully! Redirecting...`)
                    )
                )
            )
        )
    );
};

const RateForm = ({ rate = {}, onSave, onCancel }) => {
    const isEdit = !!rate.id;
    const [formData, setFormData] = useState({
        clothType: rate.clothType || '',
        pricePerItem: rate.pricePerItem || '',
    });
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.clothType) newErrors.clothType = 'Cloth Type is required.';
        if (!formData.pricePerItem || parseFloat(formData.pricePerItem) <= 0) newErrors.pricePerItem = 'Price per item must be a positive number.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onSave(formData);
            setShowSuccess(true);
            setTimeout(() => { onCancel(); }, 2000);
        }
    };

    return (
        createElement('div', { className: 'full-screen-overlay' },
            createElement('div', { className: 'full-screen-header' },
                createElement(Button, { className: 'back-btn btn-outline', onClick: onCancel, iconClass: 'fa-solid fa-arrow-left' }),
                createElement('h2', null, isEdit ? `Edit Rate for ${rate.clothType}` : 'Add New Rate')
            ),
            !showSuccess ? (
                createElement('div', { className: 'form-container' },
                    createElement('form', { onSubmit: (e) => { e.preventDefault(); handleSubmit(); } },
                        createElement('div', { className: 'form-group' },
                            createElement('label', { htmlFor: 'clothType' }, 'Cloth Type'),
                            createElement('input', {
                                type: 'text',
                                id: 'clothType',
                                name: 'clothType',
                                value: formData.clothType,
                                onChange: handleChange,
                                className: errors.clothType ? 'invalid' : '',
                                readOnly: isEdit // Cloth type usually not editable
                            }),
                            errors.clothType && createElement('span', { className: 'error-message' }, errors.clothType)
                        ),
                        createElement('div', { className: 'form-group' },
                            createElement('label', { htmlFor: 'pricePerItem' }, 'Price Per Item ($)'),
                            createElement('input', {
                                type: 'number',
                                id: 'pricePerItem',
                                name: 'pricePerItem',
                                value: formData.pricePerItem,
                                onChange: handleChange,
                                step: '0.01',
                                className: errors.pricePerItem ? 'invalid' : ''
                            }),
                            errors.pricePerItem && createElement('span', { className: 'error-message' }, errors.pricePerItem)
                        ),
                        createElement('div', { className: 'form-actions' },
                            createElement(Button, { className: 'btn-secondary', onClick: onCancel }, 'Cancel'),
                            createElement(Button, { type: 'submit', className: 'btn-primary' }, isEdit ? 'Update Rate' : 'Add Rate')
                        )
                    )
                )
            ) : (
                createElement('div', { className: 'detail-content' },
                    createElement('div', { className: 'success-screen' },
                        createElement('i', { className: 'icon fa-solid fa-circle-check' }),
                        createElement('h3', null, 'Success!'),
                        createElement('p', null, `Rate ${isEdit ? 'updated' : 'added'} successfully! Redirecting...`)
                    )
                )
            )
        )
    );
};


const PartnerForm = ({ partner = {}, onSave, onCancel }) => {
    const isEdit = !!partner.id;
    const [formData, setFormData] = useState({
        name: partner.name || '',
        contact: partner.contact || '',
        address: partner.address || '',
        status: partner.status || 'Active',
    });
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Partner Name is required.';
        if (!formData.contact) newErrors.contact = 'Contact is required.';
        if (!formData.address) newErrors.address = 'Address is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onSave(formData);
            setShowSuccess(true);
            setTimeout(() => { onCancel(); }, 2000);
        }
    };

    return (
        createElement('div', { className: 'full-screen-overlay' },
            createElement('div', { className: 'full-screen-header' },
                createElement(Button, { className: 'back-btn btn-outline', onClick: onCancel, iconClass: 'fa-solid fa-arrow-left' }),
                createElement('h2', null, isEdit ? `Edit Partner: ${partner.name}` : 'Add New Partner')
            ),
            !showSuccess ? (
                createElement('div', { className: 'form-container' },
                    createElement('form', { onSubmit: (e) => { e.preventDefault(); handleSubmit(); } },
                        createElement('div', { className: 'form-group' },
                            createElement('label', { htmlFor: 'name' }, 'Partner Name'),
                            createElement('input', {
                                type: 'text',
                                id: 'name',
                                name: 'name',
                                value: formData.name,
                                onChange: handleChange,
                                className: errors.name ? 'invalid' : ''
                            }),
                            errors.name && createElement('span', { className: 'error-message' }, errors.name)
                        ),
                        createElement('div', { className: 'form-group' },
                            createElement('label', { htmlFor: 'contact' }, 'Contact'),
                            createElement('input', {
                                type: 'text',
                                id: 'contact',
                                name: 'contact',
                                value: formData.contact,
                                onChange: handleChange,
                                className: errors.contact ? 'invalid' : ''
                            }),
                            errors.contact && createElement('span', { className: 'error-message' }, errors.contact)
                        ),
                        createElement('div', { className: 'form-group' },
                            createElement('label', { htmlFor: 'address' }, 'Address'),
                            createElement('textarea', {
                                id: 'address',
                                name: 'address',
                                value: formData.address,
                                onChange: handleChange,
                                className: errors.address ? 'invalid' : ''
                            }),
                            errors.address && createElement('span', { className: 'error-message' }, errors.address)
                        ),
                        createElement('div', { className: 'form-group' },
                            createElement('label', { htmlFor: 'status' }, 'Status'),
                            createElement('select', {
                                id: 'status',
                                name: 'status',
                                value: formData.status,
                                onChange: handleChange
                            },
                                createElement('option', { value: 'Active' }, 'Active'),
                                createElement('option', { value: 'Inactive' }, 'Inactive')
                            )
                        ),
                        createElement('div', { className: 'form-actions' },
                            createElement(Button, { className: 'btn-secondary', onClick: onCancel }, 'Cancel'),
                            createElement(Button, { type: 'submit', className: 'btn-primary' }, isEdit ? 'Update Partner' : 'Add Partner')
                        )
                    )
                )
            ) : (
                createElement('div', { className: 'detail-content' },
                    createElement('div', { className: 'success-screen' },
                        createElement('i', { className: 'icon fa-solid fa-circle-check' }),
                        createElement('h3', null, 'Success!'),
                        createElement('p', null, `Partner ${isEdit ? 'updated' : 'added'} successfully! Redirecting...`)
                    )
                )
            )
        )
    );
};


// --- Detail Views ---
const OrderDetail = ({ order, onBack, onUpdateOrder, currentUser }) => {
    if (!order) return null;

    const canAccept = currentUser.role === 'Service Provider' && order.status === 'Created';
    const canMarkIroning = currentUser.role === 'Service Provider' && order.status === 'Accepted';
    const canMarkReady = currentUser.role === 'Service Provider' && order.status === 'Ironing';
    const canMarkDelivered = currentUser.role === 'Service Provider' && order.status === 'Ready' && order.deliveryOption === 'Doorstep';
    const canMarkPicked = currentUser.role === 'Customer' && order.status === 'Ready' && order.deliveryOption === 'Customer Pickup';

    const updateOrderStatus = (newStatus) => {
        onUpdateOrder(order.id, newStatus);
    };

    return (
        createElement('div', { className: 'full-screen-overlay' },
            createElement('div', { className: 'full-screen-header' },
                createElement(Button, { className: 'back-btn btn-outline', onClick: onBack, iconClass: 'fa-solid fa-arrow-left' }),
                createElement('h2', null, `Order #${order.id}`)
            ),
            createElement('div', { className: 'detail-content' },
                createElement('div', { className: 'detail-section hero-section' },
                    createElement('h3', null, createElement('i', { className: 'fa-solid fa-clipboard-list' }), ' Order Summary ', createElement('span', { className: `status-badge ${getStatusColorClass(order.status)}`, style: { fontSize: '0.8em', marginLeft: '10px' } }, order.status)),
                    createElement('div', { className: 'detail-info-grid' },
                        createElement('div', { className: 'detail-item' }, createElement('strong', null, 'Customer'), createElement('span', null, order.customerName)),
                        order.serviceProviderName && createElement('div', { className: 'detail-item' }, createElement('strong', null, 'Service Provider'), createElement('span', null, order.serviceProviderName)),
                        createElement('div', { className: 'detail-item' }, createElement('strong', null, 'Total Price'), createElement('span', null, `$${order.totalPrice.toFixed(2)}`)),
                        createElement('div', { className: 'detail-item' }, createElement('strong', null, 'Order Date'), createElement('span', null, new Date(order.createdAt).toLocaleDateString())),
                        createElement('div', { className: 'detail-item' },
                            createElement('strong', null, 'Delivery Option'),
                            createElement('span', null,
                                createElement('span', { className: 'detail-delivery-badge' },
                                    order.deliveryOption === 'Doorstep' ? createElement('i', { className: 'fa-solid fa-truck' }) : createElement('i', { className: 'fa-solid fa-store' }),
                                    order.deliveryOption
                                )
                            )
                        ),
                        order.deliveryOption === 'Doorstep' && createElement('div', { className: 'detail-item' }, createElement('strong', null, 'Delivery Address'), createElement('span', null, order.deliveryAddress)),
                        order.deliveryOption === 'Customer Pickup' && createElement('div', { className: 'detail-item' }, createElement('strong', null, 'Pickup Time'), createElement('span', null, new Date(order.pickupTime).toLocaleString()))
                    )
                ),
                createElement('div', { className: 'detail-section' },
                    createElement('h3', null, createElement('i', { className: 'fa-solid fa-boxes-stacked' }), ' Items'),
                    createElement('ul', { style: { listStyle: 'none', paddingLeft: '0' } },
                        order.clothItems.map((item, index) => (
                            createElement('li', { key: index, style: { marginBottom: '5px' } }, `${item.quantity} x ${item.type} - $${item.pricePerItem.toFixed(2)} each`)
                        ))
                    )
                ),
                createElement('div', { className: 'detail-section' },
                    createElement('h3', null, createElement('i', { className: 'fa-solid fa-route' }), ' Workflow Progress'),
                    createElement(WorkflowTracker, { currentStatus: order.status, timeline: order.timeline })
                ),
                createElement('div', { className: 'detail-section' },
                    createElement('h3', null, createElement('i', { className: 'fa-solid fa-timeline' }), ' Audit Timeline'),
                    createElement('ul', { className: 'activity-list' },
                        order.timeline.map((event, index) => (
                            createElement('li', { key: index, className: 'activity-item' },
                                createElement('i', { className: 'icon fa-solid fa-history' }),
                                createElement('div', { className: 'details' },
                                    createElement('p', null, `${event.status} by ${event.by}`),
                                    createElement('span', null, new Date(event.date).toLocaleString())
                                )
                            )
                        ))
                    )
                )
            ),
            (canAccept || canMarkIroning || canMarkReady || canMarkDelivered || canMarkPicked) &&
            createElement('div', { className: 'detail-actions-sticky' },
                canAccept && createElement(Button, { className: 'btn-action', onClick: () => updateOrderStatus('Accepted'), iconClass: 'fa-solid fa-check' }, 'Accept Order'),
                canMarkIroning && createElement(Button, { className: 'btn-action', onClick: () => updateOrderStatus('Ironing'), iconClass: 'fa-solid fa-shirt' }, 'Mark Ironing'),
                canMarkReady && createElement(Button, { className: 'btn-action', onClick: () => updateOrderStatus('Ready'), iconClass: 'fa-solid fa-box-archive' }, 'Mark Ready'),
                canMarkDelivered && createElement(Button, { className: 'btn-action', onClick: () => updateOrderStatus('Delivered'), iconClass: 'fa-solid fa-truck-fast' }, 'Mark Delivered'),
                canMarkPicked && createElement(Button, { className: 'btn-action', onClick: () => updateOrderStatus('Picked'), iconClass: 'fa-solid fa-handshake' }, 'Mark Picked Up')
            )
        )
    );
};

const PartnerDetail = ({ partner, onBack, onUpdatePartner, onDeletePartner, onShowForm, currentUser }) => {
    if (!partner) return null;
    const canEdit = currentUser.role === 'Admin';
    const canDelete = currentUser.role === 'Admin';

    return (
        createElement('div', { className: 'full-screen-overlay' },
            createElement('div', { className: 'full-screen-header' },
                createElement(Button, { className: 'back-btn btn-outline', onClick: onBack, iconClass: 'fa-solid fa-arrow-left' }),
                createElement('h2', null, `Partner: ${partner.name}`)
            ),
            createElement('div', { className: 'detail-content' },
                createElement('div', { className: 'detail-section' },
                    createElement('h3', null, createElement('i', { className: 'fa-solid fa-building' }), ' Partner Info'),
                    createElement('div', { className: 'detail-info-grid' },
                        createElement('div', { className: 'detail-item' }, createElement('strong', null, 'Name'), createElement('span', null, partner.name)),
                        createElement('div', { className: 'detail-item' }, createElement('strong', null, 'Contact'), createElement('span', null, partner.contact)),
                        createElement('div', { className: 'detail-item' }, createElement('strong', null, 'Address'), createElement('span', null, partner.address)),
                        createElement('div', { className: 'detail-item' }, createElement('strong', null, 'Status'), createElement('span', null, partner.status)),
                        createElement('div', { className: 'detail-item' }, createElement('strong', null, 'Joined Date'), createElement('span', null, new Date(partner.createdAt).toLocaleDateString()))
                    )
                ),
                // Related records (orders handled by orders list, this is just a partner detail)
                createElement('div', { className: 'detail-section' },
                    createElement('h3', null, createElement('i', { className: 'fa-solid fa-info-circle' }), ' Operational Details'),
                    createElement('p', null, 'Detailed performance metrics and assigned orders for this partner would appear here.')
                )
            ),
            (canEdit || canDelete) &&
            createElement('div', { className: 'detail-actions-sticky' },
                canEdit && createElement(Button, { className: 'btn-primary', onClick: () => onShowForm(partner), iconClass: 'fa-solid fa-pencil' }, 'Edit Partner'),
                canDelete && createElement(Button, { className: 'btn-danger', onClick: () => onDeletePartner(partner.id), iconClass: 'fa-solid fa-trash' }, 'Delete Partner')
            )
        )
    );
};

const RateDetail = ({ rate, onBack, onUpdateRate, onDeleteRate, onShowForm, currentUser }) => {
    if (!rate) return null;
    const canEdit = currentUser.role === 'Admin';
    const canDelete = currentUser.role === 'Admin';

    return (
        createElement('div', { className: 'full-screen-overlay' },
            createElement('div', { className: 'full-screen-header' },
                createElement(Button, { className: 'back-btn btn-outline', onClick: onBack, iconClass: 'fa-solid fa-arrow-left' }),
                createElement('h2', null, `Rate: ${rate.clothType}`)
            ),
            createElement('div', { className: 'detail-content' },
                createElement('div', { className: 'detail-section' },
                    createElement('h3', null, createElement('i', { className: 'fa-solid fa-tag' }), ' Rate Details'),
                    createElement('div', { className: 'detail-info-grid' },
                        createElement('div', { className: 'detail-item' }, createElement('strong', null, 'Cloth Type'), createElement('span', null, rate.clothType)),
                        createElement('div', { className: 'detail-item' }, createElement('strong', null, 'Price Per Item'), createElement('span', null, `$${rate.pricePerItem.toFixed(2)}`)),
                        createElement('div', { className: 'detail-item' }, createElement('strong', null, 'Created At'), createElement('span', null, new Date(rate.createdAt).toLocaleDateString()))
                    )
                ),
            ),
            (canEdit || canDelete) &&
            createElement('div', { className: 'detail-actions-sticky' },
                canEdit && createElement(Button, { className: 'btn-primary', onClick: () => onShowForm(rate), iconClass: 'fa-solid fa-pencil' }, 'Edit Rate'),
                canDelete && createElement(Button, { className: 'btn-danger', onClick: () => onDeleteRate(rate.id), iconClass: 'fa-solid fa-trash' }, 'Delete Rate')
            )
        )
    );
};


// --- Dashboards ---
const CustomerDashboard = ({ currentUser, orders, onCardClick, onPlaceOrder, showToast }) => {
    const customerOrders = orders.filter(o => o.customerId === currentUser.id);
    const ordersPlaced = customerOrders.length;
    const ordersReady = customerOrders.filter(o => o.status === 'Ready').length;
    const orderStatusDistribution = customerOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {});
    const recentActivities = customerOrders.slice(-3).reverse().map(o => ({
        description: `Order #${o.id} - ${o.status}`,
        status: o.status,
        date: o.updatedAt,
        icon: 'fa-solid fa-shirt'
    }));

    return (
        createElement('div', { className: 'main-content' },
            createElement('h1', null, `Welcome, ${currentUser.name}!`),
            createElement('div', { className: 'dashboard-grid mt-lg' },
                createElement(KPICard, { title: 'Orders Placed', value: ordersPlaced, colorClass: 'kpi-blue', onClick: () => showToast('Orders Placed KPI clicked!', 'info') }),
                createElement(KPICard, { title: 'Orders Ready', value: ordersReady, colorClass: 'kpi-green', onClick: () => showToast('Orders Ready KPI clicked!', 'info') })
            ),
            createElement('div', { className: 'dashboard-grid mt-lg' },
                createElement(ChartPlaceholder, { title: 'Order Status Distribution', type: 'Donut' })
            ),
            createElement(ActivityFeed, { activities: recentActivities }),
            createElement(CardList, {
                title: 'My Orders',
                data: customerOrders,
                type: 'Order',
                onCardClick: onCardClick,
                addButton: createElement(Button, { className: 'btn-primary', onClick: onPlaceOrder, iconClass: 'fa-solid fa-plus' }, 'Place New Order')
            })
        )
    );
};

const ServiceProviderDashboard = ({ currentUser, orders, onCardClick, onUpdateOrder, showToast }) => {
    const providerOrders = orders.filter(o => o.serviceProviderId === currentUser.id);
    const ordersReceived = providerOrders.filter(o => o.status === 'Created').length;
    const ordersInProgress = providerOrders.filter(o => ['Accepted', 'Ironing'].includes(o.status)).length;
    const ordersCompleted = providerOrders.filter(o => ['Ready', 'Delivered', 'Picked'].includes(o.status)).length;
    const deliveriesScheduled = providerOrders.filter(o => o.deliveryOption === 'Doorstep' && o.status === 'Ready').length;

    const kanbanColumns = {
        'New Orders': providerOrders.filter(o => o.status === 'Created'),
        'In Progress': providerOrders.filter(o => ['Accepted', 'Ironing'].includes(o.status)),
        'Ready for Delivery/Pickup': providerOrders.filter(o => o.status === 'Ready'),
    };

    const recentActivities = providerOrders.slice(-5).reverse().map(o => ({
        description: `Order #${o.id} ${o.status}`,
        status: o.status,
        date: o.updatedAt,
        icon: 'fa-solid fa-shirt'
    }));

    return (
        createElement('div', { className: 'main-content' },
            createElement('h1', null, `Welcome, ${currentUser.name}!`),
            createElement('div', { className: 'dashboard-grid mt-lg' },
                createElement(KPICard, { title: 'Orders Received', value: ordersReceived, colorClass: 'kpi-orange', onClick: () => showToast('Orders Received KPI clicked!', 'info') }),
                createElement(KPICard, { title: 'Orders In Progress', value: ordersInProgress, colorClass: 'kpi-blue', onClick: () => showToast('Orders In Progress KPI clicked!', 'info') }),
                createElement(KPICard, { title: 'Orders Completed', value: ordersCompleted, colorClass: 'kpi-green', onClick: () => showToast('Orders Completed KPI clicked!', 'info') }),
                createElement(KPICard, { title: 'Deliveries Scheduled', value: deliveriesScheduled, colorClass: 'kpi-blue', onClick: () => showToast('Deliveries Scheduled KPI clicked!', 'info') })
            ),
            createElement('div', { className: 'dashboard-grid mt-lg' },
                createElement(ChartPlaceholder, { title: 'Orders by Status', type: 'Bar' }),
                createElement(ChartPlaceholder, { title: 'Daily Volume Trend', type: 'Line' }),
                createElement(ChartPlaceholder, { title: 'Delivery vs Pickup', type: 'Donut' })
            ),
            createElement('div', { className: 'task-queue mt-lg' },
                createElement('h3', { className: 'mb-md' }, createElement('i', { className: 'fa-solid fa-list-check' }), ' My Work Queue'),
                createElement('div', { className: 'kanban-board' },
                    Object.entries(kanbanColumns).map(([columnTitle, tasks]) =>
                        createElement('div', { key: columnTitle, className: 'kanban-column' },
                            createElement('div', { className: 'kanban-column-header' }, columnTitle),
                            tasks.length > 0 ? tasks.map(task =>
                                createElement('div', { key: task.id, className: `kanban-task-card ${getStatusColorClass(task.status)}`, onClick: () => onCardClick(task) },
                                    createElement('h4', null, `Order #${task.id}`),
                                    createElement('p', null, task.customerName),
                                    createElement('p', null, `Total: $${task.totalPrice.toFixed(2)}`)
                                )
                            ) : createElement('p', { style: { opacity: 0.7, fontSize: '0.9em' } }, 'No tasks in this column.')
                        )
                    )
                )
            ),
            createElement(ActivityFeed, { activities: recentActivities, title: 'Order History' })
        )
    );
};

const AdminDashboard = ({ currentUser, orders, partners, rates, onCardClick, onShowForm, showToast }) => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const avgTurnaroundTime = (orders.filter(o => ['Delivered', 'Picked'].includes(o.status)).reduce((sum, o) => {
        const created = new Date(o.createdAt).getTime();
        const completed = new Date(o.updatedAt).getTime(); // Assuming updated for final status
        return sum + (completed - created);
    }, 0) / (1000 * 60 * 60)) / orders.filter(o => ['Delivered', 'Picked'].includes(o.status)).length || 0;
    const deliveryVsPickupCount = orders.reduce((acc, order) => {
        acc[order.deliveryOption] = (acc[order.deliveryOption] || 0) + 1;
        return acc;
    }, {});

    const recentActivities = orders.slice(-5).reverse().map(o => ({
        description: `Order #${o.id} - ${o.status} by ${o.customerName}`,
        status: o.status,
        date: o.updatedAt,
        icon: 'fa-solid fa-receipt'
    }));

    return (
        createElement('div', { className: 'main-content' },
            createElement('h1', null, `Welcome, ${currentUser.name}!`),
            createElement('div', { className: 'dashboard-grid mt-lg' },
                createElement(KPICard, { title: 'Total Orders', value: totalOrders, colorClass: 'kpi-blue', onClick: () => showToast('Total Orders KPI clicked!', 'info') }),
                createElement(KPICard, { title: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, colorClass: 'kpi-green', onClick: () => showToast('Total Revenue KPI clicked!', 'info') }),
                createElement(KPICard, { title: 'Avg. TAT (hours)', value: avgTurnaroundTime.toFixed(1), colorClass: 'kpi-orange', onClick: () => showToast('Avg TAT KPI clicked!', 'info') }),
                createElement(KPICard, { title: 'Active Partners', value: partners.filter(p => p.status === 'Active').length, colorClass: 'kpi-blue', onClick: () => showToast('Active Partners KPI clicked!', 'info') })
            ),
            createElement('div', { className: 'dashboard-grid mt-lg' },
                createElement(ChartPlaceholder, { title: 'Revenue Trend', type: 'Line' }),
                createElement(ChartPlaceholder, { title: 'TAT Gauge', type: 'Gauge' }),
                createElement(ChartPlaceholder, { title: 'Delivery vs Pickup', type: 'Donut' })
            ),
            createElement(ActivityFeed, { activities: recentActivities, title: 'All System Activities' }),
            createElement(CardList, {
                title: 'All Orders',
                data: orders,
                type: 'Order',
                onCardClick: onCardClick
            }),
            createElement(CardList, {
                title: 'Partners',
                data: partners,
                type: 'Partner',
                onCardClick: (p) => onShowForm('PartnerDetail', p), // Direct to detail, which has edit button
                addButton: createElement(Button, { className: 'btn-primary', onClick: () => onShowForm('PartnerForm', {}), iconClass: 'fa-solid fa-plus' }, 'Add Partner')
            }),
            createElement(CardList, {
                title: 'Pricing Rates',
                data: rates,
                type: 'Rate',
                onCardClick: (r) => onShowForm('RateDetail', r), // Direct to detail, which has edit button
                addButton: createElement(Button, { className: 'btn-primary', onClick: () => onShowForm('RateForm', {}), iconClass: 'fa-solid fa-plus' }, 'Add New Rate')
            })
        )
    );
};


// --- Main App Component ---
const App = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [orders, setOrders] = useState(DUMMY_ORDERS);
    const [partners, setPartners] = useState(DUMMY_PARTNERS);
    const [rates, setRates] = useState(DUMMY_RATES);
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'orderDetail', 'orderForm', 'partnerDetail', 'partnerForm', 'rateDetail', 'rateForm'
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [toast, setToast] = useState(null); // { message, type }

    // --- RBAC & Authentication ---
    const login = (role) => {
        const user = DUMMY_USERS.find(u => u.role === role);
        if (user) {
            setCurrentUser(user);
            setCurrentView('dashboard'); // Always go to dashboard after login
        }
    };

    const logout = () => {
        setCurrentUser(null);
        setCurrentView('login');
        setSelectedRecord(null);
    };

    const hasAccess = (requiredRoles) => {
        if (!currentUser) return false;
        return requiredRoles.includes(currentUser.role);
    };

    // --- Data Operations ---
    const updateOrder = (orderId, newStatus) => {
        setOrders(prevOrders => {
            return prevOrders.map(order => {
                if (order.id === orderId) {
                    const updatedOrder = {
                        ...order,
                        status: newStatus,
                        updatedAt: new Date().toISOString(),
                        timeline: [...order.timeline, { status: newStatus, date: new Date().toISOString(), by: currentUser.name }]
                    };
                    showToast(`Order #${order.id} status updated to ${newStatus}!`, 'success');
                    return updatedOrder;
                }
                return order;
            });
        });
        setCurrentView('dashboard'); // Return to dashboard after action
    };

    const saveOrder = (newOrderData) => {
        if (newOrderData.id) { // Edit existing order
            setOrders(prevOrders => prevOrders.map(o => o.id === newOrderData.id ? { ...o, ...newOrderData, updatedAt: new Date().toISOString() } : o));
            showToast(`Order #${newOrderData.id} updated successfully!`, 'success');
        } else { // Create new order
            const newId = `O${String(orders.length + 1).padStart(3, '0')}`;
            const fullNewOrder = {
                ...newOrderData,
                id: newId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                timeline: [{ status: 'Created', date: new Date().toISOString(), by: currentUser.name }]
            };
            setOrders(prevOrders => [...prevOrders, fullNewOrder]);
            showToast(`New order #${newId} placed successfully!`, 'success');
        }
        setCurrentView('dashboard');
    };

    const savePartner = (partnerData) => {
        if (partnerData.id) { // Edit existing partner
            setPartners(prevPartners => prevPartners.map(p => p.id === partnerData.id ? { ...p, ...partnerData } : p));
            showToast(`Partner ${partnerData.name} updated successfully!`, 'success');
        } else { // Create new partner
            const newId = `p${generateUUID().substring(0,5)}`;
            setPartners(prevPartners => [...prevPartners, { ...partnerData, id: newId, createdAt: new Date().toISOString() }]);
            showToast(`New partner ${partnerData.name} added!`, 'success');
        }
        setCurrentView('dashboard');
    };

    const deletePartner = (partnerId) => {
        if (window.confirm('Are you sure you want to delete this partner?')) {
            setPartners(prevPartners => prevPartners.filter(p => p.id !== partnerId));
            showToast('Partner deleted successfully!', 'success');
            setCurrentView('dashboard');
        }
    };

    const saveRate = (rateData) => {
        if (rateData.id) { // Edit existing rate
            setRates(prevRates => prevRates.map(r => r.id === rateData.id ? { ...r, ...rateData } : r));
            showToast(`Rate for ${rateData.clothType} updated successfully!`, 'success');
        } else { // Create new rate
            const newId = `r${generateUUID().substring(0,5)}`;
            setRates(prevRates => [...prevRates, { ...rateData, id: newId, createdAt: new Date().toISOString() }]);
            showToast(`New rate for ${rateData.clothType} added!`, 'success');
        }
        setCurrentView('dashboard');
    };

    const deleteRate = (rateId) => {
        if (window.confirm('Are you sure you want to delete this rate?')) {
            setRates(prevRates => prevRates.filter(r => r.id !== rateId));
            showToast('Rate deleted successfully!', 'success');
            setCurrentView('dashboard');
        }
    };

    // --- Navigation & UI State ---
    const handleCardClick = (record, type) => {
        setSelectedRecord({ ...record, type }); // Store type to know which detail view to render
        if (type === 'Order') setCurrentView('orderDetail');
        else if (type === 'Partner') setCurrentView('partnerDetail');
        else if (type === 'Rate') setCurrentView('rateDetail');
    };

    const handleBack = () => {
        setSelectedRecord(null);
        setCurrentView('dashboard');
    };

    const handleShowForm = (formType, record = {}) => {
        setSelectedRecord({ ...record, type: formType.replace('Form', '') }); // Store record and original type for form
        setCurrentView(formType); // 'orderForm', 'partnerForm', 'rateForm'
    };

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000); // Clear toast after 5s
    };

    // --- Conditional Rendering for Main View ---
    const renderContent = () => {
        if (!currentUser) {
            return (
                createElement('div', { className: 'login-container main-content text-center', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' } },
                    createElement('h1', { className: 'mb-md' }, 'Welcome to Iron-Ease'),
                    createElement('p', { className: 'mb-lg' }, 'Please select your role to login:'),
                    createElement('div', { style: { display: 'flex', gap: 'var(--spacing-md)' } },
                        createElement(Button, { onClick: () => login('Customer'), iconClass: 'fa-solid fa-user' }, 'Login as Customer'),
                        createElement(Button, { onClick: () => login('Service Provider'), iconClass: 'fa-solid fa-handshake' }, 'Login as Service Provider'),
                        createElement(Button, { onClick: () => login('Admin'), iconClass: 'fa-solid fa-user-gear' }, 'Login as Admin')
                    )
                )
            );
        }

        switch (currentView) {
            case 'dashboard':
                if (currentUser.role === 'Customer') {
                    return createElement(CustomerDashboard, { currentUser, orders, onCardClick: (o) => handleCardClick(o, 'Order'), onPlaceOrder: () => handleShowForm('orderForm'), showToast });
                } else if (currentUser.role === 'Service Provider') {
                    return createElement(ServiceProviderDashboard, { currentUser, orders: orders.filter(o => o.serviceProviderId === currentUser.id), onCardClick: (o) => handleCardClick(o, 'Order'), onUpdateOrder, showToast });
                } else if (currentUser.role === 'Admin') {
                    return createElement(AdminDashboard, { currentUser, orders, partners, rates, onCardClick: (o) => handleCardClick(o, 'Order'), onShowForm, showToast });
                }
                break;
            case 'orderDetail':
                return hasAccess(['Customer', 'Service Provider', 'Admin']) && selectedRecord.type === 'Order' &&
                       createElement(OrderDetail, { order: selectedRecord, onBack: handleBack, onUpdateOrder, currentUser });
            case 'orderForm':
                return hasAccess(['Customer']) && selectedRecord.type === 'Order' &&
                       createElement(OrderForm, { order: selectedRecord, onSave: saveOrder, onCancel: handleBack, currentUser, availablePartners: partners.filter(p => p.status === 'Active'), availableRates: rates });
            case 'partnerDetail':
                return hasAccess(['Admin']) && selectedRecord.type === 'Partner' &&
                       createElement(PartnerDetail, { partner: selectedRecord, onBack: handleBack, onUpdatePartner: savePartner, onDeletePartner: deletePartner, onShowForm: handleShowForm, currentUser });
            case 'partnerForm':
                return hasAccess(['Admin']) && selectedRecord.type === 'Partner' &&
                       createElement(PartnerForm, { partner: selectedRecord, onSave: savePartner, onCancel: handleBack });
            case 'rateDetail':
                return hasAccess(['Admin']) && selectedRecord.type === 'Rate' &&
                       createElement(RateDetail, { rate: selectedRecord, onBack: handleBack, onUpdateRate: saveRate, onDeleteRate: deleteRate, onShowForm: handleShowForm, currentUser });
            case 'rateForm':
                return hasAccess(['Admin']) && selectedRecord.type === 'Rate' &&
                       createElement(RateForm, { rate: selectedRecord, onSave: saveRate, onCancel: handleBack });
            default:
                return createElement('div', { className: 'main-content' }, createElement('h2', null, 'Page Not Found or Access Denied.'));
        }
    };

    return (
        createElement(AuthContext.Provider, { value: { currentUser, hasAccess } },
            currentUser && createElement('header', { className: 'app-header' },
                createElement('div', { className: 'logo', onClick: () => setCurrentView('dashboard'), style: { cursor: 'pointer' } }, 'Iron-Ease'),
                createElement('div', { className: 'user-info' },
                    createElement('span', null, `Role: ${currentUser.role}`),
                    createElement('span', null, currentUser.name),
                    createElement('div', { className: 'notification-icon', onClick: () => showToast('No new notifications.', 'info') },
                        createElement('i', { className: 'fa-solid fa-bell' }),
                        createElement('span', { className: 'badge' }, 3)
                    ),
                    createElement(Button, { className: 'btn-secondary', onClick: logout }, 'Logout')
                )
            ),
            renderContent(),
            toast && createElement(ToastNotification, { message: toast.message, type: toast.type, onClose: () => setToast(null) })
        )
    );
};

// --- Render App ---
const root = createRoot(document.getElementById('root'));
root.render(createElement(App));
