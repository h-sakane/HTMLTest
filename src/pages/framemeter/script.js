const images = [
    'images/image (1).png',
    'images/image (2).png',
    'images/image (3).png',
    // 省略
    'images/image (101).png',
];
let currentIndex = 0;
let isPlaying = false;
let intervalId;
const imageElement = document.getElementById('image');
const counterElement = document.getElementById('counter');
const prevButton = document.getElementById('prev');
const pauseButton = document.getElementById('pause');
const playButton = document.getElementById('play');
const nextButton = document.getElementById('next');
const speedSelect = document.getElementById('speed');
const markersElement = document.getElementById('markers');
const indicatorElement = document.getElementById('indicator');

const colors = {
    0: 'black',
    1: 'red',
    2: 'blue',
    3: 'yellow',
    4: 'green',
    5: 'pink',
    6: 'brown',
    7: 'lightgreen',
    8: 'cyan',
    9: 'orange'
};

const colorIndices = [
    [1, 0], // 初期値は黒
    [2, 2],
    [5, 1],
    [10, 7],
    [25, 3],
    [30, 5],
    [40, 8],
    [73, 9],
    [80, 6],
    [91, 4],
    [100, 0],
];

function showImage(index) {
    imageElement.src = images[index];
    counterElement.textContent = `${index + 1}/${images.length}`;
    updateMarkers(index);
}

function updateMarkers(index) {
    let markers = '';
    for (let i = 0; i < images.length; i++) {
        let color = 'black';
        for (let j = 0; j < colorIndices.length; j++) {
            if (i + 1 >= colorIndices[j][0]) {
                color = colors[colorIndices[j][1]];
            }
        }
        markers += `<span style="color: ${color};" data-index="${i}">|</span>`;
    }
    markersElement.innerHTML = markers;
    indicatorElement.textContent = ' '.repeat(index) + '^' + ' '.repeat(images.length - index - 1);

    // マーカークリックイベントを追加
    document.querySelectorAll('#markers span').forEach(marker => {
        marker.addEventListener('click', (event) => {
            const newIndex = parseInt(event.target.getAttribute('data-index'));
            stopSlideshow();
            currentIndex = newIndex;
            showImage(currentIndex);
        });
    });
}

function startSlideshow() {
    if (!isPlaying) {
        isPlaying = true;
        const fps = parseInt(speedSelect.value);
        intervalId = setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        }, 1000 / fps);
    }
}

function stopSlideshow() {
    if (isPlaying) {
        clearInterval(intervalId);
        isPlaying = false;
    }
}

function toggleSlideshow() {
    if (isPlaying) {
        stopSlideshow();
    } else {
        startSlideshow();
    }
}

playButton.addEventListener('click', () => {
    startSlideshow();
});

pauseButton.addEventListener('click', () => {
    if (isPlaying) {
        stopSlideshow();
    } else {
        currentIndex = 0;
        showImage(currentIndex);
    }
});

prevButton.addEventListener('click', () => {
    stopSlideshow();
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
});

nextButton.addEventListener('click', () => {
    stopSlideshow();
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
});

speedSelect.addEventListener('change', () => {
    if (isPlaying) {
        stopSlideshow();
        startSlideshow();
    }
});

imageElement.addEventListener('click', toggleSlideshow);

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case ' ':
        case 'Enter':
            toggleSlideshow();
            break;
        case 'ArrowLeft':
            prevButton.click();
            break;
        case 'ArrowRight':
            nextButton.click();
            break;
    }
});

// 初期表示
showImage(currentIndex);