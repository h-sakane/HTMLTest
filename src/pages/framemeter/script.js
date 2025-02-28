const timelineContainer = document.getElementById('timeline-container');
const markersElement = document.getElementById('markers');
const indicatorElement = document.getElementById('indicator');

const images = [
    'images/image (1).png',
    'images/image (2).png',
    'images/image (3).png',
    'images/image (4).png',
    'images/image (5).png',
    'images/image (6).png',
    'images/image (7).png',
    'images/image (8).png',
    'images/image (9).png',
    'images/image (10).png',
    'images/image (11).png',
    'images/image (12).png',
    'images/image (13).png',
    'images/image (14).png',
    'images/image (15).png',
    'images/image (16).png',
    'images/image (17).png',
    'images/image (18).png',
    'images/image (19).png',
    'images/image (20).png',
    'images/image (21).png',
    'images/image (22).png',
    'images/image (23).png',
    'images/image (24).png',
    'images/image (25).png',
    'images/image (26).png',
    'images/image (27).png',
    'images/image (28).png',
    'images/image (29).png',
    'images/image (30).png',
    'images/image (31).png',
    'images/image (32).png',
    'images/image (33).png',
    'images/image (34).png',
    'images/image (35).png',
    'images/image (36).png',
    'images/image (37).png',
    'images/image (38).png',
    'images/image (39).png',
    'images/image (40).png',
    'images/image (41).png',
    'images/image (42).png',
    'images/image (43).png',
    'images/image (44).png',
    'images/image (45).png',
    'images/image (46).png',
    'images/image (47).png',
    'images/image (48).png',
    'images/image (49).png',
    'images/image (50).png',
    'images/image (51).png',
    'images/image (52).png',
    'images/image (53).png',
    'images/image (54).png',
    'images/image (55).png',
    'images/image (56).png',
    'images/image (57).png',
    'images/image (58).png',
    'images/image (59).png',
    'images/image (60).png',
    'images/image (61).png',
    'images/image (62).png',
    'images/image (63).png',
    'images/image (64).png',
    'images/image (65).png',
    'images/image (66).png',
    'images/image (67).png',
    'images/image (68).png',
    'images/image (69).png',
    'images/image (70).png',
    'images/image (71).png',
    'images/image (72).png',
    'images/image (73).png',
    'images/image (74).png',
    'images/image (75).png',
    'images/image (76).png',
    'images/image (77).png',
    'images/image (78).png',
    'images/image (79).png',
    'images/image (80).png',
    'images/image (81).png',
    'images/image (82).png',
    'images/image (83).png',
    'images/image (84).png',
    'images/image (85).png',
    'images/image (86).png',
    'images/image (87).png',
    'images/image (88).png',
    'images/image (89).png',
    'images/image (90).png',
    'images/image (91).png',
    'images/image (92).png',
    'images/image (93).png',
    'images/image (94).png',
    'images/image (95).png',
    'images/image (96).png',
    'images/image (97).png',
    'images/image (98).png',
    'images/image (99).png',
    'images/image (100).png',
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
    [1, 0],
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

// プレースホルダー画像のURL
const placeholderImage = 'images/placeholder.png';

// 画像をプリロードする関数
function preloadImages(imageArray, callback) {
    let loadedImages = 0;
    imageArray.forEach((src) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            loadedImages++;
            if (loadedImages === imageArray.length) {
                callback();
            }
        };
        img.onerror = () => {
            loadedImages++;
            if (loadedImages === imageArray.length) {
                callback();
            }
        };
    });
}

// プリロードが完了したら画像を表示する関数
function onImagesPreloaded() {
    showImage(currentIndex);
    updateMarkers(currentIndex);
    startSlideshow(); // すべての画像がロードされた後にスライダーを開始
}

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
        let number = '&nbsp;';
        if (i === 0 || i === images.length - 1 || (i + 1) % 10 === 0) {
            number = i + 1;
        }
        markers += `<div class="marker" style="color: ${color};" data-index="${i}">
                        <span class="marker-number">${number}</span>
                        <span>|</span>
                        <span class="marker-indicator">${i === index ? '^' : '&nbsp;'}</span>
                    </div>`;
    }
    markersElement.innerHTML = markers;

    // マーカークリックイベントを追加
    document.querySelectorAll('.marker').forEach(marker => {
        marker.addEventListener('click', (event) => {
            const newIndex = parseInt(event.currentTarget.getAttribute('data-index'));
            stopSlideshow();
            currentIndex = newIndex;
            showImage(currentIndex);
        });
    });

    // 現在のフレームを中央にスクロール
    const currentMarker = document.querySelector(`.marker[data-index="${index}"]`);
    if (currentMarker) {
        const containerWidth = timelineContainer.clientWidth;
        const markerWidth = currentMarker.offsetWidth;
        const scrollPosition = currentMarker.offsetLeft - (containerWidth / 2) + (markerWidth / 2);
        timelineContainer.scrollLeft = scrollPosition;
    } else {
        // 最初のフレームの場合、左端にスクロール
        timelineContainer.scrollLeft = 0;
    }
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
imageElement.src = placeholderImage;
preloadImages(images, onImagesPreloaded);