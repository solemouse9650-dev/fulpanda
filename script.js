// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const cartIcon = document.getElementById('cartIcon');
const cartDropdown = document.getElementById('cartDropdown');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const cartCheckout = document.getElementById('cartCheckout');
const categoryBtns = document.querySelectorAll('.category-btn');
const menuCategories = document.querySelectorAll('.menu-category');
const buyBtns = document.querySelectorAll('.btn-buy');
const addCartBtns = document.querySelectorAll('.btn-add-cart');
const purchaseModal = document.getElementById('purchaseModal');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');
const quantityDecrease = document.getElementById('quantityDecrease');
const quantityIncrease = document.getElementById('quantityIncrease');
const quantityInput = document.getElementById('quantity');
const modalProductName = document.getElementById('modalProductName');
const modalProductPrice = document.getElementById('modalProductPrice');
const modalTotal = document.getElementById('modalTotal');
const reservationForm = document.getElementById('reservationForm');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

// Shopping Cart State
let cart = [];
let currentProduct = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupCart();
    setupMenuCategories();
    setupPurchaseModal();
    setupReservationForm();
    updateRestaurantStatus();
    setInterval(updateRestaurantStatus, 60000); // Update every minute
    
    // Set minimum date for reservation to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reservationDate').setAttribute('min', today);
}

// Navigation
function setupNavigation() {
    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const offset = 80; // Height of fixed navbar
                const targetPosition = targetSection.offsetTop - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = '#fff';
            navbar.style.backdropFilter = 'none';
        }
    });
}

// Shopping Cart
function setupCart() {
    // Toggle cart dropdown
    cartIcon.addEventListener('click', function() {
        cartDropdown.classList.toggle('active');
    });

    // Close cart dropdown
    cartClose.addEventListener('click', function() {
        cartDropdown.classList.remove('active');
    });

    // Close cart when clicking outside
    document.addEventListener('click', function(e) {
        if (!cartIcon.contains(e.target) && !cartDropdown.contains(e.target)) {
            cartDropdown.classList.remove('active');
        }
    });

    // Checkout button
    cartCheckout.addEventListener('click', function() {
        if (cart.length > 0) {
            sendWhatsAppOrder();
        }
    });

    // Buy buttons
    buyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const itemName = this.getAttribute('data-item');
            const itemPrice = parseInt(this.getAttribute('data-price'));
            openPurchaseModal(itemName, itemPrice);
        });
    });

    // Add to cart buttons
    addCartBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const itemName = this.getAttribute('data-item');
            const itemPrice = parseInt(this.getAttribute('data-price'));
            addToCart(itemName, itemPrice);
        });
    });
}

function addToCart(name, price, quantity = 1) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: quantity
        });
    }
    
    updateCart();
    showNotification(`${name} agregado al carrito`);
}

function removeFromCart(index) {
    const item = cart[index];
    cart.splice(index, 1);
    updateCart();
    showNotification(`${item.name} eliminado del carrito`);
}

