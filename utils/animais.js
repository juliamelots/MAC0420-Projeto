const NEUTRO = { // usar em elementos com textura
    ambiente: vec4(1, 1, 1, 1),
    difusa: vec4(1, 1, 1, 1),
    especular: 50.0
};

class Animal extends Elemento {
    constructor(transInicial, gl) {
        super(null, gl, null);
        this.elementos = [];
        this.trans = transInicial;
        this.transInicial = transInicial;
    }

    aplicaModeloSobreElemento(view, modeloAnimal, modeloElemento) {
        let modeloFinal = { };
        modeloFinal.model = mult(modeloAnimal.model, modeloElemento.model);
        modeloFinal.invTrans = transpose(inverse(mult(view, modeloFinal.model)));
        return modeloFinal;
    }

    atualizaPOV(camera) {
        // posiciona câmera atrás e acima de animal, considerando sua rotação
        let rZ = rotateZ(this.theta[Z]);
        let rX = rotateX(this.theta[X]);
        let offset = mult(rZ, mult(rX, vec4(0, -5, 2, 1)));
        camera.trans = add(this.trans, vec3(offset[X], offset[Y], offset[Z]));

        // rotaciona câmera de acordo com animal
        camera.atualizaTheta(vec3(this.theta[X] + 75, this.theta[Y], this.theta[Z]));
    }

    atualizaTrans(deltaTempo, camera) {
        this.trans = add(this.trans, mult(camera.vTrans * deltaTempo, camera.frente));
    }
}

class Abelha extends Animal{
    constructor(transInicial, gl, pathTexturaCorpo, pathTexturaAsas) {
        super(transInicial, gl);

        // cria o corpo da abelha
        this.corpo = new Elemento(new Esfera(2, 1), gl, pathTexturaCorpo);
        this.corpo.escala = vec3(0.5, 0.5, 1); // escalar para formar o corpo da abelha
        this.corpo.trans = vec3(0, 0, 0); // posicionar o corpo na posição inicial
        this.corpo.cor = NEUTRO;
        this.elementos.push(this.corpo);

        // cria asa esquerda
        this.asaEsquerda = new Elemento(new Piramide(1), gl, pathTexturaAsas);
        this.asaEsquerda.escala = vec3(0.2, 0.4, 0.1); // escalar para formar a asa
        this.asaEsquerda.trans = vec3(-0.6, 0, 0); // posicionar a asa à esquerda do corpo
        this.asaEsquerda.theta = vec3(0, 0, -90); // rotacionar a asa
        this.asaEsquerda.cor = NEUTRO;
        this.elementos.push(this.asaEsquerda);

        // cria asa direita
        this.asaDireita = new Elemento(new Piramide(1), gl, pathTexturaAsas);
        this.asaDireita.escala = vec3(0.25, 0.4, 0.1); // escalar para formar a asa
        this.asaDireita.trans = vec3(0.6, 0, 0); // posicionar a asa à direita do corpo
        this.asaDireita.theta = vec3(0, 0, 90); // rotacionar a asa
        this.asaDireita.cor = NEUTRO;
        this.elementos.push(this.asaDireita);

        // cria antena esquerda
        this.antenaEsquerda = new Elemento(new Cilindro(8), gl, null);
        this.antenaEsquerda.escala = vec3(0.05, 0.05, 0.3); // escalar para formar a antena
        this.antenaEsquerda.trans = vec3(-0.4, 0.2, 0.3); // posicionar a antena à esquerda do corpo
        this.antenaEsquerda.theta = vec3(90, 0, 40); // rotacionar a antena
        this.antenaEsquerda.cor = NEUTRO;
        this.elementos.push(this.antenaEsquerda);

        // cria antena direita
        this.antenaDireita = new Elemento(new Cilindro(8), gl, null);
        this.antenaDireita.escala = vec3(0.05, 0.05, 0.3); // escalar para formar a antena
        this.antenaDireita.trans = vec3(0.4, 0.2, 0.3); // posicionar a antena à direita do corpo
        this.antenaDireita.theta = vec3(-90, 0, -40); // rotacionar a antena
        this.antenaDireita.cor = NEUTRO;
        this.elementos.push(this.antenaDireita);
        
        // inicializa atributos de movimento inativo
        this.raioMov = 2; 
        this.angMov = 0;
        this.vMov = 0.5; 
        this.anguloAsa = 0;
        this.velocidadeMovAsas = 1.75;
    }

