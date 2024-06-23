class Abelha {
    constructor(gl, pathTexturaCorpo, pathTexturaAsas, posicaoInicial = vec3(0, 0, 0)) {
        // posição inicial da abelha
        this.posicaoInicial = posicaoInicial;

        // cria o corpo da abelha
        this.corpo = new Elemento(new Esfera(2, 1), gl, pathTexturaCorpo);
        this.corpo.escala = vec3(0.5, 0.5, 1); // escalar para formar o corpo da abelha
        this.corpo.trans = posicaoInicial; // posicionar o corpo na posição inicial
        this.corpo.theta = vec3(90, 0, 0);
        this.corpo.vTheta = vec3(0, 0, 0);
        this.corpo.cor.ambiente = vec4(0.8, 0.8, 0.8, 1);
        this.corpo.cor.difusa = vec4(1, 1, 1, 1);
        this.corpo.cor.especular = 50.0;

        // cria asa esquerda
        this.asaEsquerda = new Elemento(new Piramide(1), gl, pathTexturaAsas);
        this.asaEsquerda.escala = vec3(0.2, 0.4, 0.1); // escalar para formar a asa
        this.asaEsquerda.trans = add(posicaoInicial, vec3(-0.6, 0, 0)); // posicionar a asa à esquerda do corpo
        this.asaEsquerda.theta = vec3(90, 0, -90); // rotacionar a asa
        this.asaEsquerda.vTheta = vec3(0, 0, 0);
        this.asaEsquerda.cor.ambiente = vec4(0.8, 0.8, 0.8, 1);
        this.asaEsquerda.cor.difusa = vec4(1, 1, 1, 1);
        this.asaEsquerda.cor.especular = 50.0;

        // cria asa direita
        this.asaDireita = new Elemento(new Piramide(1), gl, pathTexturaAsas);
        this.asaDireita.escala = vec3(0.25, 0.4, 0.1); // escalar para formar a asa
        this.asaDireita.trans = add(posicaoInicial, vec3(0.6, 0, 0)); // posicionar a asa à direita do corpo
        this.asaDireita.theta = vec3(90, 0, 90); // rotacionar a asa
        this.asaDireita.vTheta = vec3(0, 0, 0);
        this.asaDireita.cor.ambiente = vec4(0.8, 0.8, 0.8, 1);
        this.asaDireita.cor.difusa = vec4(1, 1, 1, 1);
        this.asaDireita.cor.especular = 50.0;

        // cria antena esquerda
        this.antenaEsquerda = new Elemento(new Cilindro(8), gl, null);
        this.antenaEsquerda.escala = vec3(0.05, 0.05, 0.3); // escalar para formar a antena
        this.antenaEsquerda.trans = add(posicaoInicial, vec3(-0.4, 0.2, 0.3)); // posicionar a antena à esquerda do corpo
        this.antenaEsquerda.theta = vec3(90, 0, 40); // rotacionar a antena
        this.antenaEsquerda.vTheta = vec3(0, 0, 0);
        this.antenaEsquerda.cor.ambiente = vec4(0.8, 0.8, 0.8, 1);
        this.antenaEsquerda.cor.difusa = vec4(0, 0, 0, 1);
        this.antenaEsquerda.cor.especular = 50.0;

        // cria antena direita
        this.antenaDireita = new Elemento(new Cilindro(8), gl, null);
        this.antenaDireita.escala = vec3(0.05, 0.05, 0.3); // escalar para formar a antena
        this.antenaDireita.trans = add(posicaoInicial, vec3(0.4, 0.2, 0.3)); // posicionar a antena à direita do corpo
        this.antenaDireita.theta = vec3(-90, 0, -40); // rotacionar a antena
        this.antenaDireita.vTheta = vec3(0, 0, 0);
        this.antenaDireita.cor.ambiente = vec4(0.8, 0.8, 0.8, 1);
        this.antenaDireita.cor.difusa = vec4(0, 0, 0, 1);
        this.antenaDireita.cor.especular = 50.0;

        // agrupa todos os elementos
        this.elementos = [this.corpo, this.asaEsquerda, this.asaDireita, this.antenaEsquerda, this.antenaDireita];

        // inicializa os ângulos e velocidades de movimento
        this.anguloMov = 0;
        this.anguloAsa = 0;
        this.velocidadeMovCorpo = 0.5; 
        this.velocidadeMovAsas = 1.75;
        this.raioMov = 1; 
    }

    // método para atualizar a posição de uma parte da abelha
    atualizaPosicaoParte(parte, offset) {
        parte.trans = add(this.corpo.trans, offset);
    }

    // método para atualizar a rotação das asas
    atualizaRotacaoAsas() {
        let rotAsa = 30 * Math.sin(this.anguloAsa); // 30 é a amplitude de rotação da asa
        this.asaEsquerda.theta = vec3(90, 90, rotAsa);
        this.asaDireita.theta = vec3(90, -90, -rotAsa);
    }

    // método para atualizar o movimento da abelha de forma circular (inclui a movimentação das asas também)
    atualizaMovimentoInativo(deltaTempo) {
        this.anguloMov += this.velocidadeMovCorpo * deltaTempo;

        // calcula a nova posição usando funções trigonométricas
        let x = this.raioMov * Math.cos(this.anguloMov);
        let y = this.raioMov * Math.sin(this.anguloMov);

        // atualiza a posição do corpo
        this.corpo.trans = add(this.posicaoInicial, vec3(x, y, 0));

        // atualiza a posição das partes
        this.atualizaPosicaoParte(this.asaEsquerda, vec3(-0.6, 0, 0));
        this.atualizaPosicaoParte(this.asaDireita, vec3(0.6, 0, 0));
        this.atualizaPosicaoParte(this.antenaEsquerda, vec3(-0.4, 0.2, 0.5));
        this.atualizaPosicaoParte(this.antenaDireita, vec3(0.4, 0.2, 0.5));

        // atualiza a rotação das asas
        this.anguloAsa += this.velocidadeMovAsas * deltaTempo * 10;
        this.atualizaRotacaoAsas();
    }
}

