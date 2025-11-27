/* IntuiQuiz: Quiz interativo estilo Show do Milhão com som dinâmico */

/* --- Banco de perguntas (Perguntas Reais do Show do Milhão) --- */
const questions = [
  { question: 'Qual é o elemento químico representado pela sigla Au?', options: ['Alumínio', 'Prata', 'Ouro'], correctAnswer: 'Ouro', points: 10 },
  { question: 'A que temperatura a água ferve ao nível do mar?', options: ['90°C', '100°C', '110°C'], correctAnswer: '100°C', points: 15 },
  { question: 'Quantas letras tem a escrita da frase "Ordem e Progresso" na bandeira nacional?', options: ['13', '14', '15'], correctAnswer: '15', points: 20 },
  { question: 'Qual dos seguintes animais não é um mamífero?', options: ['Golfinho', 'Tubarão', 'Morcego'], correctAnswer: 'Tubarão', points: 25 },
  { question: 'Em qual cidade mineira nasceu Edson Arantes do Nascimento, o Pelé?', options: ['Varginha', 'Três Corações', 'Uberlândia'], correctAnswer: 'Três Corações', points: 30 },
  { question: 'Quem foi o primeiro presidente da República do Brasil?', options: ['Getúlio Vargas', 'Marechal Deodoro da Fonseca', 'Floriano Peixoto'], correctAnswer: 'Marechal Deodoro da Fonseca', points: 50 },
  { question: 'A qual região pertence o estado do Amazonas?', options: ['Centro-Oeste', 'Norte', 'Nordeste'], correctAnswer: 'Norte', points: 75 },
  { question: 'Na mitologia grega, quem foi o herói que matou a Medusa?', options: ['Hércules', 'Perseu', 'Teseu'], correctAnswer: 'Perseu', points: 100 },
  { question: 'Qual o nome do fenômeno que faz com que a Lua pareça maior quando está próxima ao horizonte?', options: ['Ilusão de Óptica', 'Efeito Estufa', 'Refração Atmosférica'], correctAnswer: 'Ilusão de Óptica', points: 150 },
  { question: 'O que representa a estrela isolada no Norte da Bandeira Nacional do Brasil?', options: ['Brasília', 'Spica', 'Cruzeiro do Sul'], correctAnswer: 'Spica', points: 300, isMillion: true }
];

let currentQuestionIndex = 0;
let totalPoints = 0;
let answered = false;
let backgroundAudio = null;
let timerInterval = null; // para controlar o timer
let timeRemaining = 0; // tempo restante em segundos

