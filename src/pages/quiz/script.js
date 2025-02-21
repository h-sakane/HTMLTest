let questions = [];
let selectedQuestions = [];
let timer;
let timeLimit = 30; // 時間制限（秒）
let startTime;
let elapsedTime = 0;

fetch('data/questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        if (questions.length >= 3) { // 質問数が十分であることを確認
            startQuiz();
        } else {
            console.error('Not enough questions available');
        }
    })
    .catch(error => console.error('Error loading questions:', error));

const questionElement = document.getElementById('question');
const questionNumberElement = document.getElementById('question-number');
const questionImageElement = document.getElementById('question-image');
const answerButtonsElement = document.getElementById('answer-buttons');
const actionButton = document.getElementById('submit-button');
const resultContainer = document.getElementById('result-container');
const scoreElement = document.getElementById('score');
const progressBar = document.getElementById('progress-bar');
const progress = document.getElementById('progress');
const warningMessage = document.getElementById('warning-message');

let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    selectedQuestions = getRandomQuestions(questions, 3); // 3問をランダムに選択
    if (selectedQuestions.length === 0) {
        console.error('Not enough questions available');
        return;
    }
    actionButton.innerText = '次へ';
    resultContainer.classList.add('hide');
    questionNumberElement.classList.remove('hide');
    questionElement.classList.remove('hide');
    questionImageElement.classList.add('hide');
    answerButtonsElement.classList.remove('hide');
    actionButton.classList.remove('hide');
    progressBar.classList.remove('hide');
    showQuestion(selectedQuestions[currentQuestionIndex]);
}

function getRandomQuestions(questions, num) {
    if (questions.length < num) {
        console.error('Not enough questions available');
        return [];
    }
    const shuffled = questions.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

function showQuestion(question) {
    if (!question) {
        console.error('Question is undefined');
        return;
    }
    questionNumberElement.innerText = `質問 ${currentQuestionIndex + 1} / ${selectedQuestions.length}`;
    questionElement.innerHTML = question.question;
    if (question.image) {
        questionImageElement.src = question.image;
        questionImageElement.classList.remove('hide');
    } else {
        questionImageElement.classList.add('hide');
    }
    answerButtonsElement.innerHTML = '';
    question.answers.forEach((answer, index) => {
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'answer';
        input.id = `answer${index}`;
        input.value = answer.correct;

        const label = document.createElement('label');
        label.htmlFor = `answer${index}`;
        label.innerHTML = answer.text;

        answerButtonsElement.appendChild(input);
        answerButtonsElement.appendChild(label);
        answerButtonsElement.appendChild(document.createElement('br'));
    });
    resetTimer();
    startTimer();
}

function resetTimer() {
    cancelAnimationFrame(timer);
    startTime = null;
    elapsedTime = 0;
    progress.style.width = '100%';
    progress.style.backgroundColor = '#4caf50';
}

function startTimer() {
    startTime = performance.now();
    timer = requestAnimationFrame(updateTimer);
}

function updateTimer(timestamp) {
    if (!startTime) startTime = timestamp;
    elapsedTime = (timestamp - startTime) / 1000; // 経過時間を秒単位で計算
    const timeLeft = timeLimit - elapsedTime;
    const progressPercentage = (timeLeft / timeLimit) * 100;
    progress.style.width = `${progressPercentage}%`;
    if (progressPercentage <= 50) {
        progress.style.backgroundColor = '#ff9800'; // オレンジ色
    }
    if (progressPercentage <= 20) {
        progress.style.backgroundColor = '#f44336'; // 赤色
    }
    if (timeLeft <= 0) {
        cancelAnimationFrame(timer);
        checkAnswer(true); // 時間切れの場合
    } else {
        timer = requestAnimationFrame(updateTimer);
    }
}

function checkAnswer(timeUp = false) {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer || timeUp) {
        cancelAnimationFrame(timer);
        warningMessage.classList.add('hide'); // 警告メッセージを非表示にする
        const correct = selectedAnswer ? selectedAnswer.value === 'true' : false;
        userAnswers.push({
            question: selectedQuestions[currentQuestionIndex].question,
            selected: selectedAnswer ? selectedAnswer.nextSibling.innerHTML : '時間切れ',
            correctAnswer: selectedQuestions[currentQuestionIndex].answers.find(answer => answer.correct).text,
            isCorrect: correct
        });
        if (correct) {
            score++;
        }
        currentQuestionIndex++;
        if (currentQuestionIndex < selectedQuestions.length) {
            showQuestion(selectedQuestions[currentQuestionIndex]);
        } else {
            showResult();
        }
    } else {
        warningMessage.classList.remove('hide'); // 警告メッセージを表示する
    }
}

function showResult() {
    questionNumberElement.classList.add('hide');
    questionElement.classList.add('hide');
    questionImageElement.classList.add('hide');
    answerButtonsElement.classList.add('hide');
    actionButton.classList.add('hide');
    progressBar.classList.add('hide');
    resultContainer.classList.remove('hide');
    resultContainer.innerHTML = ''; // 以前の結果をクリア
    const percentage = Math.round((score / selectedQuestions.length) * 100);
    if (percentage === 100) {
        scoreElement.innerHTML = `<h2 class="full-score">100点！</h2>`;
    } else {
        scoreElement.innerHTML = `<h2>正答率: ${percentage}%</h2>`;
    }
    resultContainer.appendChild(scoreElement);
    userAnswers.forEach((answer, index) => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');
        resultItem.innerHTML = `
            <h3>問題 ${index + 1}</h3>
            <p>${answer.question}</p>
            <p><span class="${answer.isCorrect ? 'correct-icon' : 'incorrect-icon'}">${answer.isCorrect ? '〇' : '×'}</span> あなたの答え: ${answer.selected}</p>
            ${answer.isCorrect ? '' : `<p>正しい答え: ${answer.correctAnswer}</p>`}
        `;
        resultContainer.appendChild(resultItem);
    });
    const retryButton = document.createElement('button');
    retryButton.innerText = '再挑戦';
    retryButton.classList.add('btn');
    retryButton.style.display = 'block';
    retryButton.style.margin = '20px auto';
    retryButton.addEventListener('click', startQuiz);
    resultContainer.appendChild(retryButton);
}

actionButton.addEventListener('click', () => {
    if (actionButton.innerText === '次へ') {
        checkAnswer();
    } else {
        startQuiz();
    }
});

startQuiz();