function updateCart() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items display
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Tu carrito está vacío</p>';
    } else {
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <div>${item.name}</div>
                    <div class="cart-item-price">$${item.price.toLocaleString()} x ${item.quantity}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">Eliminar</button>
            `;
            cartItems.appendChild(cartItem);
        });
    }

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toLocaleString();
}

function clearCart() {
    cart = [];
    updateCart();
}

// Menu Categories
function setupMenuCategories() {
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding category
            menuCategories.forEach(cat => {
                cat.classList.remove('active');
                if (cat.id === category) {
                    cat.classList.add('active');
                }
            });
        });
    });
}

// Purchase Modal
function setupPurchaseModal() {
    // Close modal
    modalClose.addEventListener('click', closePurchaseModal);
    modalCancel.addEventListener('click', closePurchaseModal);
    
    // Close modal when clicking outside
    purchaseModal.addEventListener('click', function(e) {
        if (e.target === purchaseModal) {
            closePurchaseModal();
        }
    });

    // Quantity controls
    quantityDecrease.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            updateModalTotal();
        }
    });

    quantityIncrease.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < 99) {
            quantityInput.value = currentValue + 1;
            updateModalTotal();
        }
    });

    quantityInput.addEventListener('input', function() {
        const value = parseInt(this.value);
        if (isNaN(value) || value < 1) {
            this.value = 1;
        } else if (value > 99) {
            this.value = 99;
        }
        updateModalTotal();
    });

    // Confirm purchase
    modalConfirm.addEventListener('click', function() {
        if (currentProduct) {
            const quantity = parseInt(quantityInput.value);
            addToCart(currentProduct.name, currentProduct.price, quantity);
            closePurchaseModal();
        }
    });
}

function openPurchaseModal(name, price) {
    currentProduct = { name, price };
    modalProductName.textContent = name;
    modalProductPrice.textContent = price.toLocaleString();
    quantityInput.value = 1;
    updateModalTotal();
    purchaseModal.classList.add('active');
}

function closePurchaseModal() {
    purchaseModal.classList.remove('active');
    currentProduct = null;
}

function updateModalTotal() {
    if (currentProduct) {
        const quantity = parseInt(quantityInput.value);
        const total = currentProduct.price * quantity;
        modalTotal.textContent = total.toLocaleString();
    }
}

// Reservation Form
function setupReservationForm() {
    reservationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const reservation = {
            name: formData.get('name'),
            date: formData.get('date'),
            time: formData.get('time'),
            people: formData.get('people')
        };
        
        sendWhatsAppReservation(reservation);
    });
}

// Restaurant Status
function updateRestaurantStatus() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour * 60 + minute;

    // Define opening hours (in minutes from midnight)
    const openingHours = {
        0: { open: 10 * 60, close: 22 * 60 }, // Sunday: 10:00 - 22:00
        1: { open: 10 * 60, close: 23 * 60 }, // Monday: 10:00 - 23:00
        2: { open: 10 * 60, close: 23 * 60 }, // Tuesday: 10:00 - 23:00
        3: { open: 10 * 60, close: 23 * 60 }, // Wednesday: 10:00 - 23:00
        4: { open: 10 * 60, close: 23 * 60 }, // Thursday: 10:00 - 23:00
        5: { open: 10 * 60, close: 24 * 60 }, // Friday: 10:00 - 00:00
        6: { open: 10 * 60, close: 24 * 60 }  // Saturday: 10:00 - 00:00
    };

    const todayHours = openingHours[day];
    
    if (todayHours) {
        const isOpen = currentTime >= todayHours.open && currentTime < todayHours.close;
        
        if (isOpen) {
            statusDot.classList.add('open');
            statusText.textContent = 'Abierto';
        } else {
            statusDot.classList.remove('open');
            statusText.textContent = 'Cerrado';
        }
    }
}

// Payment Functions
async function sendWhatsAppOrder() {
    if (cart.length === 0) return;

    // Mostrar modal de selección de tipo de pedido
    showOrderTypeModal();
}

function showOrderTypeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Seleccionar tipo de pedido</h3>
                <button class="modal-close" onclick="closeOrderTypeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="order-type-options">
                    <button class="order-type-btn" onclick="selectOrderType('delivery')">
                        <i class="fas fa-truck"></i>
                        <h4>Delivery</h4>
                        <p>Recibir en tu domicilio</p>
                    </button>
                    <button class="order-type-btn" onclick="selectOrderType('retiro')">
                        <i class="fas fa-store"></i>
                        <h4>Retiro en Local</h4>
                        <p>Pasar a buscar al restaurante</p>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeOrderTypeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

async function selectOrderType(orderType) {
    closeOrderTypeModal();
    
    if (orderType === 'delivery') {
        showDeliveryForm();
    } else {
        showRetiroForm();
    }
}

function showDeliveryForm() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Datos para Delivery</h3>
                <button class="modal-close" onclick="closeDeliveryForm()">×</button>
            </div>
            <div class="modal-body">
                <form id="deliveryForm">
                    <div class="form-group">
                        <label>Nombre completo *</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Teléfono *</label>
                        <input type="tel" name="phone" required>
                    </div>
                    <div class="form-group">
                        <label>Dirección completa *</label>
                        <input type="text" name="address" required placeholder="Calle, número, piso, etc.">
                    </div>
                    <div class="form-group">
                        <label>Código Postal</label>
                        <input type="text" name="postalCode">
                    </div>
                    <div class="form-group">
                        <button type="button" onclick="calculateDeliveryCost()" class="btn btn-secondary">
                            Calcular costo de envío
                        </button>
                    </div>
                    <div id="deliveryCostInfo" style="display: none;">
                        <p>Costo de envío: $<span id="deliveryCost">0</span></p>
                        <p>Tiempo estimado: <span id="deliveryTime">0</span> minutos</p>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary">Continuar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('deliveryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const customerData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            postalCode: formData.get('postalCode')
        };
        
        closeDeliveryForm();
        await showPaymentMethodSelection('delivery', customerData);
    });
}

function showRetiroForm() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Datos para Retiro</h3>
                <button class="modal-close" onclick="closeRetiroForm()">×</button>
            </div>
            <div class="modal-body">
                <form id="retiroForm">
                    <div class="form-group">
                        <label>Nombre completo *</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Teléfono *</label>
                        <input type="tel" name="phone" required>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary">Continuar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('retiroForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const customerData = {
            name: formData.get('name'),
            phone: formData.get('phone')
        };
        
        closeRetiroForm();
        await showPaymentMethodSelection('retiro', customerData);
    });
}

function closeDeliveryForm() {
    const modal = document.querySelector('.modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

function closeRetiroForm() {
    const modal = document.querySelector('.modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

async function calculateDeliveryCost() {
    const address = document.querySelector('input[name="address"]').value;
    if (!address) {
        showNotification('Por favor ingrese una dirección');
        return;
    }

    try {
        const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const response = await fetch('http://localhost:3002/api/delivery/calcular-costo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                address: address,
                cartTotal: cartTotal
            })
        });

        const data = await response.json();
        
        if (data.success) {
            document.getElementById('deliveryCost').textContent = data.deliveryCost;
            document.getElementById('deliveryTime').textContent = data.estimatedTime;
            document.getElementById('deliveryCostInfo').style.display = 'block';
            
            // Guardar costo de envío para usarlo después
            window.currentDeliveryCost = data.deliveryCost;
            
            if (data.freeDelivery) {
                showNotification('¡Envío gratis por superar el mínimo!');
            }
        }
    } catch (error) {
        console.error('Error al calcular costo de envío:', error);
        showNotification('Error al calcular el costo de envío');
    }
}

async function showPaymentMethodSelection(orderType, customerData) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Seleccionar método de pago</h3>
                <button class="modal-close" onclick="closePaymentMethodModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="payment-method-options">
                    <button class="payment-method-btn" onclick="selectPaymentMethod('mercadopago')">
                        <i class="fas fa-credit-card"></i>
                        <h4>Mercado Pago</h4>
                        <p>Pagar online de forma segura</p>
                    </button>
                    <button class="payment-method-btn" onclick="selectPaymentMethod('efectivo')">
                        <i class="fas fa-money-bill"></i>
                        <h4>Efectivo</h4>
                        <p>Pagar al recibir/retirar</p>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Guardar datos del cliente y tipo de pedido
    window.currentOrderData = {
        orderType,
        customerData,
        deliveryCost: window.currentDeliveryCost || 0
    };
}

function closePaymentMethodModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

async function selectPaymentMethod(paymentMethod) {
    closePaymentMethodModal();
    
    const { orderType, customerData, deliveryCost } = window.currentOrderData;
    
    if (paymentMethod === 'mercadopago') {
        await processMercadoPagoPayment(orderType, customerData, deliveryCost);
    } else {
        await processEfectivoPayment(orderType, customerData, deliveryCost);
    }
}

async function processMercadoPagoPayment(orderType, customerData, deliveryCost) {
    try {
        showNotification('Procesando pago...');
        
        const response = await fetch('http://localhost:3002/api/mercadopago/crear-pago', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cart: cart,
                customerData: customerData,
                orderType: orderType,
                deliveryCost: deliveryCost,
                paymentMethod: 'mercadopago'
            })
        });

        const data = await response.json();
        
        if (data.success && data.paymentUrl) {
            // Limpiar carrito
            clearCart();
            
            // Redirigir a Mercado Pago
            window.location.href = data.paymentUrl;
        } else {
            showNotification('Error al procesar el pago');
        }
    } catch (error) {
        console.error('Error al procesar pago con Mercado Pago:', error);
        showNotification('Error al procesar el pago');
    }
}

async function processEfectivoPayment(orderType, customerData, deliveryCost) {
    try {
        showNotification('Registrando pedido...');
        
        const response = await fetch('http://localhost:3002/api/mercadopago/crear-pago', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cart: cart,
                customerData: customerData,
                orderType: orderType,
                deliveryCost: deliveryCost,
                paymentMethod: 'efectivo'
            })
        });

        const data = await response.json();
        
        if (data.success) {
            // Limpiar carrito
            clearCart();
            
            // Mostrar confirmación
            showOrderConfirmation(orderType, customerData, deliveryCost, data.orderId);
        } else {
            showNotification('Error al registrar el pedido');
        }
    } catch (error) {
        console.error('Error al procesar pago en efectivo:', error);
        showNotification('Error al registrar el pedido');
    }
}

function showOrderConfirmation(orderType, customerData, deliveryCost, orderId) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>¡Pedido Registrado!</h3>
            </div>
            <div class="modal-body">
                <div class="order-confirmation">
                    <i class="fas fa-check-circle" style="font-size: 48px; color: #28a745; margin-bottom: 20px;"></i>
                    <h4>Tu pedido ha sido registrado exitosamente</h4>
                    <p><strong>Número de pedido:</strong> ${orderId}</p>
                    <p><strong>Tipo:</strong> ${orderType === 'delivery' ? 'Delivery' : 'Retiro en Local'}</p>
                    <p><strong>Método de pago:</strong> Efectivo</p>
                    ${orderType === 'delivery' ? `
                        <p><strong>Costo de envío:</strong> $${deliveryCost}</p>
                        <p><strong>Dirección:</strong> ${customerData.address}</p>
                    ` : ''}
                    <p><strong>Total:</strong> $${(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + deliveryCost).toLocaleString()}</p>
                    <p style="margin-top: 20px;">Nos pondremos en contacto contigo pronto para confirmar los detalles.</p>
                    <button onclick="closeOrderConfirmation()" class="btn btn-primary" style="margin-top: 20px;">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeOrderConfirmation() {
    const modal = document.querySelector('.modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

function sendWhatsAppReservation(reservation) {
    const message = `¡Hola! Quiero hacer una reserva:\n\n` +
                   `Nombre: ${reservation.name}\n` +
                   `Fecha: ${reservation.date}\n` +
                   `Hora: ${reservation.time}\n` +
                   `Cantidad de personas: ${reservation.people}\n\n` +
                   `¿Hay disponibilidad para esta fecha y hora?`;

    const whatsappUrl = `https://wa.me/543758502801?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    reservationForm.reset();
    showNotification('Solicitud de reserva enviada por WhatsApp');
}

