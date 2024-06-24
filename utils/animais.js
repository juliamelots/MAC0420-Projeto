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
        // calcula a posição do animal usando direção da câmera
        this.trans = add(this.trans, mult(camera.vTrans * deltaTempo, camera.frente));

        // atualiza a rotação da parte destaque do animal
        this.atualizaRotacaoParte(deltaTempo);
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
        this.angAsa = 0;
        this.vAsa = 17.5;
    }

    atualizaRotacaoParte(deltaTempo) {
        this.angAsa += this.vAsa * deltaTempo;
        let rotAsa = 30 * Math.sin(this.angAsa); // 30 é a amplitude de rotação da asa
        this.asaEsquerda.theta = vec3(90, 90, rotAsa);
        this.asaDireita.theta = vec3(90, -90, -rotAsa);
    }

    /**
     * Move abelha em elipse quando seu POV está inativo.
     */
    atualizaMovimentoInativo(deltaTempo) {
        // calcula a posição usando funções trigonométricas
        this.angMov += this.vMov * deltaTempo;
        let x = this.raioMov * Math.cos(this.angMov);
        let y = this.raioMov * Math.sin(this.angMov);
        this.trans = add(this.transInicial, vec3(x, y, 0));

        // calcula a rotação usando derivada de funções trigonométricas
        let dx = -this.raioMov * Math.sin(this.angMov);
        let dy = this.raioMov * Math.cos(this.angMov);
        let angDir = Math.atan2(dy, dx) * 180 / Math.PI; // ângulo entre (x, y) e eixo X
        this.theta = vec3(0, 0, angDir);

        // atualiza a rotação das asas
        this.atualizaRotacaoParte(deltaTempo);
    }
}

class Peixe extends Animal{
    constructor(transInicial, gl, pathTexturaCorpo, pathTexturaCauda) {
        super(transInicial, gl);

        // cria corpo do peixe
        this.corpo = new Elemento(new Esfera(2, 1), gl, pathTexturaCorpo);
        this.corpo.escala = vec3(1, 0.5, 1);
        this.corpo.trans = vec3(0, 0, 0);
        this.corpo.theta = vec3(0, 0, 90);
        this.corpo.cor = NEUTRO;
        this.elementos.push(this.corpo);

        // cria cauda do peixe
        this.cauda = new Elemento(new Piramide(1), gl, pathTexturaCauda);
        this.cauda.escala = vec3(0.5, 0.4, 0.5);
        this.cauda.trans = vec3(0, -1, 0);
        this.cauda.theta = vec3(0, 0, 90);
        this.cauda.cor = NEUTRO;
        this.elementos.push(this.cauda);

        // inicializa atributos de movimento inativo
        this.raioMov = 1;
        this.angMov = 0;
        this.vMov = 0.5;
        this.angCauda = 0;
        this.vCauda = 5;
    }

    atualizaRotacaoParte(deltaTempo) {
        this.angCauda += this.vCauda * deltaTempo;
        let rotCauda = 20 * Math.sin(this.angCauda); // 20 é a amplitude de rotação da cauda
        this.cauda.theta = vec3(0, 0, this.corpo.theta[2] + rotCauda - 90);
    }

    /**
     * Move peixe em infinito/figure-8 quando seu POV está inativo.
     */
    atualizaMovimentoInativo(deltaTempo) {
        // calcula a posição usando funções trigonométricas
        this.angMov += this.vMov * deltaTempo;
        let x = this.raioMov * Math.cos(this.angMov);
        let y = this.raioMov * Math.sin(2*this.angMov) / 2;
        this.trans = add(this.transInicial, vec3(x, y, 0));

        // calcula a rotação usando derivada de funções trigonométricas
        let dx = -this.raioMov * Math.sin(this.angMov);
        let dy = this.raioMov * Math.cos(2*this.angMov);
        let angDir = Math.atan2(dy, dx) * 180 / Math.PI; // ângulo entre (x, y) e eixo X
        this.theta = vec3(0, 0, angDir - 90);

        // atualiza a rotação da cauda
        this.atualizaRotacaoParte(deltaTempo);
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
        this.angCabeca = 0;
        this.vCabeca = 5;
    }

    atualizaRotacaoParte(deltaTempo) {
        this.angCabeca += this.vCabeca * deltaTempo;
        let rotCabeca = 15 * Math.sin(this.angCabeca); // 30 é a amplitude de rotação da cabeça
        this.cabeca.theta = vec3(rotCabeca, 0, 0);
    }

    /**
     * Move caracol em elipse quando seu POV está inativo.
     */
    atualizaMovimentoInativo(deltaTempo) {
        // calcula a posição usando funções trigonométricas
        this.angMov += this.vMov * deltaTempo;
        let x = this.semiEixoX * Math.cos(this.angMov);
        let y = this.semiEixoY * Math.sin(this.angMov);
        this.trans = add(this.transInicial, vec3(x, y, 0));

        // calcula a rotação usando derivada de funções trigonométricas
        let dx = -this.semiEixoX * Math.sin(this.angMov);
        let dy = this.semiEixoY * Math.cos(this.angMov);
        let angDir = Math.atan2(dy, dx) * 180 / Math.PI; // ângulo entre (x, y) e eixo X
        this.theta = vec3(0, 0, angDir - 90);

        // atualiza a rotação da cabeca
        this.atualizaRotacaoParte(deltaTempo);
    }
}