class Peixe {
    constructor(gl, pathTexturaCorpo, pathTexturaCauda, posicaoInicial = vec3(0, 0, 0)) {
        this.posicaoInicial = posicaoInicial;

        // corpo
        this.corpo = new Elemento(new Esfera(2, 1), gl, pathTexturaCorpo);
        this.corpo.escala = vec3(1, 0.5, 1);
        this.corpo.trans = posicaoInicial;
        this.corpo.theta = vec3(0, 0, 0);
        this.corpo.vTheta = vec3(0, 0, 0);
        this.corpo.cor.ambiente = vec4(0.8, 0.8, 0.8, 1);
        this.corpo.cor.difusa = vec4(1, 1, 1, 1);
        this.corpo.cor.especular = 50.0;

        this.cauda = new Elemento(new Piramide(1), gl, pathTexturaCauda);
        this.cauda.escala = vec3(0.5, 0.4, 0.5);
        this.cauda.trans = add(posicaoInicial, vec3(1, 0, 0));
        this.cauda.theta = vec3(0, 0, 90);
        this.cauda.vTheta = vec3(0, 0, 0);
        this.cauda.cor.ambiente = vec4(0.8, 0.8, 0.8, 1);
        this.cauda.cor.difusa = vec4(1, 1, 1, 1);
        this.cauda.cor.especular = 50.0;

        // agrupa todos os elementos
        this.elementos = [this.corpo, this.cauda];

        // inicializa os ângulos e velocidades de movimento
        this.anguloMov = 0;
        this.anguloCauda = 0;
        this.anguloCorpo = 0;
        this.velocidadeMovCorpo = 0.5; 
        this.velocidadeMovCauda = 0.5;
        this.raioMov = 1;
    }
    // método para atualizar a posição de uma parte do peixe
    atualizaPosicaoParte(parte, offset) {
        let anguloRad = this.corpo.theta[2] * Math.PI / 180; // angulo de rotaçao do peixe em torno do eixo z
        let offsetRotacionado = vec3(
            offset[0] * Math.cos(anguloRad) - offset[1] * Math.sin(anguloRad),
            offset[0] * Math.sin(anguloRad) + offset[1] * Math.cos(anguloRad),
            offset[2]
        ); // rotacionando o offset em torno do eixo z (usando como ref a matriz de rotaçao no eixo z)
        parte.trans = add(this.corpo.trans, offsetRotacionado);
    }

    // método para atualizar a rotação da cauda
    atualizaRotacaoCauda() {
        let rotCauda = 20 * Math.sin(this.anguloCauda); // 20 é a amplitude de rotação da cauda
        this.cauda.theta = vec3(0, 0, this.corpo.theta[2] + rotCauda - 90);
    }

    atualizaRotacaoCorpo() {
        let rotCorpo = 5 * Math.sin(this.anguloCorpo); // 5 é a amplitude de rotação da Corpo
        this.corpo.theta = vec3(90, -90, -rotCorpo);
    }