// Notification System
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #000;
        color: #fff;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Image Lazy Loading
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Form Validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return re.test(phone);
}

// Local Storage
function saveCartToLocalStorage() {
    localStorage.setItem('foodpanda_cart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('foodpanda_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

// Save cart to localStorage whenever it changes
const originalUpdateCart = updateCart;
updateCart = function() {
    originalUpdateCart();
    saveCartToLocalStorage();
};

// Load cart on page load
loadCartFromLocalStorage();

// Keyboard Navigation
document.addEventListener('keydown', function(e) {
    // Escape key closes modals
    if (e.key === 'Escape') {
        if (purchaseModal.classList.contains('active')) {
            closePurchaseModal();
        }
        if (cartDropdown.classList.contains('active')) {
            cartDropdown.classList.remove('active');
        }
    }
    
    // Enter key on quantity input updates total
    if (e.key === 'Enter' && document.activeElement === quantityInput) {
        updateModalTotal();
    }
});

// Touch Support for Mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - could be used for navigation
            console.log('Swipe left');
        } else {
            // Swipe right - could be used for navigation
            console.log('Swipe right');
        }
    }
}

// Performance Optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll events
const optimizedScroll = debounce(function() {
    // Scroll-related optimizations here
}, 10);

window.addEventListener('scroll', optimizedScroll);

