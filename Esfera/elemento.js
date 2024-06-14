class Elemento {
    constructor(poliedro) {
        // atributos físicos
        this.escala = vec3(1, 1, 1);
        this.trans = vec3(0, 0, 0);
        this.vTrans = vec3(0, 0, 0);
        this.theta = vec3(0, 0, 0);
        this.vTheta = vec3(0, 0, 0);

        // TO-DO atributos gráficos
        this.poliedro = poliedro;
        this.cor = vec4(0, 0, 0, 1);
        this.textura = vec4(0, 0, 0, 1);
        this.difusao = vec4(0.5, 1.0, 0.0, 1.0);
}

    atualizaTrans(deltaTempo) {
        this.trans = add(this.trans, mult(deltaTempo, this.vTrans));
    }

    atualizaVTrans(deltaTempo) {
        this.vTrans[2] -= G * deltaTempo;
    }

    atualizaTheta(deltaTempo) {
        this.theta = add(this.theta, mult(deltaTempo, this.vTheta));
    }

    renderiza(view) {
        let escala = scale(this.escala[X], this.escala[Y], this.escala[Z]);
        let rotacao = rotateXYZ(this.theta[X], this.theta[Y], this.theta[Z]);
        let translacao = translate(this.trans[X], this.trans[Y], this.trans[Z]);

        let model = mult(translacao, mult(rotacao, escala));
        let invTrans = transpose(inverse(mult(view, model)));

        let dadosElemento = {
            model: model,
            invTrans: invTrans,
            color: this.cor,
            texture: this.textura,
            diffusion: this.difusao
        };
        return dadosElemento;
    }
}