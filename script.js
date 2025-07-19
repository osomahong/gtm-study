// 전역 변수
let cartCount = 0;
let cartItems = [];

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function () {
    initializeCart();
    initializeProductTabs();
    initializeQuantityControls();
    initializeColorOptions();
    initializeViewToggle();
    initializeAddToCart();
});

// 장바구니 초기화
function initializeCart() {
    // 로컬 스토리지에서 장바구니 데이터 불러오기
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
        cartItems = JSON.parse(savedCart);
        cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
        updateCartDisplay();
    }
}

// 장바구니 표시 업데이트
function updateCartDisplay() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = cartCount;
    });
}

// 상품 탭 기능
function initializeProductTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetTab = this.getAttribute('data-tab');

            // 모든 탭 버튼과 패널 비활성화
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // 클릭된 탭 활성화
            this.classList.add('active');
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// 수량 조절 기능
function initializeQuantityControls() {
    const quantityControls = document.querySelectorAll('.quantity-control, .cart-item-quantity');

    quantityControls.forEach(control => {
        const minusBtn = control.querySelector('.minus');
        const plusBtn = control.querySelector('.plus');
        const input = control.querySelector('.qty-input');

        if (minusBtn && plusBtn && input) {
            minusBtn.addEventListener('click', function () {
                let currentValue = parseInt(input.value);
                if (currentValue > 1) {
                    input.value = currentValue - 1;
                    updateCartItemQuantity(control, currentValue - 1);
                }
            });

            plusBtn.addEventListener('click', function () {
                let currentValue = parseInt(input.value);
                input.value = currentValue + 1;
                updateCartItemQuantity(control, currentValue + 1);
            });

            input.addEventListener('change', function () {
                let value = parseInt(this.value);
                if (value < 1) {
                    this.value = 1;
                    value = 1;
                }
                updateCartItemQuantity(control, value);
            });
        }
    });
}

// 장바구니 아이템 수량 업데이트
function updateCartItemQuantity(control, newQuantity) {
    if (control.closest('.cart-item')) {
        // 장바구니 페이지에서의 수량 변경
        updateCartSummary();
    }
    console.log('Quantity updated to:', newQuantity);
}