/* --- Injeção de CSS dinâmico --- */
(function injectCSS() {
  const css = `
  .option-btn.correct { animation: correctFlash 800ms ease both; border-color: #0a0; box-shadow: 0 0 20px rgba(0,255,0,0.5); }
  .option-btn.wrong { animation: wrongShake 600ms ease both; border-color: #c00; box-shadow: 0 0 20px rgba(255,0,0,0.5); }
  @keyframes correctFlash { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1); } }
  @keyframes wrongShake { 0% { transform: translateX(0) } 15% { transform: translateX(-8px) } 30% { transform: translateX(8px) } 45% { transform: translateX(-6px) } 60% { transform: translateX(6px) } 75% { transform: translateX(-3px) } 90% { transform: translateX(3px) } 100% { transform: translateX(0) } }
  .pulse { animation: pulseScore 600ms cubic-bezier(0.68, -0.55, 0.265, 1.55); }
  @keyframes pulseScore { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
  
  #timer-display {
    font-size: 2.5em;
    font-weight: bold;
    margin: 15px 0;
    padding: 10px 20px;
    border-radius: 12px;
    background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
    color: #00ff00;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.6);
    font-family: 'Courier New', monospace;
    letter-spacing: 2px;
    box-shadow: inset 0 0 15px rgba(0, 255, 0, 0.2), 0 0 20px rgba(0, 255, 0, 0.3);
  }

  #timer-display.warning {
    color: #ffaa00;
    text-shadow: 0 0 10px rgba(255, 170, 0, 0.6);
    box-shadow: inset 0 0 15px rgba(255, 170, 0, 0.2), 0 0 20px rgba(255, 170, 0, 0.3);
    animation: timerWarning 500ms infinite alternate;
  }

  #timer-display.danger {
    color: #ff0000;
    text-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
    box-shadow: inset 0 0 15px rgba(255, 0, 0, 0.3), 0 0 20px rgba(255, 0, 0, 0.5);
    animation: timerDanger 300ms infinite alternate;
  }

  @keyframes timerWarning {
    0% { transform: scale(1); }
    100% { transform: scale(1.05); }
  }

  @keyframes timerDanger {
    0% { transform: scale(1); }
    100% { transform: scale(1.08); }
  }

  .timer-bar {
    width: 100%;
    height: 6px;
    background: #333;
    border-radius: 3px;
    margin-top: 10px;
    overflow: hidden;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5);
  }

  .timer-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #00ff00 0%, #ffaa00 70%, #ff0000 100%);
    width: 100%;
    transition: width 100ms linear;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  }
  
  .million-question {
    font-size: 1.5em;
    font-weight: bold;
    color: #ffd700;
    text-shadow: 0 0 15px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 100, 0, 0.6);
    padding: 20px;
    border: 3px solid #ffd700;
    border-radius: 12px;
    background: linear-gradient(135deg, #333 0%, #1a1a1a 100%);
    margin-bottom: 25px;
    animation: millionPulse 1.5s infinite alternate ease-in-out;
    box-shadow: inset 0 0 10px rgba(255, 215, 0, 0.3);
  }
  @keyframes millionPulse {
    0% { transform: scale(1); box-shadow: inset 0 0 10px rgba(255,215,0,0.3), 0 0 20px rgba(255,215,0,0.4); }
    100% { transform: scale(1.03); box-shadow: inset 0 0 20px rgba(255,215,0,0.5), 0 0 30px rgba(255,215,0,0.6); }
  }

  .question-counter { 
    display: inline-block; 
    background: #ff6b35; 
    color: white; 
    padding: 6px 14px; 
    border-radius: 20px; 
    font-weight: bold; 
    margin-bottom: 10px; 
    animation: slideIn 600ms ease-out;
  }
  @keyframes slideIn { 0% { transform: translateX(-30px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }

  .result-message { animation: fadeInScale 500ms ease both; }
  @keyframes fadeInScale { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }

  button:disabled { opacity: 0.6; cursor: not-allowed; }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();

/* --- Audio Context Setup --- */
const audioCtx = (typeof AudioContext !== 'undefined') ? new AudioContext() : null;

function playTone(freq, type = 'sine', duration = 0.15, when = 0, gainVal = 0.12) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = gainVal;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(audioCtx.currentTime + when);
  osc.stop(audioCtx.currentTime + when + duration);
}

function soundCorrect() {
  if (!audioCtx) return;
  playTone(440, 'sine', 0.12, 0, 0.12);
  playTone(660, 'sine', 0.14, 0.12, 0.12);
  playTone(880, 'sine', 0.18, 0.26, 0.10);
}

function soundWrong() {
  if (!audioCtx) return;
  playTone(160, 'sawtooth', 0.3, 0, 0.18);
}

function soundSuspense() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  playTone(200, 'sawtooth', 0.8, 0, 0.08);
  playTone(220, 'sawtooth', 0.8, 0.8, 0.08);
  playTone(180, 'sawtooth', 0.8, 1.6, 0.08);
}

function soundTimeWarning() {
  if (!audioCtx) return;
  playTone(800, 'square', 0.15, 0, 0.15);
  playTone(600, 'square', 0.15, 0.2, 0.15);
}

/* --- GERENCIAR SOM DE FUNDO --- */
function playBackgroundMusic(url) {
  if (backgroundAudio) backgroundAudio.pause();
  backgroundAudio = new Audio(url);
  backgroundAudio.loop = true;
  backgroundAudio.volume = 0.3;
  backgroundAudio.play().catch(err => console.log('Áudio de fundo não disponível:', err));
}

function stopBackgroundMusic() {
  if (backgroundAudio) {
    backgroundAudio.pause();
    backgroundAudio.currentTime = 0;
  }
}

/* --- GERENCIAR TIMER --- */
function startTimer(seconds) {
  // Para timer anterior se existir
  if (timerInterval) clearInterval(timerInterval);

  timeRemaining = seconds;
  const timerDisplay = document.getElementById('timer-display');

  const updateTimer = () => {
    timerDisplay.textContent = `⏱️ ${timeRemaining}s`;
    timerDisplay.classList.remove('warning', 'danger');

    if (timeRemaining <= 10) {
      timerDisplay.classList.add('warning');
      soundTimeWarning();
    }

    if (timeRemaining <= 5) {
      timerDisplay.classList.add('danger');
    }

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timeoutAnswer();
    }

    timeRemaining--;
  };

  updateTimer(); // Atualiza logo de início
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function timeoutAnswer() {
  if (answered) return;
  answered = true;
  stopTimer();

  const currentQuestion = questions[currentQuestionIndex];
  const resultElement = document.getElementById('result');
  const buttons = document.querySelectorAll('#options-container .option-btn');
  const nextBtn = document.getElementById('next-btn');

  buttons.forEach(b => b.disabled = true);

  resultElement.innerHTML = `<span class="result-message" style="color: #ff4444; font-weight: bold;">⏰ TEMPO ESGOTADO!</span><br>Resposta correta: <strong>${currentQuestion.correctAnswer}</strong>`;
  soundWrong();

  buttons.forEach(b => {
    if (b.textContent === currentQuestion.correctAnswer) {
      b.classList.add('correct');
    }
  });

  nextBtn.disabled = false;
}

/* --- Carregar Pergunta --- */
function loadQuestion() {
  answered = false;
  stopTimer(); // Para qualquer timer anterior

  const q = questions[currentQuestionIndex];
  const questionElement = document.getElementById('question');
  const optionsContainer = document.getElementById('options-container');
  const resultElement = document.getElementById('result');
  const nextBtn = document.getElementById('next-btn');

  // Remove classe anterior
  questionElement.classList.remove('million-question');

  // Cria contador visual dinâmico
  let questionHTML = `<span class="question-counter">Pergunta ${currentQuestionIndex + 1}/${questions.length}</span><br>`;

  // Adiciona timer visual
  questionHTML += `<div id="timer-display">⏱️ ${q.isMillion ? 60 : 30}s</div>`;
  questionHTML += `<div class="timer-bar"><div class="timer-bar-fill"></div></div><br>`;

  // Adiciona classe especial para pergunta do milhão
  if (q.isMillion) {
    questionElement.classList.add('million-question');
    questionHTML += `<span style="color: #ffd700; font-size: 0.9em;">🎯 PERGUNTA DO MILHÃO 🎯</span><br>`;
    soundSuspense();
  }

  questionHTML += q.question;
  questionElement.innerHTML = questionHTML;

  optionsContainer.innerHTML = '';
  resultElement.textContent = '';
  resultElement.style.color = '';
  nextBtn.disabled = true;

  // Embaralha opções
  const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

  shuffledOptions.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option-btn';
    button.textContent = option;
    button.style.animationDelay = `${index * 0.1}s`;
    button.style.animation = 'slideIn 600ms ease-out forwards';
    button.onclick = () => {
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      checkAnswer(option, button);
    };
    optionsContainer.appendChild(button);
  });

  const firstBtn = optionsContainer.querySelector('button');
  if (firstBtn) firstBtn.focus();

  // Inicia timer (60s para milhão, 30s para outras)
  const timerSeconds = q.isMillion ? 60 : 30;
  startTimer(timerSeconds);
}

/* --- Verificar Resposta --- */
function checkAnswer(selectedAnswer, clickedButton) {
  if (answered) return;
  answered = true;
  stopTimer(); // Para o timer quando responde

  const currentQuestion = questions[currentQuestionIndex];
  const resultElement = document.getElementById('result');
  const buttons = document.querySelectorAll('#options-container .option-btn');
  const nextBtn = document.getElementById('next-btn');

  buttons.forEach(b => b.disabled = true);

  if (selectedAnswer === currentQuestion.correctAnswer) {
    totalPoints += currentQuestion.points;
    resultElement.innerHTML = `<span class="result-message" style="color: #00ff00; font-weight: bold;">✓ Resposta correta!</span><br>Pontos ganhos: ${currentQuestion.points}`;

    clickedButton.classList.add('correct');
    soundCorrect();

  } else {
    resultElement.innerHTML = `<span class="result-message" style="color: #ff4444; font-weight: bold;">✗ Resposta incorreta!</span><br>Resposta certa: <strong>${currentQuestion.correctAnswer}</strong>`;
    soundWrong();

    clickedButton.classList.add('wrong');
    buttons.forEach(b => {
      if (b.textContent === currentQuestion.correctAnswer) {
        b.classList.add('correct');
      }
    });
  }

  const scoreEl = document.getElementById('total-points');
  scoreEl.textContent = totalPoints;
  scoreEl.classList.add('pulse');
  setTimeout(() => scoreEl.classList.remove('pulse'), 600);

  nextBtn.disabled = false;
}

/* --- Próxima Pergunta --- */
function nextQuestion() {
  if (!answered) {
    const nextBtn = document.getElementById('next-btn');
    nextBtn.style.transform = 'scale(0.95)';
    setTimeout(() => nextBtn.style.transform = '', 100);
    return;
  }

  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    loadQuestion();
  } else {
    stopBackgroundMusic();
    stopTimer();
    const container = document.getElementById('question-container');
    container.innerHTML = `
      <div style="text-align: center; animation: fadeInScale 800ms ease;">
        <h2 style="color: #ffd700; font-size: 2em;">🏆 PARABÉNS! 🏆</h2>
        <p style="font-size: 1.3em; margin: 20px 0;">Pontuação final: <strong style="color: #ff6b35;">${totalPoints}</strong> pontos</p>
        <p style="margin: 10px 0;">Obrigado por jogar!</p>
        <div style="margin-top: 25px;">
          <button id="restart-btn" style="padding: 12px 30px; font-size: 1.1em; cursor: pointer; background: #ff6b35; color: white; border: none; border-radius: 8px; transition: all 300ms;">Jogar novamente</button>
        </div>
      </div>
    `;
    const restart = document.getElementById('restart-btn');
    restart.onmouseover = () => restart.style.transform = 'scale(1.08)';
    restart.onmouseout = () => restart.style.transform = '';
    restart.onclick = () => {
      currentQuestionIndex = 0;
      totalPoints = 0;
      const sp = document.getElementById('total-points');
      if (sp) sp.textContent = totalPoints;
      document.getElementById('question-container').innerHTML = `
        <div id="question"></div>
        <div id="options-container"></div>
        <div id="result"></div>
        <div id="controls">
          <button id="next-btn" onclick="nextQuestion()">Próxima Pergunta</button>
          <div id="score">Pontuação: <strong id="total-points">0</strong></div>
        </div>
      `;
      playBackgroundMusic('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      loadQuestion();
    };
  }
}

/* --- Inicialização --- */
document.addEventListener('DOMContentLoaded', () => {
  const scoreEl = document.getElementById('total-points');
  if (scoreEl) scoreEl.textContent = totalPoints;

  document.getElementById('next-btn').onclick = nextQuestion;
  loadQuestion();
});
// No final do arquivo, descomente e customize:
playBackgroundMusic('https://www.example.com/seu-audio.mp3');

