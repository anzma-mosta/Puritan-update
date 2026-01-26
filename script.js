// Search Page Logic
function initSearchPage() {
    const queryDisplay = document.getElementById('search-query-display');
    if (!queryDisplay) return;

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');

    if (query) {
        queryDisplay.innerText = `"${query}"`;
        
        // Update results count text
        const resultsCount = document.querySelector('.results-count');
        if (resultsCount) {
            // Randomize a bit for demo purposes
            const count = Math.floor(Math.random() * 20) + 5;
            resultsCount.innerText = `عرض 1-${Math.min(count, 12)} من أصل ${count} نتيجة لـ "${query}"`;
        }
    } else {
        queryDisplay.innerText = "كل المنتجات";
    }
}

// Initialize Sliders with a small delay to ensure layout is ready
window.addEventListener('load', function() {
    updateAuthState(); // Update UI based on login status
    initSearchPage(); // Handle search query display
    
    if (document.querySelector('#categories-slider')) {
        new Splide('#categories-slider', {
            type: 'loop',
            perPage: 6,
            perMove: 1,
            gap: '20px',
            pagination: false,
            arrows: true,
            direction: 'rtl',
            autoWidth: false,
            breakpoints: {
                1200: {
                    perPage: 4
                },
                992: {
                    perPage: 3
                },
                768: {
                    perPage: 2
                },
                480: {
                    perPage: 1
                }
            }
        }).mount();
    }

    if (document.querySelector('#hero-slider')) {
        new Splide('#hero-slider', {
            type: 'loop',
            direction: 'rtl',
            arrows: true,
            pagination: true,
            autoplay: true,
            interval: 5000,
            speed: 800,
            height: '460px',
            cover: true,
            autoWidth: false,
            breakpoints: {
                992: {
                    height: '380px',
                },
                640: {
                    height: '200px',
                },
            }
        }).mount();
    }
});

// SweetAlert Toast Configuration
const Toast = window.Swal ?
    Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        showClass: {
            popup: 'animate__animated animate__fadeInRight animate__faster'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutRight animate__faster'
        },
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    }) : {
        fire: ({
            title,
            text
        }) => {
            // Fallback for pages that don't load SweetAlert2
            if (title || text) console.log('[Toast]', title || '', text || '');
        }
    };

// Cart Logic
let cart = JSON.parse(localStorage.getItem('cart')) || [];
updateCartUI();