// 색상 옵션 선택
function initializeColorOptions() {
    const colorOptions = document.querySelectorAll('.color-option');

    colorOptions.forEach(option => {
        option.addEventListener('click', function () {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// 보기 방식 토글 (그리드/리스트) - 완전히 새로운 접근법
function initializeViewToggle() {
    // 페이지가 완전히 로드된 후에 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeViewToggle);
        return;
    }

    // 1초 후에 실행하여 모든 요소가 렌더링되기를 기다림
    setTimeout(() => {

        // 이벤트 위임 방식 사용 - document에 이벤트 리스너 추가
        document.addEventListener('click', function (e) {
            // view-btn 클래스를 가진 요소가 클릭되었는지 확인
            if (!e.target.classList.contains('view-btn')) return;

            // 메인페이지에서는 작동하지 않도록 체크
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                return;
            }

            e.preventDefault();

            // 그리드 요소 찾기 - 더 포괄적인 방법 사용
            let productsGrid = null;

            // 방법 1: 카테고리 페이지에서만 작동하도록 더 정확한 선택자들
            const selectors = [
                '.category-content div[class*="grid"][class*="gap"]',
                '.category-content div[class*="grid-cols"]',
                '.category-content .grid',
                '.category-content .products-grid',
                'div[class*="grid-cols"]', // 백업용
                '.products-grid' // 백업용
            ];

            for (let selector of selectors) {
                try {
                    productsGrid = document.querySelector(selector);
                    if (productsGrid) {
                        console.log('Found grid with selector:', selector, productsGrid);
                        break;
                    }
                } catch (err) {
                    console.log('Selector failed:', selector, err);
                }
            }

            // 방법 2: 수동으로 모든 div 검사
            if (!productsGrid) {
                console.log('Trying manual search...');
                const allDivs = document.querySelectorAll('div');
                console.log('Total divs found:', allDivs.length);

                for (let div of allDivs) {
                    const className = div.className || '';
                    console.log('Checking div:', className);

                    if (className.includes('grid') && (className.includes('gap') || className.includes('cols'))) {
                        productsGrid = div;
                        console.log('Found grid manually:', className);
                        break;
                    }
                }
            }

            if (!productsGrid) {
                console.error('Could not find products grid!');
                console.log('Available elements:');
                console.log('- .grid elements:', document.querySelectorAll('.grid'));
                console.log('- elements with grid-cols:', document.querySelectorAll('[class*="grid-cols"]'));
                console.log('- .category-content:', document.querySelector('.category-content'));
                return;
            }

            console.log('Using products grid:', productsGrid.className);

            // 모든 view 버튼에서 active 클래스 제거
            const allViewButtons = document.querySelectorAll('.view-btn');
            allViewButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            if (e.target.classList.contains('list-view')) {
                console.log('=== Switching to LIST view ===');

                // 리스트 뷰로 변경
                productsGrid.classList.remove('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4', 'gap-6');
                productsGrid.classList.add('list-layout', 'space-y-4');

                // 각 상품 카드를 리스트 형태로 변경
                const productCards = productsGrid.querySelectorAll('.group, .product-card');
                console.log('Adding list-item to', productCards.length, 'cards');
                productCards.forEach(card => {
                    card.classList.add('list-item');
                });

            } else if (e.target.classList.contains('grid-view')) {
                console.log('=== Switching to GRID view ===');

                // 그리드 뷰로 변경 - 모든 리스트 관련 클래스 제거
                productsGrid.classList.remove('list-layout', 'space-y-4', 'flex', 'flex-col');

                // 그리드 클래스들을 강제로 추가
                productsGrid.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4', 'gap-6');

                // 각 상품 카드에서 리스트 클래스 제거
                const productCards = productsGrid.querySelectorAll('.group, .product-card');
                console.log('Removing list-item from', productCards.length, 'cards');
                productCards.forEach(card => {
                    card.classList.remove('list-item');
                });

                // 강제로 스타일 재적용
                productsGrid.style.display = '';
                productsGrid.style.flexDirection = '';
            }

            console.log('Final grid classes:', productsGrid.className);
            console.log('=== View switch complete ===');
        });

    }, 1000);
}

// 장바구니 담기 기능
function initializeAddToCart() {
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            addToCart();
        });
    });
}

// 상품 이미지 경로 생성 공통 함수
function getProductImagePath() {
    // 현재 페이지 URL에서 파일명 추출
    const currentPath = window.location.pathname;
    const fileName = currentPath.split('/').pop().replace('.html', '');
    
    // 카테고리별 이미지 경로 생성
    if (currentPath.includes('/products/beauty/')) {
        return `assets/beauty/${fileName}.jpg`;
    } else if (currentPath.includes('/products/electronics/')) {
        return `assets/electronics/${fileName}.jpg`;
    } else if (currentPath.includes('/products/fashion/')) {
        return `assets/fashion/${fileName}.jpg`;
    } else if (currentPath.includes('/products/sports/')) {
        return `assets/sports/${fileName}.jpg`;
    } else if (currentPath.includes('/products/home-living/')) {
        return `assets/home-living/${fileName}.jpg`;
    } else {
        // 기존 방식으로 폴백
        return document.querySelector('.product-image img')?.src || 
               document.querySelector('.product-images img')?.src || 
               'assets/placeholder.svg';
    }
}

// 장바구니에 상품 추가
function addToCart() {
    const productName = document.querySelector('.product-info-detail h1')?.textContent || '상품';
    const productPrice = document.querySelector('.current-price')?.textContent || '₩0';
    const quantity = parseInt(document.querySelector('.product-info-detail .qty-input')?.value || 1);
    const selectedColor = document.querySelector('.color-option.active')?.getAttribute('data-color') || 'default';
    const selectedSize = document.querySelector('.size-select')?.value || 'M';
    
    // 상품 이미지 정보 추가
    const productImage = getProductImagePath();

    const cartItem = {
        id: Date.now(),
        name: productName,
        price: productPrice,
        quantity: quantity,
        color: selectedColor,
        size: selectedSize,
        image: productImage
    };

    cartItems.push(cartItem);
    cartCount += quantity;

    // 로컬 스토리지에 저장
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    updateCartDisplay();
    showAddToCartMessage();
}

