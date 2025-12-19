document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica para o Menu Hambúrguer ---
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.main-nav .nav-link'); // Seleciona todos os links do menu

    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', function() {
            mainNav.classList.toggle('open'); // Alterna a classe 'open' no menu
            hamburgerBtn.classList.toggle('active'); // Alterna a classe 'active' no hambúrguer para animação

            // Adicionar/remover classe no body para evitar scroll quando o menu estiver aberto
            document.body.classList.toggle('no-scroll');

            // Atualiza o atributo aria-expanded para acessibilidade
            const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
            hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
        });

        // Fechar o menu ao clicar em um item do menu (se for um menu overlay)
        navLinks.forEach(item => {
            item.addEventListener('click', () => {
                if (mainNav.classList.contains('open')) {
                    mainNav.classList.remove('open');
                    hamburgerBtn.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                    hamburgerBtn.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
    // --- FIM Lógica para o Menu Hambúrguer ---

    // --- Lógica para copiar CPF PIX ---
    const copyPixCpfBtn = document.getElementById('copy-pix-cpf-btn');
    const pixCpfValueSpan = document.getElementById('pix-cpf-value');
    const copyFeedbackMessage = document.getElementById('copy-feedback-message');

    if (copyPixCpfBtn && pixCpfValueSpan && copyFeedbackMessage) {
        copyPixCpfBtn.addEventListener('click', () => {
            const cpfToCopy = pixCpfValueSpan.textContent.trim(); // Pega o texto do span do CPF

            // Usa a API Clipboard assíncrona (moderna)
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(cpfToCopy)
                    .then(() => {
                        copyFeedbackMessage.textContent = 'CPF Copiado!';
                        copyFeedbackMessage.classList.add('show');
                        copyPixCpfBtn.textContent = 'Copiado!'; // Texto temporário do botão
                        setTimeout(() => {
                            copyFeedbackMessage.textContent = '';
                            copyFeedbackMessage.classList.remove('show');
                            copyPixCpfBtn.textContent = 'Copiar CPF'; // Volta ao texto original do botão
                        }, 2000); // Mensagem some após 2 segundos
                    })
                    .catch(err => {
                        console.error('Erro ao copiar o CPF: ', err);
                        copyFeedbackMessage.textContent = 'Erro ao copiar.';
                        copyFeedbackMessage.classList.add('show');
                        setTimeout(() => {
                            copyFeedbackMessage.textContent = '';
                            copyFeedbackMessage.classList.remove('show');
                        }, 2000);
                    });
            } else {
                // Fallback para navegadores mais antigos (usando document.execCommand)
                const tempInput = document.createElement('textarea'); // Usar textarea para melhor compatibilidade
                tempInput.value = cpfToCopy;
                document.body.appendChild(tempInput);
                tempInput.select();
                try {
                    document.execCommand('copy');
                    copyFeedbackMessage.textContent = 'CPF Copiado!';
                    copyFeedbackMessage.classList.add('show');
                    copyPixCpfBtn.textContent = 'Copiado!'; // Texto temporário do botão
                    setTimeout(() => {
                        copyFeedbackMessage.textContent = '';
                        copyFeedbackMessage.classList.remove('show');
                        copyPixCpfBtn.textContent = 'Copiar CPF'; // Volta ao texto original do botão
                    }, 2000);
                } catch (err) {
                    console.error('Erro ao copiar o CPF (fallback): ', err);
                    copyFeedbackMessage.textContent = 'Erro ao copiar. Por favor, copie manualmente.';
                    copyFeedbackMessage.classList.add('show');
                    setTimeout(() => {
                        copyFeedbackMessage.textContent = '';
                        copyFeedbackMessage.classList.remove('show');
                    }, 2000);
                }
                document.body.removeChild(tempInput);
            }
        });
    }
    // --- FIM Lógica para copiar CPF PIX ---

    // Smooth scroll para os links do menu
    document.querySelectorAll('.nav-link').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Função auxiliar para formatar valores monetários
    function formatCurrency(amount) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
    }

    // Lógica para carregar e exibir as metas e dados de arrecadação
    fetch('/static/goals.json')
        .then(response => response.json())
        .then(data => {
            const currentRaised = data.current_raised;
            const totalSupporters = data.total_supporters;
            const goals = data.goals;

            // --- Atualizar Painel de Arrecadação na seção Home ---
            const totalGoalHomePanel = 320000.00; // Meta total fixa para o painel da Home
            document.getElementById('panel-current-raised-amount').textContent = formatCurrency(currentRaised).replace('R\$', '').trim(); // Remove R\$ para usar no span
            document.getElementById('panel-total-supporters').textContent = totalSupporters;

            let progressPercentageHomePanel = (currentRaised / totalGoalHomePanel) * 100;
            progressPercentageHomePanel = Math.min(progressPercentageHomePanel, 100); // Garante que a barra não passe de 100%

            document.getElementById('panel-progress-bar').style.width = `${progressPercentageHomePanel}%`;
            document.getElementById('panel-percentage-achieved').textContent = Math.round(progressPercentageHomePanel);

            // --- Atualizar seção Metas ---
            let totalTarget = 0;
            goals.forEach(goal => {
                totalTarget += goal.target_amount;
            });

            document.getElementById('current-raised-amount').textContent = formatCurrency(currentRaised);
            document.getElementById('remaining-amount').textContent = formatCurrency(Math.max(0, totalTarget - currentRaised)); // Garante que não mostre valor negativo

            const goalsList = document.getElementById('goals-list');
            goalsList.innerHTML = ''; // Limpa qualquer conteúdo existente

            goals.forEach(goal => {
                const goalElement = document.createElement('div');
                goalElement.classList.add('goal-item');

                const progress = Math.min((currentRaised / goal.target_amount) * 100, 100);
                const goalAchievedAmount = Math.min(currentRaised, goal.target_amount);
                const goalRemainingAmount = Math.max(0, goal.target_amount - currentRaised);

                goalElement.innerHTML = `
                    <h3>${goal.name}</h3>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progress}%">
                           ${progress > 5 ? `<span class="progress-text">${Math.round(progress)}%</span>` : ''}
                        </div>
                    </div>
                    <div class="goal-details">
                        <span>Meta: ${formatCurrency(goal.target_amount)}</span>
                        <span>Arrecadado: ${formatCurrency(goalAchievedAmount)}</span>
                        <span>Falta: ${formatCurrency(goalRemainingAmount)}</span>
                    </div>
                `;
                goalsList.appendChild(goalElement);
            });
        })
        .catch(error => console.error('Erro ao carregar as metas:', error));


    // --- Lógica para inicializar múltiplos Carrosséis de Imagens (ATUALIZADO E REVISADO) ---
    function initializeCarousel(carouselContainer) {
        const carouselSlide = carouselContainer.querySelector('.carousel-slide');
        const carouselImages = carouselContainer.querySelectorAll('.carousel-slide .carousel-image');
        const carouselDots = carouselContainer.querySelectorAll('.carousel-dots .dot');
        const prevBtn = carouselContainer.querySelector('.carousel-button.prev');
        const nextBtn = carouselContainer.querySelector('.carousel-button.next');

        let currentIndex = 0;
        const totalImages = carouselImages.length;
        const intervalTime = 5000; // Tempo em milissegundos (5 segundos) para a troca de imagem
        let slideInterval; // Variável para controlar o intervalo automático

        let startX = 0; // Posição X inicial do toque
        let currentTranslate = 0; // Posição atual do carrossel
        let prevTranslate = 0; // Posição anterior do carrossel
        let isDragging = false;
        const swipeThreshold = 50; // Mínimo de pixels para considerar um swipe

        if (totalImages === 0) {
            return;
        }

        // Garante que o carrossel é "arrastável" no eixo X para detectar o swipe
        carouselSlide.style.touchAction = 'pan-y';
        carouselSlide.style.transition = 'transform 0.5s ease-in-out'; // Re-adiciona a transição via JS para controle

        function setSliderPosition() {
            carouselSlide.style.transform = `translateX(${currentTranslate}px)`;
        }

        function updateCarousel(instant = false) {
            currentTranslate = -currentIndex * carouselSlide.clientWidth; // Calcula a nova posição baseada no índice e largura da imagem
            if (instant) {
                carouselSlide.style.transition = 'none'; // Remove transição para pulo instantâneo
                setSliderPosition();
                // Forçar um reflow para garantir que a transição seja removida antes de reativá-la
                carouselSlide.offsetWidth;
                carouselSlide.style.transition = 'transform 0.5s ease-in-out'; // Re-ativa transição
            } else {
                setSliderPosition();
            }

            carouselDots.forEach((dot, i) => {
                dot.classList.remove('active');
                if (i === currentIndex) {
                    dot.classList.add('active');
                }
            });
        }

        // FUNÇÕES PARA CONTROLE DO TEMPORIZADOR AUTOMÁTICO
        function startAutoSlide() {
            clearInterval(slideInterval); // Limpa qualquer temporizador existente
            slideInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % totalImages;
                updateCarousel();
            }, intervalTime);
        }

        function stopAutoSlide() {
            clearInterval(slideInterval); // Para o temporizador automático
        }

        // Inicializa o carrossel na posição 0 e inicia o auto-slide
        updateCarousel(true); // Atualiza instantaneamente para garantir a posição inicial correta
        startAutoSlide();

        // ADICIONA FUNCIONALIDADE AOS BOTÕES DE NAVEGAÇÃO
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                stopAutoSlide(); // Para o auto-slide
                currentIndex = (currentIndex - 1 + totalImages) % totalImages;
                updateCarousel();
                startAutoSlide(); // Reinicia o auto-slide
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                stopAutoSlide(); // Para o auto-slide
                currentIndex = (currentIndex + 1) % totalImages;
                updateCarousel();
                startAutoSlide(); // Reinicia o auto-slide
            });
        }

        // ADICIONA FUNCIONALIDADE AOS PONTINHOS (dots)
        carouselDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                stopAutoSlide(); // Para o auto-slide
                currentIndex = index;
                updateCarousel();
                startAutoSlide(); // Reinicia o auto-slide
            });
        });

        // --- FUNCIONALIDADE DE SWIPE (arrastar) ---
        carouselSlide.addEventListener('touchstart', (e) => {
            stopAutoSlide(); // Para o auto-slide ao iniciar o toque
            startX = e.touches[0].clientX;
            isDragging = true;
            prevTranslate = currentTranslate; // Guarda a posição atual antes de começar a arrastar
            carouselSlide.style.transition = 'none'; // Remove transição para arrasto suave
        });

        carouselSlide.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const currentX = e.touches[0].clientX;
            const diffX = currentX - startX;
            currentTranslate = prevTranslate + diffX; // Move o slide junto com o dedo

            // Limita o arrasto para não ir muito além dos limites
            const maxTranslate = 0;
            const minTranslate = -(totalImages - 1) * carouselSlide.clientWidth;
            currentTranslate = Math.max(minTranslate - swipeThreshold, Math.min(maxTranslate + swipeThreshold, currentTranslate));

            setSliderPosition(); // Atualiza a posição visual
        });

        carouselSlide.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            carouselSlide.style.transition = 'transform 0.5s ease-in-out'; // Re-ativa transição

            const movedBy = currentTranslate - prevTranslate; // Quanto o slide se moveu do ponto inicial do arrasto

            if (movedBy < -swipeThreshold) { // Arrasto para a esquerda (próximo slide)
                currentIndex = (currentIndex + 1) % totalImages;
            } else if (movedBy > swipeThreshold) { // Arrasto para a direita (slide anterior)
                currentIndex = (currentIndex - 1 + totalImages) % totalImages;
            }
            // Se o movimento não atingiu o threshold, o currentIndex permanece o mesmo
            // e a imagem retornará à sua posição original.

            updateCarousel(); // Atualiza para a posição final correta (com transição)
            startAutoSlide(); // Reinicia o auto-slide após o toque terminar
        });

        carouselSlide.addEventListener('touchcancel', () => { // Caso o toque seja cancelado
            isDragging = false;
            carouselSlide.style.transition = 'transform 0.5s ease-in-out';
            updateCarousel(); // Volta para a posição atual sem mudar o slide
            startAutoSlide();
        });


        // Adiciona funcionalidade para parar e reiniciar o carrossel no hover (desktop)
        carouselContainer.addEventListener('mouseenter', stopAutoSlide);
        carouselContainer.addEventListener('mouseleave', startAutoSlide);

        // Atualiza a posição do carrossel caso a janela seja redimensionada
        window.addEventListener('resize', () => updateCarousel(true));
    }

    // Inicializa todos os carrosséis encontrados na página
    document.querySelectorAll('.carousel-container').forEach(carousel => {
        initializeCarousel(carousel);
    });
});