window.toggleCart = function(show = true) {
    const sideCart = document.getElementById('side-cart');
    const cartOverlay = document.getElementById('cartOverlay');
    if (!sideCart || !cartOverlay) return; // Prevent errors if elements not found

    if (show) {
        sideCart.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateCartUI(); // Ensure UI is fresh when opening
    } else {
        sideCart.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

const closeCartBtn = document.getElementById('closeCart');
const cartOverlayBtn = document.getElementById('cartOverlay');
if (closeCartBtn) closeCartBtn.addEventListener('click', () => window.toggleCart(false));
if (cartOverlayBtn) cartOverlayBtn.addEventListener('click', () => window.toggleCart(false));

window.addToCart = function(product) {
    const existingItem = cart.find(item => item.name === product.name);
    const qtyToAdd = Math.max(1, parseInt(product.quantity, 10) || 1);
    if (existingItem) {
        existingItem.quantity += qtyToAdd;
    } else {
        cart.push({
            ...product,
            quantity: qtyToAdd
        });
    }
    saveCart();
    updateCartUI();
    window.toggleCart(true);
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    const container = document.getElementById('cart-items-container');
    const totalAmount = document.getElementById('cart-total-amount');
    const cartCounts = document.querySelectorAll('.cart-count');

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <i class="fa-solid fa-cart-shopping" aria-hidden="true"></i>
                <p>سلة المشتريات فارغة</p>
            </div>
        `;
        if (totalAmount) totalAmount.innerText = '0 ج.م';
        cartCounts.forEach(el => el.innerText = '0');
        return;
    }

    let html = '';
    let total = 0;
    let count = 0;

    cart.forEach((item, index) => {
        const priceNum = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
        total += priceNum * item.quantity;
        count += item.quantity;

        html += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <span class="cart-item-title">${item.name}</span>
                    <div class="cart-item-row">
                        <span class="cart-item-price">${item.price}</span>
                        <div class="cart-qty" aria-label="الكمية">
                            <button type="button" onclick="updateQuantity(${index}, -1)" class="cart-qty-btn" aria-label="تقليل">-</button>
                            <span class="cart-qty-value" aria-label="العدد">${item.quantity}</span>
                            <button type="button" onclick="updateQuantity(${index}, 1)" class="cart-qty-btn" aria-label="زيادة">+</button>
                        </div>
                    </div>
                </div>
                <button type="button" onclick="removeFromCart(${index})" class="cart-remove-btn" aria-label="حذف المنتج">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
    });

    container.innerHTML = html;
    if (totalAmount) totalAmount.innerText = `${total} ج.م`;
    cartCounts.forEach(el => el.innerText = count);
}

window.updateQuantity = function(index, change) {
    if (!cart[index]) return;
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
};

window.removeFromCart = function(index) {
    if (!cart[index]) return;
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
};

window.addToWishlist = function(productName = "المنتج") {
    Toast.fire({
        icon: 'info',
        title: 'تمت الإضافة للمفضلة!',
        text: `تم إضافة ${productName} إلى قائمة أمنياتك`
    });
}

window.addToCompare = function(productName = "المنتج") {
    Toast.fire({
        icon: 'info',
        title: 'تمت الإضافة للمقارنة!',
        text: `تم إضافة ${productName} إلى قائمة المقارنة`
    });
}

// Newsletter Subscription (supports either <form> or input+button)
document.querySelectorAll('.newsletter-box').forEach((box) => {
    const form = box.querySelector('form');
    const input = box.querySelector('input');
    const btn = box.querySelector('button');

    const submit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const email = input ? input.value.trim() : '';
        if (!email) return;

        Toast.fire({
            icon: 'success',
            title: 'شكراً لاشتراكك!',
            text: 'ستصلك أحدث العروض والمقالات قريباً'
        });

        if (form) {
            form.reset();
        } else if (input) {
            input.value = '';
        }
    };

    if (form) form.addEventListener('submit', submit);
    else if (btn) btn.addEventListener('click', submit);
});

// Search Form
document.querySelectorAll('.search-form').forEach(form => {
    form.addEventListener('submit', function(e) {
        const input = this.querySelector('input');
        const query = input ? input.value.trim() : '';
        if (!query) {
            e.preventDefault();
            return;
        }
        if (Toast && typeof Toast.fire === 'function') {
            Toast.fire({
                icon: 'info',
                title: 'البحث',
                text: `جاري البحث عن: ${query}...`,
                timer: 1500
            });
        }
    });
});

// Auth State Management
function updateAuthState() {
    const authLinks = document.querySelector('.auth-links');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (authLinks) {
        if (isLoggedIn && currentUser) {
            authLinks.innerHTML = `
                <span style="color: #98c628; font-weight: 700;">مرحباً، ${currentUser.fullName}</span>
                <a href="#" onclick="logout()" style="margin-right: 15px; color: #fff; background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 4px;">خروج</a>
            `;
        } else {
            authLinks.innerHTML = `
                <a href="login.html">دخول</a> / <a href="register.html">تسجيل جديد</a>
            `;
        }
    }
}

window.logout = function() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    
    if (window.Swal) {
        Swal.fire({
            icon: 'info',
            title: 'تم تسجيل الخروج',
            text: 'نراك قريباً في بيوريتان',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            window.location.reload();
        });
    } else {
        window.location.reload();
    }
}

// Global click handler for products and actions
document.addEventListener('click', function(e) {
    // Handle Cart Click
    const cartBtn = e.target.closest('.header-cart');
    if (cartBtn) {
        e.preventDefault();
        toggleCart(true);
        return;
    }

    // Handle Add to Cart
    const addToCartBtn = e.target.closest('.action-btn, .add-to-cart-btn, .add-to-cart');
    const isCartAction = addToCartBtn && (
        addToCartBtn.classList.contains('add-to-cart-btn') ||
        addToCartBtn.classList.contains('add-to-cart') ||
        addToCartBtn.querySelector('.fa-cart-shopping')
    );

    if (isCartAction) {
        e.preventDefault();
        e.stopPropagation();
        let title = "المنتج";
        let price = "0 ج.م";
        let image = "";
        let quantity = 1;

        // Product detail page button
        if (addToCartBtn.classList.contains('add-to-cart-btn') || addToCartBtn.classList.contains('add-to-cart')) {
            title = document.querySelector('.product-title-main')?.innerText ||
                document.querySelector('.product-title-detail')?.innerText ||
                title;
            price = document.querySelector('.current-price-main')?.innerText ||
                document.querySelector('.current-price')?.innerText ||
                price;
            image = document.getElementById('mainImg')?.src ||
                document.querySelector('.main-image img')?.src ||
                image;
            quantity = parseInt(document.querySelector('.qty-input')?.value, 10) || 1;
        } else {
            // Cards (search/home/related)
            const card = addToCartBtn.closest('.product-card') || addToCartBtn.closest('.deal-card');
            title = card?.querySelector('.product-name')?.innerText || card?.querySelector('.product-title')?.innerText || title;
            price = card?.querySelector('.current-price')?.innerText || card?.querySelector('.product-price')?.innerText || price;
            image = card?.querySelector('img')?.src || image;
            quantity = 1;
        }

        addToCart({
            name: title,
            price: price,
            image: image,
            quantity: quantity
        });
        return;
    }

    // Handle Product Card Click
    const productCard = e.target.closest('.product-card') || e.target.closest('.deal-card');
    if (productCard) {
        // If it's a link or button inside the card, let it handle itself
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
            return;
        }
        window.location.href = 'product.html';
    }
});

// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const menuOverlay = document.getElementById('menuOverlay');
const closeMenu = document.getElementById('closeMenu');

function toggleMenu() {
    if (mobileMenu && menuOverlay) {
        mobileMenu.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }
}

if (hamburger) hamburger.addEventListener('click', toggleMenu);
if (closeMenu) closeMenu.addEventListener('click', toggleMenu);
if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);

// Product page helpers (gallery/tabs/quantity) - only activates if elements exist
document.addEventListener('DOMContentLoaded', function() {
    // Gallery thumbnails
    const mainImg = document.getElementById('mainImg');
    const thumbs = document.querySelectorAll('.thumb-item[data-src]');
    if (mainImg && thumbs.length) {
        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const src = thumb.getAttribute('data-src');
                if (src) mainImg.src = src;
                thumbs.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });
    }

    // Product tabs (desc/specs/reviews)
    const tabTriggers = document.querySelectorAll('.tab-trigger[data-tab]');
    if (tabTriggers.length) {
        tabTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const tabId = trigger.getAttribute('data-tab');
                if (!tabId) return;
                document.querySelectorAll('.tab-trigger').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                trigger.classList.add('active');
                document.getElementById(tabId)?.classList.add('active');
            });
        });
    }

    // Quantity controls
    const qtyInput = document.querySelector('.qty-input');
    const plusBtn = document.querySelector('.qty-btn.plus');
    const minusBtn = document.querySelector('.qty-btn.minus');
    if (qtyInput && plusBtn && minusBtn) {
        plusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const val = parseInt(qtyInput.value, 10) || 1;
            qtyInput.value = String(val + 1);
        });
        minusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const val = parseInt(qtyInput.value, 10) || 1;
            qtyInput.value = String(Math.max(1, val - 1));
        });
    }
});

// Tab Functionality
window.openTab = function(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    tablinks = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    const targetTab = document.getElementById(tabName);
    if (targetTab) targetTab.classList.add("active");
    if (evt && evt.currentTarget) evt.currentTarget.classList.add("active");
}

// Sales notification logic
window.showNotify = function() {
    const products = [{
            name: "لايف إيزي بروتين السكري - إدارة السكر",
            city: "أحمد (القاهرة)",
            time: "منذ 35 دقيقة",
            img: "22-100x100.jpg"
        },
        {
            name: "إم كافيين زبدة الجسم بالترطيب العميق",
            city: "شخص ما",
            time: "منذ 4 ساعات",
            img: "23-100x100.jpg"
        },
        {
            name: "هيمالايا لوشن جسم للأطفال 400 مل عبوة من 2",
            city: "سارة (الإسكندرية)",
            time: "منذ 3 ساعات",
            img: "24-100x100.jpg"
        },
        {
            name: "نيونيك مقياس التأكسج النبضي بطرف الإصبع مع صوت",
            city: "ليلى (الجيزة)",
            time: "منذ 3 ساعات",
            img: "19-100x100.jpg"
        }
    ];

    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const notify = document.getElementById('sales-notify');

    if (notify) {
        const b = notify.querySelector('b');
        if (b) b.innerText = `شخص ما في ${randomProduct.city} اشترى`;

        const productNameSpan = notify.querySelector('.sales-content span');
        if (productNameSpan) productNameSpan.innerText = randomProduct.name;

        const timeSmall = notify.querySelector('small');
        if (timeSmall) timeSmall.innerText = randomProduct.time;

        const productImg = notify.querySelector('img');
        if (productImg) productImg.src = `https://wordpressthemes.live/WCG10/WCM230_healthmart/medicine04/wp-content/uploads/2023/10/${randomProduct.img}`;

        notify.classList.add('show');
        setTimeout(() => {
            window.closeNotify();
        }, 6000);
    }
}

window.closeNotify = function() {
    const notify = document.getElementById('sales-notify');
    if (notify) notify.classList.remove('show');
}

// Back to Top Logic
window.addEventListener('scroll', function() {
    const btn = document.getElementById("backToTop");
    if (btn) {
        if (window.scrollY > 300 || document.documentElement.scrollTop > 300) {
            btn.classList.add("show");
        } else {
            btn.classList.remove("show");
        }
    }
});

window.scrollToTop = function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show notification after 3 seconds
setTimeout(window.showNotify, 3000);

// Show again every 20 seconds
setInterval(window.showNotify, 20000);

// Scroll Reveal Animation with Intersection Observer
const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
};

const revealObserver = new IntersectionObserver(revealCallback, {
    threshold: 0.15
});

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.reveal, .reveal-scale').forEach(el => {
        revealObserver.observe(el);
    });

    // Checkout Page Logic
    const shipToDifferentCheckbox = document.getElementById('shipToDifferentAddress');
    const differentAddressForm = document.getElementById('differentAddressForm');

    if (shipToDifferentCheckbox && differentAddressForm) {
        shipToDifferentCheckbox.addEventListener('change', function() {
            if (this.checked) {
                differentAddressForm.style.display = 'block';
                differentAddressForm.classList.add('animate__animated', 'animate__fadeIn');
            } else {
                differentAddressForm.style.display = 'none';
            }
        });
    }

    // Payment Method Selection
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });
});