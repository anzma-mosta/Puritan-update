document.addEventListener('DOMContentLoaded', () => {
    // --- Helper Functions ---
    const notify = (title, text, icon = 'success') => {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            },
            showClass: {
                popup: 'animate__animated animate__fadeInRight animate__faster'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutRight animate__faster'
            },
            customClass: {
                popup: 'butterfly-toast p-4',
                title: 'playfair font-bold text-lg text-gray-800',
                htmlContainer: 'text-gray-500 text-sm font-medium'
            }
        });

        Toast.fire({
            icon: icon,
            title: title,
            text: text
        });
    };

    const safeAddListener = (selector, event, callback) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (el) el.addEventListener(event, callback);
        });
    };

    const safeIdListener = (id, event, callback) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, callback);
    };

    // --- UI State Management ---
    const toggleModal = (modalId, show) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        if (show) {
            modal.classList.remove('invisible', 'opacity-0');
            document.body.style.overflow = 'hidden';
        } else {
            modal.classList.add('invisible', 'opacity-0');
            document.body.style.overflow = 'auto';
        }
    };

    const toggleSidePanel = (panelId, overlayId, show) => {
        const panel = document.getElementById(panelId);
        const overlay = document.getElementById(overlayId);
        if (!panel || !overlay) return;
        if (show) {
            panel.classList.remove('translate-x-full');
            overlay.classList.remove('invisible', 'opacity-0');
            document.body.style.overflow = 'hidden';
        } else {
            panel.classList.add('translate-x-full');
            overlay.classList.add('invisible', 'opacity-0');
            document.body.style.overflow = 'auto';
        }
    };

    // --- Modals & Panels ---
    safeIdListener('search-trigger', 'click', (e) => { e.preventDefault(); toggleModal('search-modal', true); });
    safeIdListener('close-search', 'click', () => toggleModal('search-modal', false));
    safeIdListener('search-modal', 'click', (e) => { if (e.target.id === 'search-modal') toggleModal('search-modal', false); });

    safeIdListener('cart-trigger', 'click', (e) => { e.preventDefault(); toggleSidePanel('side-cart', 'cart-overlay', true); });
    safeIdListener('close-cart', 'click', () => toggleSidePanel('side-cart', 'cart-overlay', false));
    safeIdListener('cart-overlay', 'click', () => toggleSidePanel('side-cart', 'cart-overlay', false));

    safeIdListener('close-quick-view', 'click', () => toggleModal('quick-view-modal', false));
    safeIdListener('quick-view-modal', 'click', (e) => { if (e.target.id === 'quick-view-modal') toggleModal('quick-view-modal', false); });

    // --- Sticky Header ---
    const navBar = document.querySelector('nav');
    if (navBar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 150) {
                navBar.classList.add('shadow-xl', 'bg-white/95', 'backdrop-blur-md');
            } else {
                navBar.classList.remove('shadow-xl', 'bg-white/95', 'backdrop-blur-md');
            }
        });
    }

    // --- Countdown Logic ---
    const initCountdowns = () => {
        const countdowns = document.querySelectorAll('[data-expire]');
        
        countdowns.forEach(el => {
            const expireDateStr = el.getAttribute('data-expire');
            const expireDate = new Date(expireDateStr).getTime();
            
            const update = () => {
                const now = new Date().getTime();
                const diff = expireDate - now;
                
                if (diff <= 0) {
                    el.innerHTML = '<p class="text-primary font-bold text-center w-full">انتهى العرض!</p>';
                    return;
                }
                
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                
                const dEl = el.querySelector('.days');
                const hEl = el.querySelector('.hours');
                const mEl = el.querySelector('.minutes');
                const sEl = el.querySelector('.seconds');
                
                if (dEl) dEl.innerText = days < 10 ? '0' + days : days;
                if (hEl) hEl.innerText = hours < 10 ? '0' + hours : hours;
                if (mEl) mEl.innerText = minutes < 10 ? '0' + minutes : minutes;
                if (sEl) sEl.innerText = seconds < 10 ? '0' + seconds : seconds;
            };
            
            update();
            setInterval(update, 1000);
        });
    };

    initCountdowns();

    // --- Product Card Animations ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.product-card').forEach(card => observer.observe(card));

    // Add to Cart
    document.querySelectorAll('button:has(.fa-shopping-cart), .product-card button:has(.fa-shopping-cart)').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.product-card');
            const title = card?.querySelector('h3')?.innerText || 'المنتج';
            const price = card?.querySelector('.text-primary')?.innerText || '';
            const img = card?.querySelector('img')?.src;
            
            Swal.fire({
                title: 'جاري الإضافة للسلة...',
                html: `
                    <div class="flex items-center space-x-4 space-x-reverse text-right p-4">
                        <img src="${img}" class="w-16 h-16 rounded-lg object-cover shadow-sm">
                        <div>
                            <p class="font-bold text-gray-800">${title}</p>
                            <p class="text-primary font-bold">${price}</p>
                        </div>
                    </div>
                `,
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                customClass: {
                    popup: 'rounded-[2.5rem] p-2 overflow-hidden',
                    timerProgressBar: 'bg-primary'
                },
                showClass: { popup: 'animate__animated animate__fadeInUp animate__faster' },
                hideClass: { popup: 'animate__animated animate__fadeOutDown animate__faster' }
            }).then(() => {
                notify('تمت الإضافة!', `تم إضافة "${title}" إلى سلة التسوق بنجاح.`, 'success');
                // Update cart count (sample action)
                const cartBadge = document.querySelector('#cart-trigger span');
                if (cartBadge) {
                    let count = parseInt(cartBadge.innerText) || 0;
                    cartBadge.innerText = count + 1;
                    cartBadge.classList.add('animate-bounce');
                    setTimeout(() => cartBadge.classList.remove('animate-bounce'), 1000);
                }
            });
        });
    });

    // Wishlist
    document.querySelectorAll('button:has(.fa-heart)').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const icon = btn.querySelector('i');
            const isLiked = icon.classList.contains('fas');
            
            if (isLiked) {
                icon.classList.replace('fas', 'far');
                icon.classList.remove('text-red-500');
                notify('تمت الإزالة', 'تم إزالة المنتج من قائمة المفضلة.', 'info');
            } else {
                icon.classList.replace('far', 'fas');
                icon.classList.add('text-red-500');
                notify('تمت الإضافة', 'تم إضافة المنتج إلى قائمة المفضلة بنجاح.');
            }
        });
    });

    // Quick View
    document.querySelectorAll('button:has(.fa-eye)').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.product-card');
            const title = card?.querySelector('h3')?.innerText || 'المنتج';
            const img = card?.querySelector('img')?.src;
            
            // Update quick view modal content (sample)
            const modal = document.getElementById('quick-view-modal');
            if (modal) {
                const modalTitle = modal.querySelector('h3');
                const modalImg = modal.querySelector('img');
                if (modalTitle) modalTitle.innerText = title;
                if (modalImg) modalImg.src = img;
            }
            
            toggleModal('quick-view-modal', true);
        });
    });

    // Search Action
    const searchInput = document.querySelector('#search-modal input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value;
                if (query) {
                    toggleModal('search-modal', false);
                    notify('جاري البحث', `نتائج البحث عن: "${query}"`, 'info');
                }
            }
        });
    }

    // Newsletter
    const newsletterForm = document.querySelector('section.bg-primary form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input')?.value;
            if (email) {
                Swal.fire({
                    title: 'تم الاشتراك بنجاح!',
                    text: 'شكراً لاشتراكك في نشرتنا الإخبارية. ستصلك أفضل العروض الحصرية قريباً.',
                    icon: 'success',
                    showConfirmButton: true,
                    confirmButtonText: 'حسناً',
                    confirmButtonColor: '#ff69b4',
                    customClass: {
                        popup: 'rounded-[3rem] p-8',
                        title: 'playfair text-2xl font-bold',
                        confirmButton: 'rounded-full px-8 py-3'
                    },
                    showClass: { popup: 'animate__animated animate__zoomIn animate__faster' },
                    hideClass: { popup: 'animate__animated animate__zoomOut animate__faster' }
                });
                newsletterForm.reset();
            }
        });
    }

    // General "Soon" for empty links
    document.querySelectorAll('a[href="#"]').forEach(link => {
        if (!link.classList.contains('filter-tab') && !link.id && !link.dataset.filter && !link.closest('.product-card')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                notify('قريباً', 'هذه الصفحة ستكون متاحة قريباً في النسخة الكاملة.', 'info');
            });
        }
    });

    // --- Best Sellers Filter ---
    const filterTabs = document.querySelectorAll('.filter-tab');
    const bestsellerCards = document.querySelectorAll('#bestsellers-grid .product-card');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const filter = tab.getAttribute('data-filter');
            
            // Update active tab UI
            filterTabs.forEach(t => {
                t.classList.remove('bg-primary', 'text-white', 'active');
                t.classList.add('bg-gray-100', 'text-gray-600');
            });
            tab.classList.add('bg-primary', 'text-white', 'active');
            tab.classList.remove('bg-gray-100', 'text-gray-600');

            // Filter products
            bestsellerCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = '';
                    card.classList.add('animate__animated', 'animate__fadeIn');
                } else {
                    card.style.display = 'none';
                    card.classList.remove('animate__animated', 'animate__fadeIn');
                }
            });
        });
    });

    // --- New Arrivals Filter ---
    const newArrivalsTabs = document.querySelectorAll('.filter-tab-new');
    const newArrivalsCards = document.querySelectorAll('#new-arrivals-grid .product-card');

    newArrivalsTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const filter = tab.getAttribute('data-filter');
            
            // Update active tab UI
            newArrivalsTabs.forEach(t => {
                t.classList.remove('bg-primary', 'text-white', 'active');
                t.classList.add('bg-gray-100', 'text-gray-600');
            });
            tab.classList.add('bg-primary', 'text-white', 'active');
            tab.classList.remove('bg-gray-100', 'text-gray-600');

            // Filter products
            newArrivalsCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = '';
                    card.classList.add('animate__animated', 'animate__fadeIn');
                } else {
                    card.style.display = 'none';
                    card.classList.remove('animate__animated', 'animate__fadeIn');
                }
            });
        });
    });
});