    atualizaMovimentoInativo(deltaTempo) {
        this.anguloMov += this.velocidadeMovCorpo * deltaTempo;

        // calcula a nova posição usando funções trigonométricas
        // faz o peixe se mover em uma forma de infinito/"figure-8" 
        let x = this.raioMov * Math.cos(this.anguloMov);
        let y = this.raioMov * Math.sin(2*this.anguloMov) / 2;

        // atualiza a posição do corpo
        this.corpo.trans = add(this.posicaoInicial, vec3(x, y, 0));

        // calcula a direção do movimento
        let dx = -this.raioMov * Math.sin(this.anguloMov); // derivada de x
        let dy = this.raioMov * Math.cos(2*this.anguloMov); // derivada de y

        // calcula o ângulo de rotação
        let anguloRotacao = Math.atan2(dy, dx) * 180 / Math.PI; // calcula angulo entre (x, y) e eixo x

        // aplica a rotação ao corpo
        this.corpo.theta = vec3(0, 0, anguloRotacao);

        // atualiza a posição das partes
        this.atualizaPosicaoParte(this.cauda, vec3(-1, 0, 0));

        // atualiza a rotação da cauda
        this.anguloCauda += this.velocidadeMovCauda * deltaTempo * 10;
        this.atualizaRotacaoCauda();
    }
}

class Caracol {
    constructor(gl, pathTexturaCorpo, pathTexturaConcha, posicaoInicial = vec3(0, 0, 0)) {
        this.posicaoInicial = posicaoInicial;

        this.corpo = new Elemento(new Cilindro(8), gl, pathTexturaCorpo);
        this.corpo.escala = vec3(0.35, 0.35, 2);
        this.corpo.trans = posicaoInicial;
        this.corpo.theta = vec3(0, 90, 0);
        this.corpo.cor.ambiente = vec4(1, 1, 1, 1);
        this.corpo.cor.difusa = vec4(1, 1, 1, 1);
        this.corpo.cor.especular = 100.0;

        this.cabeca = new Elemento(new Cilindro(8), gl, pathTexturaCorpo);
        this.cabeca.escala = vec3(0.35, 0.35, 1);
        this.cabeca.trans = add(posicaoInicial, vec3(1, 0, 0.50));
        this.cabeca.cor.ambiente = vec4(1, 1, 1, 1);
        this.cabeca.cor.difusa = vec4(1, 1, 1, 1);
        this.cabeca.cor.especular = 100.0;

        this.concha = new Elemento(new Esfera(2), gl, pathTexturaConcha);
        this.concha.escala = vec3(0.75, 0.35, 0.75);
        this.concha.trans = add(posicaoInicial, vec3(-0.15, 0, 1));
        this.concha.cor.ambiente = vec4(1, 1, 1, 1);
        this.concha.cor.difusa = vec4(1, 1, 1, 1);
        this.concha.cor.especular = 50.0;

        // agrupa todos os elementos
        this.elementos = [this.corpo, this.cabeca, this.concha];

        // inicializa
        this.semiEixoX = 3;
        this.semiEixoY = 5;
        this.anguloCabeca = 0;
        this.velocidadeMovCabeca = 0.5;
    }

    // método para atualizar a posição de uma parte da abelha
    atualizaPosicaoParte(parte, offset) {
        parte.trans = add(this.corpo.trans, offset);
    }

    // método para atualizar a rotação da cauda
    atualizaRotacaoCabeca(theta) {
        let rotCauda = 20 * Math.sin(this.anguloCauda); // 20 é a amplitude de rotação da cauda
        this.cauda.theta[Z] += rotCauda - 90;
    }

    atualizaMovimentoInativo(deltaTempo) {
        return;
        // calcula a nova posição usando funções trigonométricas
        let x = this.semiEixoX * Math.cos(deltaTempo);
        let y = this.semiEixoY * Math.sin(deltaTempo);

        // atualiza a posição do corpo
        this.corpo.trans = add(this.posicaoInicial, vec3(x, y, 0));

        // atualiza a posição das partes
        this.atualizaPosicaoParte(this.pescoco, vec3(1, 0, 0));
        this.atualizaPosicaoParte(this.concha, vec3(-0.15, 0, 1));

        // atualiza a rotação da cabeça
        this.anguloCabeca += this.velocidadeMovCabeca * deltaTempo * 10;
        this.atualizaRotacaoCabeca();
    }
}