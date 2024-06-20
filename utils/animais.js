class Abelha {
    constructor(gl, pathTexturaCorpo, pathTexturaAsas, posicaoInicial = vec3(0, 0, 0)) {
        // posição inicial da abelha
        this.posicaoInicial = posicaoInicial;

        // cria o corpo da abelha
        this.corpo = new Elemento(new Esfera(2, 1), gl, pathTexturaCorpo);
        this.corpo.escala = vec3(0.5, 0.5, 1); // escalar para formar o corpo da abelha
        this.corpo.trans = posicaoInicial; // posicionar o corpo na posição inicial
        this.corpo.vTheta = vec3(10, 0, 0);
        this.corpo.cor.ambiente = vec4(0.8, 0.8, 0.8, 1);
        this.corpo.cor.difusa = vec4(1, 1, 1, 1);
        this.corpo.cor.especular = 50.0;

        // cria asa esquerda
        this.asaEsquerda = new Elemento(new Piramide(1), gl, pathTexturaAsas);
        this.asaEsquerda.escala = vec3(0.2, 0.4, 0.1); // escalar para formar a asa
        this.asaEsquerda.trans = add(posicaoInicial, vec3(-0.6, 0, 0)); // posicionar a asa à esquerda do corpo
        this.asaEsquerda.theta = vec3(0, 0, -90); // rotacionar a asa
        this.asaEsquerda.vTheta = vec3(10, 0, 0);
        this.asaEsquerda.cor.ambiente = vec4(0.8, 0.8, 0.8, 1);
        this.asaEsquerda.cor.difusa = vec4(1, 1, 1, 1);
        this.asaEsquerda.cor.especular = 50.0;

        // cria asa direita
        this.asaDireita = new Elemento(new Piramide(1), gl, pathTexturaAsas);
        this.asaDireita.escala = vec3(0.25, 0.4, 0.1); // escalar para formar a asa
        this.asaDireita.trans = add(posicaoInicial, vec3(0.6, 0, 0)); // posicionar a asa à direita do corpo
        this.asaDireita.theta = vec3(0, 0, 90); // rotacionar a asa
        this.asaDireita.vTheta = vec3(10, 0, 0);
        this.asaDireita.cor.ambiente = vec4(0.8, 0.8, 0.8, 1);
        this.asaDireita.cor.difusa = vec4(1, 1, 1, 1);
        this.asaDireita.cor.especular = 50.0;

        // cria antena esquerda
        this.antenaEsquerda = new Elemento(new Cilindro(8), gl, null);
        this.antenaEsquerda.escala = vec3(0.05, 0.05, 0.3); // escalar para formar a antena
        this.antenaEsquerda.trans = add(posicaoInicial, vec3(-0.4, 0.2, 0.8)); // posicionar a antena à esquerda do corpo
        this.antenaEsquerda.theta = vec3(90, 0, 40); // rotacionar a antena
        this.antenaEsquerda.vTheta = vec3(10, 0, 0);
        this.antenaEsquerda.cor.ambiente = vec4(0.8, 0.8, 0.8, 1);
        this.antenaEsquerda.cor.difusa = vec4(0, 0, 0, 1);
        this.antenaEsquerda.cor.especular = 50.0;

        // cria antena direita
        this.antenaDireita = new Elemento(new Cilindro(8), gl, null);
        this.antenaDireita.escala = vec3(0.05, 0.05, 0.3); // escalar para formar a antena
        this.antenaDireita.trans = add(posicaoInicial, vec3(0.4, 0.2, 0.8)); // posicionar a antena à direita do corpo
        this.antenaDireita.theta = vec3(-90, 0, -40); // rotacionar a antena
        this.antenaDireita.vTheta = vec3(10, 0, 0);
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
    atualizaMovimentoCircular(deltaTempo) {
        this.anguloMov += this.velocidadeMovCorpo * deltaTempo;

        // calcula a nova posição usando funções trigonométricas
        let x = this.raioMov * Math.cos(this.anguloMov);
        let y = this.raioMov * Math.sin(this.anguloMov);

        // atualiza a posição do corpo
        this.corpo.trans = add(this.posicaoInicial, vec3(x, y, 0));

        // atualiza a posição das partes
        this.atualizaPosicaoParte(this.asaEsquerda, vec3(-0.6, 0, 0));
        this.atualizaPosicaoParte(this.asaDireita, vec3(0.6, 0, 0));
        this.atualizaPosicaoParte(this.antenaEsquerda, vec3(-0.4, 0.2, 0.8));
        this.atualizaPosicaoParte(this.antenaDireita, vec3(0.4, 0.2, 0.8));

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
        this.corpo.vTheta = vec3(10, 0, 0);
        this.corpo.cor.ambiente = vec4(0.8, 0.8, 0.8, 1);
        this.corpo.cor.difusa = vec4(1, 1, 1, 1);
        this.corpo.cor.especular = 50.0;

        this.cauda = new Elemento(new Piramide(1), gl, pathTexturaCauda);
        this.cauda.escala = vec3(0.5, 0.4, 0.5);
        this.cauda.trans = add(posicaoInicial, vec3(1, 0, 0));
        this.cauda.theta = vec3(0, 0, 90);
        this.cauda.vTheta = vec3(10, 0, 0);
        this.cauda.cor.ambiente = vec4(0.8, 0.8, 0.8, 1);
        this.cauda.cor.difusa = vec4(1, 1, 1, 1);
        this.cauda.cor.especular = 50.0;

        // agrupa todos os elementos
        this.elementos = [this.corpo, this.cauda];

        // inicializa os ângulos e velocidades de movimento
        this.anguloMov = 0;
        this.anguloCauda = 0;
        this.velocidadeMovCorpo = 0.5; 
        this.velocidadeMovCauda = 0.5;
        this.raioMov = 1; 
    }
    // método para atualizar a posição de uma parte do peixe
    atualizaPosicaoParte(parte, offset) {
        parte.trans = add(this.corpo.trans, offset);
    }

    // método para atualizar a rotação da cauda
    atualizaRotacaoCauda() {
        let rotCauda = 20 * Math.sin(this.anguloCauda); // 20 é a amplitude de rotação da cauda
        this.cauda.theta = vec3(90, 90, rotCauda);
    }

    atualizaMovimentoInfinito(deltaTempo) {
        this.anguloMov += this.velocidadeMovCorpo * deltaTempo;

        // calcula a nova posição usando funções trigonométricas
        // faz o peixe se mover em uma forma de infinito/"figure-8" 
        let x = this.raioMov * Math.cos(this.anguloMov);
        let y = this.raioMov * Math.sin(2*this.anguloMov) / 2;

        // atualiza a posição do corpo
        this.corpo.trans = add(this.posicaoInicial, vec3(x, y, 0));

        // atualiza a posição das partes
        this.atualizaPosicaoParte(this.cauda, vec3(-1, 0, 0));

        // atualiza a rotação da cauda
        this.anguloCauda += this.velocidadeMovCauda * deltaTempo * 10;
        this.atualizaRotacaoCauda();
    }
}