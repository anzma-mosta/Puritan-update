// Initialize Sliders with a small delay to ensure layout is ready
window.addEventListener('load', function () {
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
                1200: { perPage: 4 },
                992: { perPage: 3 },
                768: { perPage: 2 },
                480: { perPage: 1 }
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
const Toast = Swal.mixin({
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
});

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
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
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
    const cartCount = document.querySelector('.cart-count');

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-10">
                <i class="fa-solid fa-cart-shopping text-4xl text-gray-200 mb-4"></i>
                <p class="text-gray-500">سلة المشتريات فارغة</p>
            </div>
        `;
        if (totalAmount) totalAmount.innerText = '0 ج.م';
        if (cartCount) cartCount.innerText = '0';
        return;
    }

    let html = '';
    let total = 0;
    let count = 0;

    cart.forEach((item, index) => {
        const priceNum = parseInt(item.price.replace(/[^\d]/g, ''));
        total += priceNum * item.quantity;
        count += item.quantity;

        html += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <span class="cart-item-title">${item.name}</span>
                    <div class="flex justify-between items-center mt-2">
                        <span class="cart-item-price">${item.price}</span>
                        <div class="flex items-center gap-2">
                            <button onclick="updateQuantity(${index}, -1)" class="w-6 h-6 rounded-full border flex items-center justify-center">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateQuantity(${index}, 1)" class="w-6 h-6 rounded-full border flex items-center justify-center">+</button>
                        </div>
                    </div>
                </div>
                <button onclick="removeFromCart(${index})" class="text-gray-400 hover:text-red-500">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
    });

    container.innerHTML = html;
    if (totalAmount) totalAmount.innerText = `${total} ج.م`;
    if (cartCount) cartCount.innerText = count;
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

// Newsletter Subscription
document.querySelector('.newsletter-box form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input').value;
    if (email) {
        Toast.fire({
            icon: 'success',
            title: 'شكراً لاشتراكك!',
            text: 'ستصلك أحدث العروض والمقالات قريباً'
        });
        this.reset();
    }
});

// Search Form
document.querySelectorAll('.search-form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = this.querySelector('input').value;
        if (query) {
            Toast.fire({
                icon: 'info',
                title: 'البحث',
                text: `جاري البحث عن: ${query}...`,
                timer: 1500
            });
        }
    });
});

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
    const addToCartBtn = e.target.closest('.action-btn');
    const isCartAction = addToCartBtn && (addToCartBtn.querySelector('.fa-cart-shopping') || addToCartBtn.classList.contains('add-to-cart-btn'));
    
    if (isCartAction) {
        e.preventDefault();
        e.stopPropagation();
        const card = addToCartBtn.closest('.product-card') || addToCartBtn.closest('.deal-card') || addToCartBtn.closest('.product-detail-container');
        const title = card?.querySelector('.product-name')?.innerText || card?.querySelector('.product-title')?.innerText || "المنتج";
        const price = card?.querySelector('.current-price')?.innerText || card?.querySelector('.product-price')?.innerText || "0 ج.م";
        const image = card?.querySelector('img')?.src || "";
        
        addToCart({
            name: title,
            price: price,
            image: image
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
    const products = [
        { name: "لايف إيزي بروتين السكري - إدارة السكر", city: "أحمد (القاهرة)", time: "منذ 35 دقيقة", img: "22-100x100.jpg" },
        { name: "إم كافيين زبدة الجسم بالترطيب العميق", city: "شخص ما", time: "منذ 4 ساعات", img: "23-100x100.jpg" },
        { name: "هيمالايا لوشن جسم للأطفال 400 مل عبوة من 2", city: "سارة (الإسكندرية)", time: "منذ 3 ساعات", img: "24-100x100.jpg" },
        { name: "نيونيك مقياس التأكسج النبضي بطرف الإصبع مع صوت", city: "ليلى (الجيزة)", time: "منذ 3 ساعات", img: "19-100x100.jpg" }
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
window.onscroll = function () {
    const btn = document.getElementById("backToTop");
    if (btn) {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            btn.classList.add("show");
        } else {
            btn.classList.remove("show");
        }
    }
};

window.scrollToTop = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

document.querySelectorAll('.reveal, .reveal-scale').forEach(el => {
    revealObserver.observe(el);
});
