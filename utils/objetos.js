class Arvore {
    constructor(gl, pathTexturaTronco, pathTexturaFolhas, posicaoInicial = vec3(0, 0, 0)) {
        this.posicaoInicial = posicaoInicial;

        // tronco
        this.tronco = new Elemento(new Cilindro(8), gl, pathTexturaTronco);
        this.tronco.escala = vec3(0.5, 0.5, 3);
        this.tronco.trans = posicaoInicial;
        this.tronco.theta = vec3(0, 0, 0);
        this.tronco.cor.ambiente = vec4(0.42, 0.28, 0.16, 1);
        this.tronco.cor.difusa = vec4(0.42, 0.28, 0.16, 1);
        this.tronco.cor.especular = 50.0;

        // folhas
        this.folhas = new Elemento(new Esfera(2), gl, pathTexturaFolhas);
        this.folhas.escala = vec3(1.5, 1.5, 1);
        this.folhas.trans = add(posicaoInicial, vec3(0, 0, 2.0));
        this.folhas.theta = vec3(0, 0, 90);
        this.folhas.cor.ambiente = vec4(0.3, 0.43, 0, 1);
        this.folhas.cor.difusa = vec4(0.3, 0.43, 0, 1);
        this.folhas.cor.especular = 50.0;

        // agrupa todos os elementos
        this.elementos = [this.tronco, this.folhas];
    }
}

class Pedra {
    constructor(gl, pathTexturaPedra, posicaoInicial, escala) {
        this.posicaoInicial = posicaoInicial;

        this.elemento = new Elemento(new Esfera(1), gl, pathTexturaPedra);
        this.elemento.escala = escala;
        this.elemento.trans = posicaoInicial;
        this.elemento.theta = vec3(0, 0, 0);
        this.elemento.cor.ambiente = vec4(1, 1, 1, 1);
        this.elemento.cor.difusa = vec4(1, 1, 1, 1);
        this.elemento.cor.especular = 50.0;
    }
}

class Chao {
    constructor(gl, pathTexturaChao, posicaoInicial) {
        this.posicaoInicial = posicaoInicial;

        this.elemento = new Elemento(new Cubo(), gl, pathTexturaChao);
        this.elemento.escala = vec3(25, 25, 5);
        this.elemento.trans = posicaoInicial;
        this.elemento.theta = vec3(0, 0, 0);
        this.elemento.cor.ambiente = vec4(1, 1, 1, 1);
        this.elemento.cor.difusa = vec4(1, 1, 1, 1);
        this.elemento.cor.especular = 150.0;
    }
}

class Lago {
    constructor(gl, pathTexturaLago, posicaoInicial) {
        this.posicaoInicial = posicaoInicial;

        this.elemento = new Elemento(new Cubo(), gl, pathTexturaLago);
        this.elemento.escala = vec3(10, 10, 5);
        this.elemento.trans = posicaoInicial;
        this.elemento.theta = vec3(0, 0, 0);
        this.elemento.cor.ambiente = vec4(0, 0, 1, 1);
        this.elemento.cor.difusa = vec4(0, 0, 1, 1);
        this.elemento.cor.especular = 50.0;
    }
}

