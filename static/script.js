document.addEventListener('DOMContentLoaded', () => {
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
            const totalGoalHomePanel = 300000.00; // Meta total fixa para o painel da Home
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


    // Lógica para inicializar múltiplos Carrosséis de Imagens
    function initializeCarousel(carouselContainer) {
        const carouselSlide = carouselContainer.querySelector('.carousel-slide');
        const carouselImages = carouselContainer.querySelectorAll('.carousel-slide .carousel-image');
        const carouselDots = carouselContainer.querySelectorAll('.carousel-dots .dot');

        let currentIndex = 0;
        const totalImages = carouselImages.length;
        const intervalTime = 4000; // Tempo em milissegundos (4 segundos) para a troca de imagem

        if (totalImages === 0) { // Se não houver imagens, não inicializa o carrossel
            return;
        }

        function updateCarousel() {
            if (carouselSlide) { // Verifica se carouselSlide existe antes de manipular
                carouselSlide.style.transform = `translateX(-${currentIndex * 100}%)`;
            }

            carouselDots.forEach((dot, i) => {
                dot.classList.remove('active');
                if (i === currentIndex) {
                    dot.classList.add('active');
                }
            });
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalImages;
            updateCarousel();
        }

        // Inicia o carrossel automático
        let slideInterval = setInterval(nextSlide, intervalTime);

        // Adiciona funcionalidade aos pontinhos (dots)
        carouselDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
                // Reseta o timer do carrossel automático ao clicar em um dot
                clearInterval(slideInterval);
                slideInterval = setInterval(nextSlide, intervalTime);
            });
        });
    }

    // Inicializa todos os carrosséis encontrados na página
    document.querySelectorAll('.carousel-container').forEach(carousel => {
        initializeCarousel(carousel);
    });
});