// 장바구니 담기 완료 메시지
function showAddToCartMessage() {
    // 간단한 알림 메시지
    const message = document.createElement('div');
    message.className = 'cart-message';
    message.textContent = '장바구니에 상품이 추가되었습니다!';
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 3000);
}

// 바로 구매 기능
function buyNow() {
    const productName = document.querySelector('.product-info-detail h1')?.textContent || '상품';
    const productPrice = document.querySelector('.current-price')?.textContent || '₩0';
    const quantity = parseInt(document.querySelector('.product-info-detail .qty-input')?.value || 1);
    
    // 상품 이미지 정보 추가 - 공통 함수 사용
    const productImage = getProductImagePath();

    // 가격에서 숫자만 추출
    const priceNumber = parseInt(productPrice.replace(/[^\d]/g, ''));

    // 바로구매 정보를 URL 파라미터로 전달
    const params = new URLSearchParams({
        direct: 'true',
        name: productName,
        price: priceNumber,
        quantity: quantity,
        image: productImage
    });

    // 현재 페이지 경로에 따라 checkout.html 경로 결정
    const currentPath = window.location.pathname;
    let checkoutPath = 'checkout.html';

    // products 폴더 하위에 있는 경우 (2단계 위로)
    if (currentPath.includes('/products/')) {
        checkoutPath = '../../checkout.html';
    }
    // categories 폴더 하위에 있는 경우 (1단계 위로)  
    else if (currentPath.includes('/categories/')) {
        checkoutPath = '../checkout.html';
    }

    window.location.href = `${checkoutPath}?${params.toString()}`;
}

// 장바구니 아이템 제거
function removeCartItem(button) {
    const cartItem = button.closest('.cart-item');
    if (cartItem) {
        cartItem.remove();
        updateCartSummary();

        // 장바구니가 비어있으면 빈 장바구니 메시지 표시
        const remainingItems = document.querySelectorAll('.cart-item');
        if (remainingItems.length === 0) {
            showEmptyCart();
        }
    }
}

// 빈 장바구니 표시
function showEmptyCart() {
    const cartContent = document.querySelector('.cart-content');
    if (cartContent) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <h2>장바구니가 비어있습니다</h2>
                <p>쇼핑을 계속하시겠어요?</p>
                <a href="index.html" class="continue-shopping">쇼핑 계속하기</a>
            </div>
        `;
    }
}

// 장바구니 요약 업데이트
function updateCartSummary() {
    const cartItems = document.querySelectorAll('.cart-item');
    let subtotal = 0;

    cartItems.forEach(item => {
        const priceText = item.querySelector('.cart-item-price').textContent;
        const price = parseInt(priceText.replace(/[^\d]/g, ''));
        const quantity = parseInt(item.querySelector('.qty-input').value);
        subtotal += price * quantity;
    });

    const discount = 20000; // 고정 할인 금액
    const total = subtotal - discount;

    // 요약 정보 업데이트
    const summaryRows = document.querySelectorAll('.summary-row');
    summaryRows.forEach(row => {
        const label = row.querySelector('span:first-child').textContent;
        const valueSpan = row.querySelector('span:last-child');

        if (label === '상품 금액') {
            valueSpan.textContent = `₩${subtotal.toLocaleString()}`;
        } else if (label === '총 결제 금액') {
            valueSpan.textContent = `₩${total.toLocaleString()}`;
        }
    });
}

// 결제 진행 - 장바구니에서 checkout.html로 이동
function proceedToCheckout() {
    // 장바구니에 상품이 있는지 확인
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');

    if (cartItems.length === 0) {
        alert('장바구니에 상품이 없습니다.');
        return;
    }

    // checkout.html로 이동 (장바구니 모드)
    window.location.href = 'checkout.html';
}

// 결제 완료 메시지
function showPaymentSuccess() {
    const successMessage = document.createElement('div');
    successMessage.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
            text-align: center;
            flex-direction: column;
            gap: 20px;
        ">
            <div style="font-size: 48px;">✅</div>
            <h2>결제가 완료되었습니다!</h2>
            <p>주문번호: #${Date.now()}</p>
            <button onclick="this.parentElement.parentElement.remove(); window.location.href='index.html'" 
                    style="
                        padding: 12px 24px;
                        background: #e74c3c;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    ">
                쇼핑 계속하기
            </button>
        </div>
    `;

    document.body.appendChild(successMessage);

    // 장바구니 초기화
    cartItems = [];
    cartCount = 0;
    localStorage.removeItem('cartItems');
}