class Horta {
    constructor(gl, pathTexturaTerra, pathTexturaBrotos, posicaoInicial) {
        this.posicaoInicial = posicaoInicial;

        this.terra = new Elemento(new Cubo(), gl, pathTexturaTerra);
        this.terra.escala = vec3(5, 10, 5);
        this.terra.trans = posicaoInicial;
        this.terra.theta = vec3(0, 0, 0);
        this.terra.cor.ambiente = vec4(1, 1, 1, 1);
        this.terra.cor.difusa = vec4(1, 1, 1, 1);
        this.terra.cor.especular = 50.0;

        this.broto1 = new Elemento(new Esfera(2), gl, pathTexturaBrotos);
        this.broto1.escala = vec3(0.2, 0.2, 0.2);
        this.broto1.trans = add(posicaoInicial, vec3(0, -4.0, 2.5));
        this.broto1.theta = vec3(0, 0, 0);
        this.broto1.cor.ambiente = vec4(1, 1, 1, 1);
        this.broto1.cor.difusa = vec4(0, 1, 0, 1);
        this.broto1.cor.especular = 50.0;

        this.broto2 = new Elemento(new Esfera(2), gl, pathTexturaBrotos);
        this.broto2.escala = vec3(0.2, 0.2, 0.2);
        this.broto2.trans = add(posicaoInicial, vec3(0, -2.0, 2.5));
        this.broto2.theta = vec3(0, 0, 0);
        this.broto2.cor.ambiente = vec4(1, 1, 1, 1);
        this.broto2.cor.difusa = vec4(0, 1, 0, 1);
        this.broto2.cor.especular = 50.0;

        this.broto3 = new Elemento(new Esfera(2), gl, pathTexturaBrotos);
        this.broto3.escala = vec3(0.2, 0.2, 0.2);
        this.broto3.trans = add(posicaoInicial, vec3(0, 0, 2.5));
        this.broto3.theta = vec3(0, 0, 0);
        this.broto3.cor.ambiente = vec4(1, 1, 1, 1);
        this.broto3.cor.difusa = vec4(0, 1, 0, 1);
        this.broto3.cor.especular = 50.0;

        this.broto4 = new Elemento(new Esfera(2), gl, pathTexturaBrotos);
        this.broto4.escala = vec3(0.2, 0.2, 0.2);
        this.broto4.trans = add(posicaoInicial, vec3(0, 2.0, 2.5));
        this.broto4.theta = vec3(0, 0, 0);
        this.broto4.cor.ambiente = vec4(1, 1, 1, 1);
        this.broto4.cor.difusa = vec4(0, 1, 0, 1);
        this.broto4.cor.especular = 50.0;

        this.broto5 = new Elemento(new Esfera(2), gl, pathTexturaBrotos);
        this.broto5.escala = vec3(0.2, 0.2, 0.2);
        this.broto5.trans = add(posicaoInicial, vec3(-1.5, -4.0, 2.5));
        this.broto5.theta = vec3(0, 0, 0);
        this.broto5.cor.ambiente = vec4(1, 1, 1, 1);
        this.broto5.cor.difusa = vec4(0, 1, 0, 1);
        this.broto5.cor.especular = 50.0;

        this.broto6 = new Elemento(new Esfera(2), gl, pathTexturaBrotos);
        this.broto6.escala = vec3(0.2, 0.2, 0.2);
        this.broto6.trans = add(posicaoInicial, vec3(-1.5, -2.0, 2.5));
        this.broto6.theta = vec3(0, 0, 0);
        this.broto6.cor.ambiente = vec4(1, 1, 1, 1);
        this.broto6.cor.difusa = vec4(0, 1, 0, 1);
        this.broto6.cor.especular = 50.0;

        this.broto7 = new Elemento(new Esfera(2), gl, pathTexturaBrotos);
        this.broto7.escala = vec3(0.2, 0.2, 0.2);
        this.broto7.trans = add(posicaoInicial, vec3(-1.5, 0, 2.5));
        this.broto7.theta = vec3(0, 0, 0);
        this.broto7.cor.ambiente = vec4(1, 1, 1, 1);
        this.broto7.cor.difusa = vec4(0, 1, 0, 1);
        this.broto7.cor.especular = 50.0;

        this.broto8 = new Elemento(new Esfera(2), gl, pathTexturaBrotos);
        this.broto8.escala = vec3(0.2, 0.2, 0.2);
        this.broto8.trans = add(posicaoInicial, vec3(-1.5, 2.0, 2.5));
        this.broto8.theta = vec3(0, 0, 0);
        this.broto8.cor.ambiente = vec4(1, 1, 1, 1);
        this.broto8.cor.difusa = vec4(0, 1, 0, 1);
        this.broto8.cor.especular = 50.0;

        this.broto9 = new Elemento(new Esfera(2), gl, pathTexturaBrotos);
        this.broto9.escala = vec3(0.2, 0.2, 0.2);
        this.broto9.trans = add(posicaoInicial, vec3(1.5, -4.0, 2.5));
        this.broto9.theta = vec3(0, 0, 0);
        this.broto9.cor.ambiente = vec4(1, 1, 1, 1);
        this.broto9.cor.difusa = vec4(0, 1, 0, 1);
        this.broto9.cor.especular = 50.0;

        this.broto10 = new Elemento(new Esfera(2), gl, pathTexturaBrotos);
        this.broto10.escala = vec3(0.2, 0.2, 0.2);
        this.broto10.trans = add(posicaoInicial, vec3(1.5, -2.0, 2.5));
        this.broto10.theta = vec3(0, 0, 0);
        this.broto10.cor.ambiente = vec4(1, 1, 1, 1);
        this.broto10.cor.difusa = vec4(0, 1, 0, 1);
        this.broto10.cor.especular = 50.0;

        this.broto11 = new Elemento(new Esfera(2), gl, pathTexturaBrotos);
        this.broto11.escala = vec3(0.2, 0.2, 0.2);
        this.broto11.trans = add(posicaoInicial, vec3(1.5, 0, 2.5));
        this.broto11.theta = vec3(0, 0, 0);
        this.broto11.cor.ambiente = vec4(1, 1, 1, 1);
        this.broto11.cor.difusa = vec4(0, 1, 0, 1);
        this.broto11.cor.especular = 50.0;

        this.broto12 = new Elemento(new Esfera(2), gl, pathTexturaBrotos);
        this.broto12.escala = vec3(0.2, 0.2, 0.2);
        this.broto12.trans = add(posicaoInicial, vec3(1.5, 2.0, 2.5));
        this.broto12.theta = vec3(0, 0, 0);
        this.broto12.cor.ambiente = vec4(1, 1, 1, 1);
        this.broto12.cor.difusa = vec4(0, 1, 0, 1);
        this.broto12.cor.especular = 50.0;

        this.broto13 = new Elemento(new Esfera(2), gl, pathTexturaBrotos);
        this.broto13.escala = vec3(0.2, 0.2, 0.2);
        this.broto13.trans = add(posicaoInicial, vec3(0, 4.0, 2.5));
        this.broto13.theta = vec3(0, 0, 0);
        this.broto13.cor.ambiente = vec4(1, 1, 1, 1);
        this.broto13.cor.difusa = vec4(0, 1, 0, 1);
        this.broto13.cor.especular = 50.0;

        this.broto14 = new Elemento(new Esfera(2), gl, pathTexturaBrotos);
        this.broto14.escala = vec3(0.2, 0.2, 0.2);
        this.broto14.trans = add(posicaoInicial, vec3(-1.5, 4.0, 2.5));
        this.broto14.theta = vec3(0, 0, 0);
        this.broto14.cor.ambiente = vec4(1, 1, 1, 1);
        this.broto14.cor.difusa = vec4(0, 1, 0, 1);
        this.broto14.cor.especular = 50.0;

        this.broto15 = new Elemento(new Esfera(2), gl, pathTexturaBrotos);
        this.broto15.escala = vec3(0.2, 0.2, 0.2);
        this.broto15.trans = add(posicaoInicial, vec3(1.5, 4.0, 2.5));
        this.broto15.theta = vec3(0, 0, 0);
        this.broto15.cor.ambiente = vec4(1, 1, 1, 1);
        this.broto15.cor.difusa = vec4(0, 1, 0, 1);
        this.broto15.cor.especular = 50.0;

        this.elementos = [this.terra, this.broto1, this.broto2, this.broto3, this.broto4, 
            this.broto5, this.broto6, this.broto7, this.broto8,
            this.broto9, this.broto10, this.broto11, this.broto12, 
            this.broto13, this.broto14, this.broto15];
    }
}