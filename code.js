// Ждем полной загрузки DOM-дерева
document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================================
    // ДОБАВЛЕНИЕ СТИЛЕЙ АНИМАЦИИ НА ЛЕТУ
    // =========================================================
    const animationStyles = document.createElement('style');
    animationStyles.innerHTML = `
        /* Стили для плавного появления при скролле (Scroll Reveal) */
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .animate-on-scroll.is-visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Стили для интерактивных пузырьков на весь экран */
        #bubbles-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 0; /* Находятся позади контента */
            pointer-events: none; /* Чтобы не мешали кликать по кнопкам */
            overflow: hidden;
        }

        /* Поднимаем контент секций, чтобы он был поверх пузырьков */
        main section, header, footer {
            position: relative;
            z-index: 1; 
        }

        /* Делаем фоны секций чуть прозрачными, чтобы пузырьки просвечивали */
        .section-bg {
            background-color: rgba(249, 247, 243, 0.85) !important;
        }
        body {
            background-color: rgba(255, 255, 255, 0.95);
        }

        .magic-bubble {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            /* Усиленная видимость и легкое свечение */
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            /* Базовая анимация плавания (увеличен размах) */
            animation: floatBubble 10s infinite ease-in-out alternate;
            /* Плавный переход для реакции на мышку */
            transition: transform 0.2s ease-out;
        }
        
        @keyframes floatBubble {
            0% { top: var(--startY); left: var(--startX); transform: scale(1); opacity: 0.4; }
            50% { top: calc(var(--startY) - 60px); left: calc(var(--startX) + 40px); transform: scale(1.15); opacity: 0.7; }
            100% { top: calc(var(--startY) + 20px); left: calc(var(--startX) - 50px); transform: scale(0.9); opacity: 0.4; }
        }
        
        /* Интерактивность статистики */
        .stat-num { transition: transform 0.3s ease; }
        .stat-num:hover { transform: scale(1.1) rotate(-3deg); color: #d67a35; }
    `;
    document.head.appendChild(animationStyles);

    // =========================================================
    // 1. БАЗОВЫЙ ФУНКЦИОНАЛ
    // =========================================================
    
    // Тень для шапки при скролле
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
            header.style.backgroundColor = '#ffffff';
            header.style.backdropFilter = 'none';
        }
    });

    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            }
        });
    });

    // Заглушки для картинок
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'https://placehold.co/600x400/eeeeee/999999?text=Фото+в+процессе+добавления';
        });
    });

    // =========================================================
    // 2. ПЛАВНОЕ ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ (Scroll Reveal)
    // =========================================================
    const elementsToAnimate = document.querySelectorAll('.card, .material-item, .cta-box, h2');
    elementsToAnimate.forEach(el => el.classList.add('animate-on-scroll'));

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, index * 100); 
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    elementsToAnimate.forEach(el => observer.observe(el));

    // =========================================================
    // 3. ГЛОБАЛЬНЫЕ ИНТЕРАКТИВНЫЕ ПУЗЫРЬКИ
    // =========================================================
    
    // Создаем контейнер для пузырьков и добавляем в body
    const bubblesContainer = document.createElement('div');
    bubblesContainer.id = 'bubbles-container';
    document.body.prepend(bubblesContainer); // Вставляем в самое начало body

    const bubbleCount = 15; // Количество пузырьков на экране
    const bubbles = []; // Массив для хранения элементов, чтобы потом ими управлять

    // Более яркие и выраженные градиенты
    const colors = [
        'radial-gradient(circle, rgba(241, 143, 67, 0.6) 0%, rgba(241, 143, 67, 0.1) 80%)', // Теплый оранжевый
        'radial-gradient(circle, rgba(43, 92, 93, 0.5) 0%, rgba(43, 92, 93, 0.1) 80%)',    // Бирюзовый
        'radial-gradient(circle, rgba(255, 193, 7, 0.5) 0%, rgba(255, 193, 7, 0.1) 80%)'     // Солнечный желтый
    ];

    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('magic-bubble');
        
        // Размеры от 50px до 150px
        const size = Math.random() * 100 + 50; 
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Начальные позиции (используем CSS переменные для анимации)
        const startX = `${Math.random() * 100}vw`;
        const startY = `${Math.random() * 100}vh`;
        bubble.style.setProperty('--startX', startX);
        bubble.style.setProperty('--startY', startY);
        
        // Цвет и параметры анимации
        bubble.style.background = colors[Math.floor(Math.random() * colors.length)];
        bubble.style.animationDuration = `${Math.random() * 8 + 8}s`; // от 8 до 16 секунд
        bubble.style.animationDelay = `-${Math.random() * 5}s`; // Отрицательная задержка, чтобы они уже двигались при загрузке
        
        // Добавляем "глубину" для эффекта параллакса (чем больше, тем сильнее реагирует на мышь)
        bubble.dataset.depth = Math.random() * 0.5 + 0.1; 

        bubblesContainer.appendChild(bubble);
        bubbles.push(bubble);
    }

    // Добавляем реакцию на движение мышки (Параллакс)
    window.addEventListener('mousemove', (e) => {
        // Вычисляем позицию мыши относительно центра экрана
        const mouseX = (e.clientX - window.innerWidth / 2);
        const mouseY = (e.clientY - window.innerHeight / 2);

        // Двигаем каждый пузырек в зависимости от его "глубины"
        bubbles.forEach(bubble => {
            const depth = parseFloat(bubble.dataset.depth);
            // Смещаем в противоположную сторону от курсора
            const moveX = (mouseX * depth * -0.05); 
            const moveY = (mouseY * depth * -0.05);
            
            // Комбинируем перемещение от мыши с базовой CSS анимацией
            bubble.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });
});