// Analytics (placeholder)
function trackEvent(eventName, properties = {}) {
    // This would integrate with Google Analytics or similar
    console.log('Event tracked:', eventName, properties);
}

// Track button clicks
document.querySelectorAll('button, .btn').forEach(button => {
    button.addEventListener('click', function() {
        const buttonText = this.textContent.trim();
        trackEvent('button_click', { button_text: buttonText });
    });
});

// Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Could send error reports to a service
});

// Service Worker Registration (for PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Print Styles
window.addEventListener('beforeprint', function() {
    // Hide unnecessary elements for printing
    document.querySelector('.navbar').style.display = 'none';
    document.querySelector('.cart-container').style.display = 'none';
    document.querySelector('.floating-buttons').style.display = 'none';
});

window.addEventListener('afterprint', function() {
    // Restore elements after printing
    document.querySelector('.navbar').style.display = '';
    document.querySelector('.cart-container').style.display = '';
    document.querySelector('.floating-buttons').style.display = '';
});

// Accessibility
function setupAccessibility() {
    // Add ARIA labels where needed
    const cartIcon = document.getElementById('cartIcon');
    cartIcon.setAttribute('aria-label', 'Carrito de compras');
    
    // Add keyboard navigation for menu categories
    categoryBtns.forEach((btn, index) => {
        btn.setAttribute('tabindex', '0');
        btn.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

setupAccessibility();

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Food Panda website loaded successfully');
    
    // Add fade-in animation to sections
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
});
