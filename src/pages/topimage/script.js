const images = [
    'path/to/image1.png',
    'path/to/image2.png',
    'path/to/image3.png',
    'path/to/image4.png',
    'path/to/image5.png',
    'path/to/image6.png',
    'path/to/image7.png',
    'path/to/image8.png',
    'path/to/image9.png'
];

function getRandomImage() {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
}

function displayRandomImages() {
    let leftImage = getRandomImage();
    let rightImage = getRandomImage();

    // Ensure the two images are different
    while (leftImage === rightImage) {
        rightImage = getRandomImage();
    }

    console.log('Left Image:', leftImage);  // デバッグ用
    console.log('Right Image:', rightImage);  // デバッグ用

    document.getElementById('leftImage').src = leftImage;
    document.getElementById('rightImage').src = rightImage;
}

// Display images when the page loads
window.onload = displayRandomImages;