// 검색 기능
function performSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchTerm = searchInput.value.trim();

    if (searchTerm) {
        // 검색 결과 페이지로 이동
        const currentPath = window.location.pathname;

        // 현재 경로에 따라 search.html 경로 조정
        let searchPath;
        if (currentPath.includes('/categories/')) {
            searchPath = '../search.html';
        } else {
            searchPath = 'search.html';
        }

        window.location.href = `${searchPath}?q=${encodeURIComponent(searchTerm)}`;

    }
}

// 검색 버튼 이벤트
document.addEventListener('DOMContentLoaded', function () {
    const searchButtons = document.querySelectorAll('.search-bar button, #searchButton');
    const searchInputs = document.querySelectorAll('.search-bar input, #searchInput');

    searchButtons.forEach(button => {
        button.addEventListener('click', performSearch);
    });

    searchInputs.forEach(input => {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    });
});

// 장바구니 아이템 제거 버튼 이벤트
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('cart-item-remove')) {
        removeCartItem(e.target);
    }
});

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .grid.list-layout,
    .products-grid.list-layout {
        display: flex !important;
        flex-direction: column !important;
        gap: 16px !important;
        grid-template-columns: none !important;
    }
    
    /* 그리드 뷰 강제 적용 - 카테고리 페이지에만 적용 */
    .category-content .grid:not(.list-layout) {
        display: grid !important;
    }
    
    .category-content .grid.grid-cols-1:not(.list-layout) {
        grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
    }
    
    @media (min-width: 640px) {
        .category-content .grid.sm\\:grid-cols-2:not(.list-layout) {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
    }
    
    @media (min-width: 1024px) {
        .category-content .grid.lg\\:grid-cols-4:not(.list-layout) {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        }
    }
    
    .category-content .grid.gap-6:not(.list-layout) {
        gap: 1.5rem !important;
    }
    
    /* 그리드 뷰에서 카드 스타일 복원 - 카테고리 페이지에만 적용 */
    .category-content .grid:not(.list-layout) .group {
        width: auto !important;
    }
    
    .category-content .grid:not(.list-layout) .group > div {
        display: block !important;
        height: auto !important;
        min-height: auto !important;
    }
    
    .category-content .grid:not(.list-layout) .group .relative {
        width: auto !important;
        height: 14rem !important; /* h-56 */
    }
    
    .category-content .grid:not(.list-layout) .group .p-4 {
        padding: 1rem !important;
        height: 7rem !important; /* h-28 */
        display: block !important;
    }
    
    .category-content .grid:not(.list-layout) .px-3 {
        display: block !important;
    }
    
    .category-content .grid.list-layout .group,
    .category-content .products-grid.list-layout .group {
        width: 100%;
    }
    
    .category-content .grid.list-layout .group > div,
    .category-content .products-grid.list-layout .group > div {
        display: flex !important;
        align-items: center !important;
        height: auto !important;
        min-height: 120px !important;
        border-radius: 12px !important;
    }
    
    .category-content .grid.list-layout .group .relative,
    .category-content .products-grid.list-layout .group .relative {
        width: 160px !important;
        height: 120px !important;
        flex-shrink: 0 !important;
        border-radius: 8px !important;
    }
    
    .category-content .grid.list-layout .group .p-4,
    .category-content .products-grid.list-layout .group .p-4 {
        flex: 1 !important;
        height: auto !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        padding: 16px 20px !important;
    }
    
    .category-content .grid.list-layout .px-3,
    .category-content .products-grid.list-layout .px-3 {
        display: none !important;
    }
    
    .category-content .grid.list-layout .group .p-4 h3,
    .category-content .products-grid.list-layout .group .p-4 h3 {
        font-size: 16px !important;
        margin-bottom: 8px !important;
    }
    
    .category-content .grid.list-layout .group .p-4 .space-y-1,
    .category-content .products-grid.list-layout .group .p-4 .space-y-1 {
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        gap: 16px !important;
        flex-wrap: wrap !important;
    }
    
    .category-content .grid.list-layout .group .p-4 .space-y-1 > div,
    .category-content .products-grid.list-layout .group .p-4 .space-y-1 > div {
        margin: 0 !important;
    }
    
    .cart-btn.active {
        background: #e74c3c;
        color: white;
    }
    
    /* 리스트 뷰 추가 스타일 - 카테고리 페이지에만 적용 */
    .category-content .list-item {
        width: 100% !important;
    }
    
    .category-content .list-item > div {
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        height: auto !important;
        min-height: 140px !important;
        padding: 0 !important;
    }
    
    .category-content .list-item .relative {
        width: 180px !important;
        height: 140px !important;
        flex-shrink: 0 !important;
        margin-right: 0 !important;
    }
    
    .category-content .list-item .px-3 {
        display: none !important;
    }
    
    .category-content .list-item .p-4 {
        flex: 1 !important;
        height: auto !important;
        padding: 20px !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
    }
    
    .category-content .list-item .p-4 h3 {
        font-size: 18px !important;
        font-weight: 600 !important;
        margin-bottom: 12px !important;
        line-height: 1.4 !important;
    }
    
    .category-content .list-item .p-4 .space-y-1 {
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        gap: 20px !important;
        flex-wrap: wrap !important;
        margin-top: 8px !important;
    }
    
    .category-content .list-item .p-4 .space-y-1 > div {
        margin: 0 !important;
    }
    
    .category-content .list-item .p-4 .text-lg {
        font-size: 20px !important;
        font-weight: 700 !important;
    }
    
    .category-content .list-item .p-4 .text-sm {
        font-size: 16px !important;
    }
    
    /* 리스트 뷰에서 배지 위치 조정 - 카테고리 페이지에만 적용 */
    .category-content .list-item .absolute.top-3.left-3 {
        position: absolute !important;
        top: 12px !important;
        left: 12px !important;
        z-index: 10 !important;
    }
    
    /* 모바일에서 리스트 뷰 최적화 - 카테고리 페이지에만 적용 */
    @media (max-width: 768px) {
        .category-content .list-item > div {
            flex-direction: column !important;
            min-height: auto !important;
        }
        
        .category-content .list-item .relative {
            width: 100% !important;
            height: 200px !important;
            margin-bottom: 16px !important;
        }
        
        .category-content .list-item .p-4 {
            padding: 16px !important;
        }
        
        .category-content .list-item .p-4 .space-y-1 {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
        }
    }
`;
document.head.appendChild(style);

// 현대적인 인터랙티브 효과들

// 스크롤 애니메이션
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);

    // 애니메이션 대상 요소들 관찰
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// 카드 호버 시 3D 효과
function init3DCardEffects() {
    const cards = document.querySelectorAll('.product-card, .promo-card, .category-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
}

// 부드러운 스크롤
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 검색창 포커스 효과
function initSearchEffects() {
    const searchInput = document.querySelector('.search-bar input');
    const searchContainer = document.querySelector('.search-bar');

    if (searchInput && searchContainer) {
        searchInput.addEventListener('focus', () => {
            searchContainer.classList.add('focused');
        });

        searchInput.addEventListener('blur', () => {
            searchContainer.classList.remove('focused');
        });
    }
}

// 장바구니 카운트 애니메이션
function animateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => {
            cartCount.style.animation = '';
        }, 500);
    }
}

// 클릭 리플 효과
function initRippleEffect() {
    const buttons = document.querySelectorAll('.cta-btn, .login-btn, .cart-btn');

    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// 헤더 스크롤 효과
function initHeaderScrollEffect() {
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(20px)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }

        lastScrollY = currentScrollY;
    });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function () {
    initScrollAnimations();
    init3DCardEffects();
    initSmoothScroll();
    initSearchEffects();
    initRippleEffect();
    initHeaderScrollEffect();

    // 페이지 로드 애니메이션
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        document.body.style.opacity = '1';
    }, 100);
});

// 리사이즈 이벤트 최적화
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // 리사이즈 후 처리할 작업들
        init3DCardEffects();
    }, 250);
});

// 일일 특가 타이머 (간단한 버전)
function initDailyDealTimer() {
    const timerDisplay = document.getElementById('timer-display');

    if (!timerDisplay) return;

    // 10시간 16분 30초부터 시작 (데모용으로 계속 반복)
    let totalSeconds = 10 * 3600 + 16 * 60 + 30; // 10:16:30

    function updateTimer() {
        totalSeconds--;

        // 시간이 0이 되면 다시 리셋 (데모용)
        if (totalSeconds <= 0) {
            totalSeconds = 10 * 3600 + 16 * 60 + 30;
        }

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        // 시:분:초 형식으로 표시
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerDisplay.textContent = timeString;

        // 숫자가 바뀔 때 살짝 애니메이션
        timerDisplay.style.transform = 'scale(1.02)';
        setTimeout(() => {
            timerDisplay.style.transform = 'scale(1)';
        }, 100);
    }

    // 1초마다 업데이트
    setInterval(updateTimer, 1000);
}

// 특가 상품 수량 애니메이션
function initQuantityAnimation() {
    const quantityElements = document.querySelectorAll('.text-red-500');

    quantityElements.forEach(el => {
        if (el.textContent.includes('개')) {
            // 랜덤하게 수량이 줄어드는 효과 (데모용)
            setInterval(() => {
                if (Math.random() < 0.1) { // 10% 확률로 수량 감소
                    const currentNum = parseInt(el.textContent);
                    if (currentNum > 1) {
                        el.textContent = (currentNum - 1) + '개';

                        // 수량 변경 애니메이션
                        el.style.color = '#ef4444';
                        el.style.transform = 'scale(1.2)';
                        el.style.fontWeight = 'bold';

                        setTimeout(() => {
                            el.style.transform = 'scale(1)';
                        }, 200);

                        // 수량이 적어지면 색상 변경
                        if (currentNum - 1 <= 5) {
                            el.style.color = '#dc2626';
                            el.classList.add('animate-pulse');
                        }
                    }
                }
            }, 3000); // 3초마다 체크
        }
    });
}

// 배지 애니메이션 강화
function enhanceBadgeAnimations() {
    const badges = document.querySelectorAll('.animate-pulse');

    badges.forEach((badge, index) => {
        // 각 배지마다 다른 딜레이로 펄스 효과
        badge.style.animationDelay = `${index * 0.2}s`;

        // 호버 시 추가 효과
        badge.addEventListener('mouseenter', () => {
            badge.style.transform = 'scale(1.1) rotate(5deg)';
            badge.style.transition = 'all 0.3s ease';
        });

        badge.addEventListener('mouseleave', () => {
            badge.style.transform = 'scale(1) rotate(0deg)';
        });
    });
}

// 스크롤 애니메이션 제거됨

// 페이지 로드 시 모든 기능 초기화
document.addEventListener('DOMContentLoaded', function () {
    // 기존 함수들
    init3DCardEffects();
    initSmoothScroll();
    initSearchEffects();
    initRippleEffect();
    initHeaderScrollEffect();

    // 새로운 특가 관련 함수들
    initDailyDealTimer();
    initQuantityAnimation();
    enhanceBadgeAnimations();

    // 페이지 로드 애니메이션
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        document.body.style.opacity = '1';
    }, 100);

    console.log('🔥 CatShop 일일 특가 시스템 활성화!');
});