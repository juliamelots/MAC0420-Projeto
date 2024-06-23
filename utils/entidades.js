const X = 0;
const Y = 1;
const Z = 2;
const I = mat4();

/**
 * Gera matriz de rotação conjunta de ângulos arbitrários em cada eixo.
 */
function rotateXYZ(x, y, z) {
    let rX = rotateX(x);
    let rY = rotateY(y);
    let rZ = rotateZ(z);
    return mult(rZ, mult(rY, rX));
}

class Camera {
    constructor(trans = vec3(0, 0, 0), theta = vec3(0, 0, 0)) {
        this.trans = trans;
        this.theta = theta;
        this.vTrans = 0.0;

        this.cima = vec3(0, 1, 0);
        this.frente = vec3(0, 0, 1);

        this.atualizaTheta(theta);
    }

    atualizaTrans(deltaTempo) {
        this.trans = add(this.trans, mult(this.vTrans * deltaTempo, this.frente));
    }

    atualizaTheta(novoTheta) {
        let sisCoord = this.rotaciona(novoTheta);
        this.theta = vec3(novoTheta[X], novoTheta[Y], novoTheta[Z]);
        this.cima = vec3(sisCoord[X][1], sisCoord[Y][1], sisCoord[Z][1]);
        this.frente = vec3(-sisCoord[X][2], -sisCoord[Y][2], -sisCoord[Z][2]);
    }

    olha() {
        return lookAt(this.trans, add(this.trans, this.frente), this.cima);
    }

    rotaciona(theta) {
        let rX = rotateX(theta[X]);
        let rY = rotateY(theta[Y]);
        let rZ = rotateZ(theta[Z]);
        return mult(rZ, mult(rY, mult(rX, I)));
    }
}

class Elemento {
    constructor(poliedro, gl, pathTextura) {
        // atributos físicos
        this.escala = vec3(1, 1, 1);
        this.trans = vec3(0, 0, 0);
        this.vTrans = vec3(0, 0, 0);
        this.theta = vec3(0, 0, 0);
        this.vTheta = vec3(0, 0, 0);

        // atributos gráficos
        this.poliedro = poliedro;
        this.temTextura = pathTextura != null;
        this.textura = gl.createTexture();
        this.img = this.carregaImagem(pathTextura);
        this.cor = {
            ambiente: vec4(0, 0, 0, 1),
            difusa: vec4(0, 0, 0, 1),
            especular: 50.0
        };
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

    calculaUniformesModelo(view) {
        let escala = scale(this.escala[X], this.escala[Y], this.escala[Z]);
        let rotacao = rotateXYZ(this.theta[X], this.theta[Y], this.theta[Z]);
        let translacao = translate(this.trans[X], this.trans[Y], this.trans[Z]);

        let model = mult(translacao, mult(rotacao, escala));
        let invTrans = transpose(inverse(mult(view, model)));

        let dados = {
            model: model,
            invTrans: invTrans
        };
        return dados;
    }

    calculaUniformesLuz(alvo) {
        // this é fonte de luz, alvo é material afetado
        let dados = {
            ambient: mult(this.cor.ambiente, alvo.cor.ambiente),
            diffusion: mult(this.cor.difusa, alvo.cor.difusa),
            specular: this.cor.especular,
            alpha: alvo.cor.especular
        };
        return dados;
    }

    calculaUniformesMaterial() {
        let dados = {
            textura: this.textura,
            img: this.img,
            temTextura: this.temTextura
        }
        return dados;
    }

    carregaImagem(path) {
        var img = new Image(); // cria um bitmap
        img.src = path;
        img.crossOrigin = "anonymous";
        return img;
    }

    calculaSombra() {
        let proj = mat4();
        proj[0][0] = this.trans[Z];
        proj[1][1] = this.trans[Z];
        proj[3][3] = this.trans[Z];
        proj[0][2] = -this.trans[X];
        proj[1][2] = -this.trans[Y];
        proj[2][2] = 0;
        proj[3][2] = -1;
        return proj;
    }
}