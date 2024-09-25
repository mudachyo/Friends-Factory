// ==UserScript==
// @name        Friends Factory Autoclicker
// @namespace   Violentmonkey Scripts
// @match       https://ffabrika.com/*
// @grant       none
// @version     1.0
// @author      mudachyo
// @icon        https://mudachyo.codes/assets/ffactory/logo.jpg
// @downloadURL https://github.com/mudachyo/Friends-Factory/raw/main/ffactory-autoclicker.user.js
// @updateURL   https://github.com/mudachyo/Friends-Factory/raw/main/ffactory-autoclicker.user.js
// @homepage    https://github.com/mudachyo/Friends-Factory
// ==/UserScript==

// Настройки
const minDelay = 100;  // Минимальная задержка клика в миллисекундах
const maxDelay = 200;  // Максимальная задержка клика в миллисекундах
const checkInterval = 500;  // Интервал проверки существования элемента
const energyThreshold = 25;  // Пороговое значение энергии
const minPause = 60 * 1000;  // Минимальная пауза в миллисекундах (1 минута)
const maxPause = 3 * 60 * 1000;  // Максимальная пауза в миллисекундах (3 минуты)

let isPaused = false;  // Флаг паузы
let clickTimeout;  // Переменная для хранения таймера клика

// Функция для генерации случайной задержки
function getRandomDelay(min, max) {
    return Math.random() * (max - min) + min;
}

// Функция для генерации случайных координат в пределах элемента
function getRandomCoordinates(element) {
    const rect = element.getBoundingClientRect();
    const randomX = rect.left + Math.random() * rect.width;
    const randomY = rect.top + Math.random() * rect.height;
    return { x: randomX, y: randomY };
}

// Функция для симуляции PointerEvent с случайными координатами
function simulatePointerEvent(element, type, options = {}) {
    const event = new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        pointerId: options.pointerId || 1,
        width: options.width || 1,
        height: options.height || 1,
        pressure: options.pressure || 0.5,
        pointerType: options.pointerType || 'touch',
        isPrimary: options.isPrimary || true,
        clientX: options.clientX,
        clientY: options.clientY,
        ...options
    });
    element.dispatchEvent(event);
}

// Функция для симуляции TouchEvent с случайными координатами
function simulateTouchEvent(element, type, options = {}) {
    const touch = new Touch({
        identifier: options.pointerId || 1,
        target: element,
        clientX: options.clientX,
        clientY: options.clientY,
        radiusX: options.width || 1,
        radiusY: options.height || 1,
        force: options.pressure || 0.5
    });

    const event = new TouchEvent(type, {
        bubbles: true,
        cancelable: true,
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch],
        ...options
    });
    element.dispatchEvent(event);
}

// Функция для проверки уровня энергии
function checkEnergy() {
    const energyElement = document.querySelector('#__next > div.sc-89da68c-0.buCEaZ > div > div > div > div > div > div.sc-988de50f-0.hIsbk.sc-d79ddde7-1.eMBvoS > div.sc-988de50f-0.bVMKAa > div.sc-988de50f-0.cyTaIg > div.sc-988de50f-0.cgRPSF > span.sc-ddd208da-0.jBYIpq');
    if (energyElement) {
        const energyText = energyElement.textContent;
        const currentEnergy = parseFloat(energyText.replace(',', '.'));

        return currentEnergy;
    }
    return 100;
}

// Функция для выполнения клика с рандомными координатами и задержкой
function clickElement() {
    const currentEnergy = checkEnergy();

    if (currentEnergy < energyThreshold) {
        if (!isPaused) {
            isPaused = true;
            const pauseDuration = getRandomDelay(minPause, maxPause);
            console.log(`Энергия низкая (${currentEnergy}), пауза на ${pauseDuration / 1000} секунд.`);
            setTimeout(() => {
                isPaused = false;
                startAutoClicker();
            }, pauseDuration);
        }
    } else {
        const elements = document.querySelectorAll('.sc-988de50f-0.hbRYVL.sc-9fa9182-0.exNnOf');
        const firstElement = elements[0];

        if (firstElement) {
            const coords = getRandomCoordinates(firstElement);
            simulatePointerEvent(firstElement, 'pointerover', { clientX: coords.x, clientY: coords.y, pressure: 1, pointerId: 5 });
            simulatePointerEvent(firstElement, 'pointerenter', { clientX: coords.x, clientY: coords.y, pressure: 1, pointerId: 5 });
            simulatePointerEvent(firstElement, 'pointerdown', { clientX: coords.x, clientY: coords.y, pressure: 1, pointerId: 5 });
            simulateTouchEvent(firstElement, 'touchstart', { clientX: coords.x, clientY: coords.y, pressure: 1, pointerId: 5 });
            simulatePointerEvent(firstElement, 'pointerup', { clientX: coords.x, clientY: coords.y, pressure: 0, pointerId: 5 });
            simulateTouchEvent(firstElement, 'touchend', { clientX: coords.x, clientY: coords.y, pressure: 0, pointerId: 5 });
            firstElement.click();
        }
    }
}

// Функция для запуска автокликера с рандомной задержкой
function startAutoClicker() {
    if (!isPaused) {
        clearTimeout(clickTimeout);

        function tryClick() {
            clickElement();
            const delay = getRandomDelay(minDelay, maxDelay);
            clickTimeout = setTimeout(tryClick, delay); 
        }
        tryClick();
    }
}

setTimeout(() => {
    setInterval(() => {
        const element = document.querySelector('.sc-988de50f-0.hbRYVL.sc-9fa9182-0.exNnOf');
        if (element) {
            startAutoClicker();
        }
    }, checkInterval);
}, 3000);