    // método para atualizar a rotação das asas
    atualizaRotacaoAsas(deltaTempo) {
        this.anguloAsa += this.velocidadeMovAsas * deltaTempo * 10;
        let rotAsa = 30 * Math.sin(this.anguloAsa); // 30 é a amplitude de rotação da asa
        this.asaEsquerda.theta = vec3(90, 90, rotAsa);
        this.asaDireita.theta = vec3(90, -90, -rotAsa);
    }

    // método para atualizar o movimento da abelha de forma circular (inclui a movimentação das asas também)
    atualizaMovimentoInativo(deltaTempo) {
        // calcula a posição usando funções trigonométricas
        this.angMov += this.vMov * deltaTempo;
        let x = this.raioMov * Math.cos(this.angMov);
        let y = this.raioMov * Math.sin(this.angMov);
        this.trans = add(this.transInicial, vec3(x, y, 0));

        // calcula a rotação usando derivada de funções trigonométricas
        let dx = -this.raioMov * Math.sin(this.angMov);
        let dy = this.raioMov * Math.cos(this.angMov);
        this.theta = vec3(90, 0, Math.atan2(dy, dx) * 180 / Math.PI); // ângulo entre (x, y) e eixo 

        // atualiza a rotação das asas
        this.atualizaRotacaoAsas(deltaTempo);
    }
}

class Peixe extends Animal{
    constructor(transInicial, gl, pathTexturaCorpo, pathTexturaCauda) {
        super(transInicial, gl);

        // cria corpo do peixe
        this.corpo = new Elemento(new Esfera(2, 1), gl, pathTexturaCorpo);
        this.corpo.escala = vec3(1, 0.5, 1);
        this.corpo.trans = vec3(0, 0, 0);
        this.corpo.theta = vec3(0, 0, 0);
        this.corpo.vTheta = vec3(0, 0, 0);
        this.corpo.cor = NEUTRO;
        this.elementos.push(this.corpo);

        // cria cauda do peixe
        this.cauda = new Elemento(new Piramide(1), gl, pathTexturaCauda);
        this.cauda.escala = vec3(0.5, 0.4, 0.5);
        this.cauda.trans = vec3(1, 0, 0);
        this.cauda.theta = vec3(0, 0, 90);
        this.cauda.vTheta = vec3(0, 0, 0);
        this.cauda.cor = NEUTRO;
        this.elementos.push(this.cauda);

        // inicializa atributos de movimento inativo
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
        parte.trans = offsetRotacionado;
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
        this.trans = add(this.transInicial, vec3(x, y, 0));

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

class Caracol extends Animal{
    constructor(transInicial, gl, pathTexturaCorpo, pathTexturaConcha) {
        super(transInicial, gl);
        
        // cria corpo do caracol
        this.corpo = new Elemento(new Cilindro(8), gl, pathTexturaCorpo);
        this.corpo.escala = vec3(0.35, 0.35, 2);
        this.corpo.trans = vec3(0, 0, 0);
        this.corpo.theta = vec3(90, 0, 0);
        this.corpo.cor = NEUTRO;
        this.corpo.cor.especular = 100.0;
        this.elementos.push(this.corpo);

        // cria cabeca do caracol
        this.cabeca = new Elemento(new Cilindro(8), gl, pathTexturaCorpo);
        this.cabeca.escala = vec3(0.35, 0.35, 1.5);
        this.cabeca.trans = vec3(0, 1, 0.75);
        this.cabeca.cor = NEUTRO;
        this.cabeca.cor.especular = 100.0;
        this.elementos.push(this.cabeca);

        // cria concha do caracol
        this.concha = new Elemento(new Esfera(2), gl, pathTexturaConcha);
        this.concha.escala = vec3(0.35, 1, 0.75);
        this.concha.trans = vec3(0, -0.25, 1);
        this.concha.cor = NEUTRO;
        this.elementos.push(this.concha);

        // inicializa atributos de movimento inativo
        this.semiEixoX = 4;
        this.semiEixoY = 2;
        this.angMov = 0;
        this.vMov = 0.5;
    }

    atualizaMovimentoInativo(deltaTempo) {
        // calcula a posição usando funções trigonométricas
        this.angMov += this.vMov * deltaTempo;
        let x = this.semiEixoX * Math.cos(this.angMov);
        let y = this.semiEixoY * Math.sin(this.angMov);
        this.trans = add(this.transInicial, vec3(x, y, 0));

        // calcula a rotação usando derivada de funções trigonométricas
        let dx = -this.semiEixoX * Math.sin(this.angMov);
        let dy = this.semiEixoY * Math.cos(this.angMov);
        let angDir = (Math.atan2(dy, dx) * 180 / Math.PI) - 90; // ângulo entre (x, y) e eixo X
        this.theta = vec3(0, 0, angDir);
    }
}