
        // ==============================================
        // NUEVO SISTEMA DE ESTADO DEL JUEGO
        // ==============================================
        const gameState = {
            lives: 5,
            // Level 1 starts unlocked (true), others are locked (false)
            completedLevels: [false, false, false, false, false],
            currentLevel: 1,
            challengeProgress: 0, // For level 1 (0-3)
            levelStates: {
                1: { currentChallenge: 1, answers: {} }, // Store answers for each challenge
                2: { selectedAnswer: null },
                3: { currentQuestion: 0, selectedAnswer: null },
                4: { currentState: 'inicio', selectedAnswer: null },
                5: { currentQuestion: 0, selectedAnswer: null }
            }
        };

        // ==============================================
        // INICIALIZACIÓN DEL JUEGO
        // ==============================================
        document.addEventListener('DOMContentLoaded', function() {
            initGame();
            setupEventListeners();
            tryPlayBackgroundMusic();
        });

        function initGame() {
            // Ensure level 1 is always unlocked at game start
            gameState.completedLevels[0] = true;
            updateLevelCards();
            updateLivesDisplay();
            showMainPage(); // Start on the main page
        }

        function setupEventListeners() {
            // Botón de sonido
            document.getElementById('soundButton').addEventListener('click', toggleSound);

            // Botones de nivel (delegate click handling to the card's onclick)
            // The onclick in HTML now directly calls playButtonSound() and showStory()
            // No need for separate JS event listeners here for card clicks
        }

        // ==============================================
        // MANEJO DE NIVELES
        // ==============================================
        function showStory(level) {
            gameState.currentLevel = level;
            const story = getStoryContent(level);

            document.getElementById('story-title').textContent = story.titulo;
            document.getElementById('story-text').innerHTML = story.content;

            const startBtn = document.getElementById('start-level-btn');
            startBtn.onclick = () => {
                playButtonSound();
                startLevel(level);
            };

            hideAllPages();
            document.getElementById('story-screen').style.display = 'block';
        }

        function startLevel(level) {
            hideAllPages();

            const levelPage = document.getElementById(`game-page-level${level}`);
            if (levelPage) {
                levelPage.style.display = 'block';
                resetLevel(level);
            }

            updateLivesDisplay();
        }

        function resetLevel(level) {
            // Reset specific level states and display initial challenge/question
            switch(level) {
                case 1:
                    gameState.challengeProgress = 0;
                    gameState.levelStates[1].answers = {}; // Clear previous answers for retries
                    showChallenge(1);
                    break;
                case 2:
                    gameState.levelStates[2].selectedAnswer = null;
                    // Ensure the challenge is visible and feedback is hidden
                    document.getElementById('challenge-level2').style.display = 'block';
                    document.getElementById('feedback-level2').style.display = 'none';
                    document.querySelectorAll('#challenge-level2 .option').forEach(opt => opt.classList.remove('selected'));
                    break;
                case 3:
                    gameState.levelStates[3].currentQuestion = 0;
                    gameState.levelStates[3].selectedAnswer = null;
                    document.getElementById('challenge-level3').style.display = 'block';
                    initNivel3();
                    break;
                case 4:
                    gameState.levelStates[4].currentState = 'inicio';
                    gameState.levelStates[4].selectedAnswer = null;
                    document.getElementById('challenge-level4').style.display = 'block';
                    loadLevel4State('inicio');
                    break;
                case 5:
                    gameState.levelStates[5].currentQuestion = 0;
                    gameState.levelStates[5].selectedAnswer = null;
                    document.getElementById('challenge-level5').style.display = 'block';
                    initNivel5();
                    break;
            }
        }

        function completeLevel(level) {
            gameState.completedLevels[level - 1] = true;

            // Unlock next level if it exists and isn't the last level
            if (level < 5) {
                gameState.completedLevels[level] = true;
            }

            updateLevelCards();

            // Show victory screen
            hideAllGameContent(level);

            if (level === 5) {
                document.getElementById('victory-final').style.display = 'block';
            } else {
                document.getElementById(`victory-level${level}`).style.display = 'block';
            }
        }

        // ==============================================
        // MANEJO DE VIDAS
        // ==============================================
        function loseLife() {
            gameState.lives--;
            updateLivesDisplay();

            if (gameState.lives <= 0) {
                setTimeout(showGameOver, 500);
            }
        }

        function showGameOver() {
            hideAllPages();
            document.getElementById('game-over').style.display = 'block';
        }

        // ==============================================
        // FUNCIONES AUXILIARES GENERALES
        // ==============================================
        function updateLevelCards() {
            for (let i = 1; i <= 5; i++) {
                const card = document.getElementById(`level${i}-card`);
                if (!card) continue;

                const isUnlocked = gameState.completedLevels[i - 1]; // Use completedLevels state

                if (isUnlocked) {
                    card.classList.add('enabled');
                    card.classList.remove('disabled');
                    card.querySelector('.status-badge').className = 'status-badge status-enabled';
                    card.querySelector('.status-badge').textContent = 'Disponible';
                    card.onclick = () => { playButtonSound(); showStory(i); }; // Re-enable click
                } else {
                    card.classList.remove('enabled');
                    card.classList.add('disabled');
                    card.querySelector('.status-badge').className = 'status-badge status-locked';
                    card.querySelector('.status-badge').textContent = 'Bloqueado';
                    card.onclick = null; // Disable click for locked levels
                }
            }
        }

        function updateLivesDisplay() {
            // Update lives in the header of the current game page
            const currentLivesDisplayId = `livesDisplayLevel${gameState.currentLevel}`;
            const currentLivesDisplay = document.getElementById(currentLivesDisplayId);
            if (currentLivesDisplay) {
                currentLivesDisplay.innerHTML = '';
                for (let j = 0; j < gameState.lives; j++) {
                    const heart = document.createElement('i');
                    heart.className = 'fas fa-heart heart';
                    currentLivesDisplay.appendChild(heart);
                }
            }

            // Update lives on all victory/game over screens
            document.querySelectorAll('.lives-count').forEach(el => {
                el.textContent = gameState.lives;
            });

            // Ensure the main lives display also updates if shown (Level 1's header)
            const mainLivesDisplay = document.getElementById('livesDisplay'); // This ID is not used consistently across headers
            // Let's ensure this is targeting the correct display for Level 1, if it's visible.
            // The existing HTML has livesDisplay and livesDisplayLevelX.
            // Simplified to update only based on currentLevel, and global counters.
        }


        function hideAllPages() {
            document.getElementById('main-page').style.display = 'none';
            document.getElementById('story-screen').style.display = 'none';
            document.getElementById('game-over').style.display = 'none';
            document.getElementById('victory-final').style.display = 'none'; // Hide final victory
            for (let i = 1; i <= 5; i++) {
                const page = document.getElementById(`game-page-level${i}`);
                if (page) {
                    page.style.display = 'none';
                    // Also hide specific victory screens when hiding game pages
                    const victoryScreen = document.getElementById(`victory-level${i}`);
                    if (victoryScreen) victoryScreen.style.display = 'none';
                }
            }
        }

        function hideAllGameContent(level) {
            const page = document.getElementById(`game-page-level${level}`);
            if (!page) return;

            // Hide all direct children that are challenge cards or progress bars
            // and not a victory screen for this level.
            Array.from(page.children).forEach(child => {
                const isVictoryScreen = child.id.startsWith('victory-level') || child.id === 'victory-final';
                if (!isVictoryScreen) {
                    child.style.display = 'none';
                }
            });
        }

        function showFeedback(element, type, message) {
            element.className = `feedback ${type}`;
            element.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'times'}"></i> ${message}`;
            element.style.display = 'block';
        }

        function selectOption(element, level = gameState.currentLevel, questionIndex = null) {
            const parentContainer = element.closest('.options-container') || element.closest('.options');

            if (parentContainer) {
                parentContainer.querySelectorAll('.option').forEach(opt => {
                    opt.classList.remove('selected');
                });
            }

            element.classList.add('selected');

            // Store selected answer for different level mechanics
            if (level === 2) {
                gameState.levelStates[2].selectedAnswer = element;
            } else if (level === 3) {
                gameState.levelStates[3].selectedAnswer = element;
            } else if (level === 4) {
                gameState.levelStates[4].selectedAnswer = element;
            } else if (level === 5) {
                gameState.levelStates[5].selectedAnswer = element;
            }
        }

        // ==============================================
        // NIVEL 1 - EL PISO DE LOS JUECES
        // ==============================================
        function showChallenge(challengeNum) {
            // Hide all challenges first
            for (let i = 1; i <= 3; i++) {
                const challengeEl = document.getElementById(`challenge${i}`);
                if (challengeEl) challengeEl.style.display = 'none';
                const feedbackEl = document.getElementById(`feedback${i}`);
                if (feedbackEl) feedbackEl.style.display = 'none';
            }

            const challenge = document.getElementById(`challenge${challengeNum}`);
            if (challenge) challenge.style.display = 'block';

            // Clear selected state for options for the new challenge
            if (challenge) {
                challenge.querySelectorAll('.option').forEach(opt => {
                    opt.classList.remove('selected');
                });
            }

            updateProgressLevel1();
        }

        function updateProgressLevel1() {
            const progress = (gameState.challengeProgress / 3) * 100;
            document.getElementById('progress-level1').style.width = `${progress}%`;
            document.getElementById('progress-text-level1').textContent =
                `${gameState.challengeProgress}/3 desafíos completados`;
        }

        function validateChallenge(challengeNum) {
            const container = document.getElementById(`challenge${challengeNum}`);
            const selectedOption = container.querySelector('.option.selected');
            const feedback = document.getElementById(`feedback${challengeNum}`);

            if (!selectedOption) {
                showFeedback(feedback, 'error', 'Por favor selecciona una respuesta');
                return;
            }

            let isCorrect = false;
            let correctAnswerText = ''; // To display the correct answer text in feedback

            switch (challengeNum) {
                case 1:
                    isCorrect = selectedOption.textContent.includes('A) 15');
                    correctAnswerText = 'A) 15';
                    break;
                case 2:
                    isCorrect = selectedOption.textContent.includes('A) Puede conducir');
                    correctAnswerText = 'A) Puede conducir';
                    break;
                case 3:
                    isCorrect = selectedOption.textContent.includes('B) 4');
                    correctAnswerText = 'B) 4';
                    break;
            }

            if (isCorrect) {
                showFeedback(feedback, 'success', `¡Correcto! Respuesta: ${correctAnswerText}`);
                gameState.challengeProgress++;
                updateProgressLevel1();

                if (challengeNum < 3) {
                    setTimeout(() => showChallenge(challengeNum + 1), 1500);
                } else {
                    setTimeout(() => completeLevel(1), 1500);
                }
            } else {
                showFeedback(feedback, 'error', `Incorrecto. La respuesta correcta era: ${correctAnswerText}`);
                loseLife();
            }
        }

        // ==============================================
        // NIVEL 2 - LAS GRADAS DEL OLVIDO
        // ==============================================
        function validateLevel2() {
            const selectedOptionElement = gameState.levelStates[2].selectedAnswer; // Get the selected element
            const feedback = document.getElementById('feedback-level2');

            if (!selectedOptionElement) {
                showFeedback(feedback, 'error', 'Por favor selecciona una respuesta');
                return;
            }

            // Check the text content of the selected option
            const isCorrect = selectedOptionElement.textContent.includes('C) 1980');
            const correctAnswerText = 'C) 1980'; // The correct answer's text

            if (isCorrect) {
                showFeedback(feedback, 'success', `¡Correcto! Respuesta: ${correctAnswerText}`);
                setTimeout(() => completeLevel(2), 1500);
            } else {
                showFeedback(feedback, 'error', `Incorrecto. La respuesta correcta era: ${correctAnswerText}`);
                loseLife();
            }
        }

        // ==============================================
        // NIVEL 3 - LABORATORIO DE ALGORITMOS
        // ==============================================
        const questionsLevel3 = [
            {
                code: `function mystery(arr) {\n  return arr.reduce((a, b) => a + b, 0) / arr.length;\n}\n\nconsole.log(mystery([1, 2, 3, 4, 5]));`,
                options: ["3", "15", "1", "Error"],
                correctAnswerIndex: 0 // Index of the correct answer in the options array
            },
            {
                code: `let x = 10;\n\nfunction change() {\n  let x = 20;\n}\n\nchange();\nconsole.log(x);`,
                options: ["10", "20", "undefined", "Error"],
                correctAnswerIndex: 0
            }
        ];

        function initNivel3() {
            showQuestionLevel3();
            document.getElementById('next-level3').onclick = checkAnswerLevel3; // Changed to check current question
            document.getElementById('next-level3').textContent = 'Validar'; // Initial text
        }

        function showQuestionLevel3() {
            const state = gameState.levelStates[3];
            const question = questionsLevel3[state.currentQuestion];

            document.getElementById('code-level3').textContent = question.code;

            const optionsDiv = document.getElementById('options-level3');
            optionsDiv.innerHTML = ''; // Clear previous options

            question.options.forEach((option, index) => {
                const button = document.createElement('div');
                button.className = 'option';
                button.textContent = `${String.fromCharCode(65 + index)}) ${option}`;
                button.onclick = () => { playButtonSound(); selectOption(button, 3); };
                optionsDiv.appendChild(button);
            });

            document.getElementById('result-level3').textContent = '';
            document.getElementById('result-level3').className = 'result'; // Reset class
            document.getElementById('next-level3').style.display = 'block'; // Ensure button is visible
            document.getElementById('next-level3').textContent = 'Validar'; // Reset button text
            gameState.levelStates[3].selectedAnswer = null; // Clear selected answer for new question
        }

        function checkAnswerLevel3() { // No longer takes selectedIndex directly
            const state = gameState.levelStates[3];
            const question = questionsLevel3[state.currentQuestion];
            const resultElement = document.getElementById('result-level3');
            const nextBtn = document.getElementById('next-level3');
            const selectedOptionElement = state.selectedAnswer;

            if (!selectedOptionElement) {
                showFeedback(resultElement, 'error', 'Por favor selecciona una respuesta');
                return;
            }

            // Get the index of the selected option
            const optionsDiv = document.getElementById('options-level3');
            const allOptions = Array.from(optionsDiv.children);
            const selectedIndex = allOptions.indexOf(selectedOptionElement);


            if (selectedIndex === question.correctAnswerIndex) {
                resultElement.textContent = "¡Correcto!";
                resultElement.className = 'result success';
                nextBtn.textContent = 'Siguiente'; // Change button text
                nextBtn.onclick = nextQuestionLevel3; // Change button function to advance
            } else {
                resultElement.textContent = `Incorrecto. La respuesta correcta era: ${question.options[question.correctAnswerIndex]}`;
                resultElement.className = 'result error';
                loseLife();
                nextBtn.textContent = 'Reintentar'; // Offer retry
                nextBtn.onclick = () => { // Reset for retry
                    showQuestionLevel3();
                    document.getElementById('next-level3').onclick = checkAnswerLevel3;
                };
            }
            nextBtn.style.display = 'block';
        }

        function nextQuestionLevel3() {
            const state = gameState.levelStates[3];
            state.currentQuestion++;

            if (state.currentQuestion < questionsLevel3.length) {
                showQuestionLevel3();
            } else {
                completeLevel(3);
            }
        }

        // ==============================================
        // NIVEL 4 - LABERINTO DE LA LÓGICA ROTA
        // ==============================================
        const level4States = {
            inicio: {
                texto: "Te encuentras en la entrada del laberinto de la lógica rota. Hay dos caminos frente a ti: uno marcado con 'Promesas' y otro con 'Errores'. ¿Cuál eliges?",
                opciones: [
                    { text: "A) Entrar al camino de las Promesas", nextState: "promesas" },
                    { text: "B) Atravesar el camino de los Errores", nextState: "errores" }
                ],
                correctChoiceIndex: null, // No "correct" choice here, both lead to next decision
                feedback: null
            },
            promesas: {
                texto: "Has elegido el camino de las Promesas. Ahora debes decidir si aceptar o rechazar una promesa. ¿Aceptas?",
                opciones: [
                    { text: "A) Sí, Aceptar la promesa", nextState: "aceptar" },
                    { text: "B) No, Rechazar la promesa", nextState: "rechazar" }
                ],
                correctChoiceIndex: 0, // Aceptar es el correcto
                feedback: null
            },
            aceptar: {
                texto: "Has aceptado la promesa. ¡Correcto! La promesa se resuelve y avanzas.",
                opciones: [{ text: "Continuar", nextState: "ganar" }],
                correctChoiceIndex: 0,
                feedback: 'success'
            },
            rechazar: {
                texto: "Has rechazado la promesa. Esto te lleva a un callejón sin salida. Pierdes una vida.",
                opciones: [{ text: "Volver al inicio del laberinto", nextState: "inicio" }],
                correctChoiceIndex: null, // This is always a losing path, no "correct" choice within it
                feedback: 'error'
            },
            errores: {
                texto: "Has elegido el camino de los Errores. Encuentras un bloque try-catch. ¿Intentas atrapar el error o lo dejas propagar?",
                opciones: [
                    { text: "A) Atrapar el error", nextState: "atrapar" },
                    { text: "B) Dejar propagar el error", nextState: "propagar" }
                ],
                correctChoiceIndex: 0, // Atrapar es el correcto
                feedback: null
            },
            atrapar: {
                texto: "Atrapas el error correctamente. ¡Bien hecho! Avanzas por el laberinto.",
                opciones: [{ text: "Continuar", nextState: "ganar" }],
                correctChoiceIndex: 0,
                feedback: 'success'
            },
            propagar: {
                texto: "Dejas propagar el error. Esto causa un fallo en el sistema y pierdes una vida.",
                opciones: [{ text: "Volver al inicio del laberinto", nextState: "inicio" }],
                correctChoiceIndex: null, // Always a losing path
                feedback: 'error'
            },
            ganar: {
                texto: "¡Felicidades! Has navegado exitosamente por el laberinto de la lógica rota.",
                opciones: [], // No options as level ends
                correctChoiceIndex: null,
                feedback: 'success'
            }
        };

        function loadLevel4State(stateKey) {
            const stateDef = level4States[stateKey];
            gameState.levelStates[4].currentState = stateKey;
            gameState.levelStates[4].selectedAnswer = null; // Clear previous selection

            const textoNivel4 = document.getElementById('texto-nivel4');
            const botonesNivel4 = document.getElementById('botones-nivel4');
            const resultLevel4 = document.getElementById('result-level4');
            const validateBtn = document.getElementById('validate-level4-btn');

            textoNivel4.textContent = stateDef.texto;
            botonesNivel4.innerHTML = '';
            showFeedback(resultLevel4, '', ''); // Clear previous feedback

            stateDef.opciones.forEach((option, index) => {
                const btn = document.createElement('div');
                btn.className = 'option';
                btn.textContent = option.text;
                btn.onclick = () => {
                    playButtonSound();
                    selectOption(btn, 4); // Just select the option, validation is separate
                };
                botonesNivel4.appendChild(btn);
            });

            if (stateKey === 'ganar') {
                showFeedback(resultLevel4, 'success', stateDef.texto);
                validateBtn.style.display = 'none';
                botonesNivel4.style.display = 'none';
                setTimeout(() => completeLevel(4), 2000);
            } else {
                botonesNivel4.style.display = 'grid'; // Ensure options are visible
                validateBtn.innerHTML = '<i class="fas fa-check"></i> Validar Ruta';
                validateBtn.onclick = () => { playButtonSound(); validateLevel4(); };
                validateBtn.style.display = 'block';
            }
        }

        function validateLevel4() {
            const state = gameState.levelStates[4];
            const currentStateDef = level4States[state.currentState];
            const selectedOptionElement = state.selectedAnswer;
            const resultElement = document.getElementById('result-level4');

            if (!selectedOptionElement) {
                showFeedback(resultElement, 'error', 'Por favor selecciona una ruta.');
                return;
            }

            const optionsDiv = document.getElementById('botones-nivel4');
            const allOptions = Array.from(optionsDiv.children);
            const selectedIndex = allOptions.indexOf(selectedOptionElement);

            if (selectedIndex === -1) {
                showFeedback(resultElement, 'error', 'Error interno: opción no encontrada.');
                return;
            }

            const chosenNextStateKey = currentStateDef.opciones[selectedIndex].nextState;
            let isCorrectChoice = false;

            // Logic to determine if the chosen path is correct for the current state
            if (currentStateDef.correctChoiceIndex === null) {
                // If current state has no specific 'correct' choice (e.g., 'inicio'), any selection just advances the path
                isCorrectChoice = true;
            } else {
                isCorrectChoice = (selectedIndex === currentStateDef.correctChoiceIndex);
            }

            if (isCorrectChoice) {
                showFeedback(resultElement, 'success', 'Ruta correcta. ¡Avanzas!');
                setTimeout(() => loadLevel4State(chosenNextStateKey), 1000);
            } else {
                showFeedback(resultElement, 'error', 'Ruta incorrecta. Pierdes una vida.');
                loseLife();
                // Even if incorrect, we still transition to the 'losing' state defined by the option
                setTimeout(() => loadLevel4State(chosenNextStateKey), 1000);
            }
        }

        // ==============================================
        // NIVEL 5 - REPOSITORIO FANTASMA
        // ==============================================
        const questionsLevel5 = [
            {
                code: `// Operación CREATE\nfunction create(entity, data) {\n  entity.push(data);\n  return entity;\n}`,
                options: [
                    "A) Agrega un elemento al final",
                    "B) Agrega un elemento al principio",
                    "C) Elimina el último elemento",
                    "D) Elimina el primer elemento"
                ],
                correctAnswerIndex: 0
            },
            {
                code: `// Operación UPDATE\nfunction update(id, newData, array) {\n  const index = array.findIndex(item => item.id === id);\n  if (index !== -1) {\n    array[index] = { ...array[index], ...newData };\n    return array;\n  }\n  return array;\n}`,
                options: [
                    "A) Actualiza un elemento por id",
                    "B) Crea un nuevo elemento",
                    "C) Elimina un elemento por id",
                    "D) Filtra los elementos"
                ],
                correctAnswerIndex: 0
            },
            {
                code: `// Operación DELETE\nfunction remove(id, array) {\n  return array.filter(item => item.id !== id);\n}`,
                options: [
                    "A) Elimina elementos que no coinciden con el id",
                    "B) Elimina el primer elemento",
                    "C) Elimina el último elemento",
                    "D) Agrega un nuevo elemento"
                ],
                correctAnswerIndex: 0
            },
            {
                code: `// Operación READ\nfunction read(array, filterFn = null) {\n  if (filterFn) {\n    return array.filter(filterFn);\n  }\n  return array;\n}`,
                options: [
                    "A) Devuelve todos los elementos o filtra por una función",
                    "B) Lee el primer elemento",
                    "C) Devuelve un solo elemento por id",
                    "D) Crea un duplicado del array"
                ],
                correctAnswerIndex: 0
            }
        ];

        function initNivel5() {
            showQuestionLevel5();
            document.getElementById('next-level5').onclick = checkAnswerLevel5;
            document.getElementById('next-level5').textContent = 'Validar'; // Initial text
        }

        function showQuestionLevel5() {
            const state = gameState.levelStates[5];
            const question = questionsLevel5[state.currentQuestion];

            document.getElementById('code-level5').textContent = question.code;

            const optionsDiv = document.getElementById('options-level5');
            optionsDiv.innerHTML = ''; // Clear previous options

            question.options.forEach((option, index) => {
                const button = document.createElement('div');
                button.className = 'option';
                button.textContent = option; // Option already includes A), B), etc.
                button.onclick = () => { playButtonSound(); selectOption(button, 5); };
                optionsDiv.appendChild(button);
            });

            document.getElementById('result-level5').textContent = '';
            document.getElementById('result-level5').className = 'result'; // Reset class
            document.getElementById('next-level5').style.display = 'block'; // Ensure button is visible
            document.getElementById('next-level5').textContent = 'Validar'; // Reset button text
            gameState.levelStates[5].selectedAnswer = null; // Clear selected answer for new question
        }

        function checkAnswerLevel5() {
            const state = gameState.levelStates[5];
            const question = questionsLevel5[state.currentQuestion];
            const resultElement = document.getElementById('result-level5');
            const nextBtn = document.getElementById('next-level5');
            const selectedOptionElement = state.selectedAnswer;

            if (!selectedOptionElement) {
                showFeedback(resultElement, 'error', 'Por favor selecciona una respuesta');
                return;
            }

            const optionsDiv = document.getElementById('options-level5');
            const allOptions = Array.from(optionsDiv.children);
            const selectedIndex = allOptions.indexOf(selectedOptionElement);

            if (selectedIndex === question.correctAnswerIndex) {
                resultElement.textContent = "¡Correcto!";
                resultElement.className = 'result success';
                nextBtn.textContent = 'Siguiente';
                nextBtn.onclick = nextQuestionLevel5;
            } else {
                resultElement.textContent = `Incorrecto. La respuesta correcta era: ${question.options[question.correctAnswerIndex]}`;
                resultElement.className = 'result error';
                loseLife();
                nextBtn.textContent = 'Reintentar';
                nextBtn.onclick = () => {
                    showQuestionLevel5();
                    document.getElementById('next-level5').onclick = checkAnswerLevel5;
                };
            }
            nextBtn.style.display = 'block';
        }

        function nextQuestionLevel5() {
            const state = gameState.levelStates[5];
            state.currentQuestion++;

            if (state.currentQuestion < questionsLevel5.length) {
                showQuestionLevel5();
            } else {
                completeLevel(5); // Final level completed
            }
        }

        // ==============================================
        // FUNCIONES DE CONTROL DE PÁGINA Y REINICIO
        // ==============================================

        function getStoryContent(level) {
            const historias = {
                1: {
                    titulo: "🎮 Prólogo: El Login Maldito",
                    content: `<p>Un grupo de jóvenes desarrolladores entra a Riwi una noche de hackatón. Todo es emoción, memes y códigos rotos… hasta que un retador extraño aparece en el sistema central. No tiene interfaz. Solo un mensaje en binario:</p>
                              <div class="story-binary">BIN: 01000010 01101001 01101110 01100001 01110010 01101001 01101111</div>
                              <div class="story-code">(Significa: PELIGRO);</div>`
                },
                2: {
                    titulo: "🎮 Prólogo: El Sistema Infectado",
                    content: `<p>Uno por uno, los equipos son absorbidos digitalmente por un entorno simulado: el CORE de CRUDY. Cada piso de Riwi ha sido replicado virtualmente, retorcido en glitches visuales, loops de pantallas y ecos desde los baños del tercer piso que gritan:</p>
                              <div class="story-code">"Syntax Error";</div>`
                },
                3: {
                    titulo: "Nivel 3: Laboratorio de Algoritmos - CRITICAL HIT",
                    content: `<p>Subes al tercer piso. La zona de juegos… no está vacía. CRUDY la ha convertido en un espacio glitcheado, con playstations oxidadas, fichas que tiemblan en la mesa de billar, y una pantalla gigante que dice 'PRESS ANY KEY TO SCREAM'.</p>
                              <p>Los algoritmos han sido saboteados. Restaura la lógica del sistema resolviendo estos desafíos de programación.</p>`
                },
                4: {
                    titulo: "Nivel 4: Laberinto de la Lógica Rota",
                    content: `<p>Te adentras en un laberinto de código corrupto. Cada decisión que tomes puede llevarte más cerca de la salida o sumergirte en un bucle infinito. CRUDY ha distorsionado la lógica, y solo tu ingenio puede restaurarla.</p>
                              <p>Encuentra el camino correcto a través de este laberinto de decisiones.</p>`
                },
                5: {
                    titulo: "Nivel 5: Repositorio Fantasma - El Commit Final",
                    content: `<p>Has llegado al corazón del sistema. Aquí yace el repositorio fantasma, donde CRUDY guarda sus códigos más corruptos. Debes reconstruir el CRUD distorsionado para liberar el sistema.</p>
                              <p>Cada acción que realices aquí desencadenará efectos mentales, pero es la única forma de restaurar el orden.</p>`
                }
            };

            return historias[level] || { titulo: "", content: "" };
        }

        function showMainPage() {
            hideAllPages();
            document.getElementById('main-page').style.display = 'block';
        }

        function restartGame() {
            gameState.lives = 5;
            gameState.completedLevels = [false, false, false, false, false]; // Reset all to locked except the first one in initGame
            gameState.currentLevel = 1;
            gameState.challengeProgress = 0;
            gameState.levelStates = { // Reset all level-specific states
                1: { currentChallenge: 1, answers: {} },
                2: { selectedAnswer: null },
                3: { currentQuestion: 0, selectedAnswer: null },
                4: { currentState: 'inicio', selectedAnswer: null },
                5: { currentQuestion: 0, selectedAnswer: null }
            };

            initGame(); // Re-initialize the game to set up cards and lives
            showMainPage(); // Go back to main page
        }

        // Variables globales necesarias
        let musicEnabled = true;
        const bgMusic = document.getElementById('bgMusic');
        const buttonSound = document.getElementById('buttonSound');
        const soundButton = document.getElementById('soundButton');

        function playButtonSound() {
            if (!musicEnabled) return;
            buttonSound.currentTime = 0;
            buttonSound.play().catch(e => console.log("No se pudo reproducir el sonido:", e));
        }

        function toggleSound() {
            musicEnabled = !musicEnabled;

            if (musicEnabled) {
                bgMusic.play().catch(e => console.log("No se pudo iniciar la música:", e));
                soundButton.innerHTML = '<i class="fas fa-volume-up"></i>';
            } else {
                bgMusic.pause();
                soundButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
        }

        function tryPlayBackgroundMusic() {
            // Attempt to play music on first user interaction
            document.addEventListener('click', function initAudio() {
                if (musicEnabled) {
                    bgMusic.play().catch(e => console.log("No se pudo iniciar la música:", e));
                }
                document.removeEventListener('click', initAudio);
            }, { once: true }); // Only run once
        }
