class Poliedro {
    constructor() {
        this.inicio = gShader.vertices.length;
        this.nVertices = 0;
    }

    calculaNormal(a, b, c) {
        return vec3(cross(subtract(b, a), subtract(c, b)));
    }

    criaTriangulo(a, b, c) {
        gShader.vertices.push(a);
        gShader.vertices.push(b);
        gShader.vertices.push(c);
    
        let normal = this.calculaNormal(a, b, c);
        gShader.normais.push(normal);
        gShader.normais.push(normal);
        gShader.normais.push(normal);

        this.nVertices += 3;
    }
}

class Esfera extends Poliedro {
    constructor(subdivisoes) {
        super();
        this.subdivisoes = subdivisoes;
        this.crieEsfera();

        console.log("Esfera:\nVERTICES = ", this.nVertices,
        "\nSHADER = ", gShader.vertices.length);
    }

    subdivideTriangulo(a, b, c, nivel) {
        if (nivel == 0) {
            this.criaTriangulo(a, b, c);
        } else {
            let ab = normalize(vec3(
                (a[0] + b[0]) / 2,
                (a[1] + b[1]) / 2,
                (a[2] + b[2]) / 2
            ));
            
            let bc = normalize(vec3(
                (b[0] + c[0]) / 2,
                (b[1] + c[1]) / 2,
                (b[2] + c[2]) / 2
            ));
            
            let ca = normalize(vec3(
                (c[0] + a[0]) / 2,
                (c[1] + a[1]) / 2,
                (c[2] + a[2]) / 2
            ));

            this.subdivideTriangulo(a, ab, ca, nivel - 1);
            this.subdivideTriangulo(ab, b, bc, nivel - 1);
            this.subdivideTriangulo(bc, c, ca, nivel - 1);
            this.subdivideTriangulo(ab, bc, ca, nivel - 1);
        }
    }

    crieEsfera() {
        const t = (1.0 + Math.sqrt(5.0)) / 2.0;
        
        // vértices de um icosaedro ("esfera primitiva")
        let vertices = [
            vec3(-1, t, 0), vec3(1, t, 0), vec3(-1, -t, 0), vec3(1, -t, 0),
            vec3(0, -1, t), vec3(0, 1, t), vec3(0, -1, -t), vec3(0, 1, -t),
            vec3(t, 0, -1), vec3(t, 0, 1), vec3(-t, 0, -1), vec3(-t, 0, 1)
        ];

        // índices que compõem os triângulos do icosaedro
        let indices = [
            [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
            [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
            [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
            [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
        ];

        for (let i = 0; i < indices.length; i++) {
            let a = normalize(vertices[indices[i][0]]);
            let b = normalize(vertices[indices[i][1]]);
            let c = normalize(vertices[indices[i][2]]);
            this.subdivideTriangulo(a, b, c, this.subdivisoes);
        }
    }
}

class Piramide extends Poliedro {
    constructor() {
        super();

        let verticesPiramide = [
            vec3(0.0,  1.0,  0.0),    // 0
            vec3(-1.0, -1.0,  1.0),   // 1
            vec3(1.0, -1.0,  1.0),    // 2
            vec3(1.0, -1.0, -1.0),    // 3
            vec3(-1.0, -1.0, -1.0),   // 4
        ];

        // faces superiores da pirâmide
        this.criaTriangulo(verticesPiramide[0], verticesPiramide[1], verticesPiramide[2]);
        this.criaTriangulo(verticesPiramide[0], verticesPiramide[2], verticesPiramide[3]);
        this.criaTriangulo(verticesPiramide[0], verticesPiramide[3], verticesPiramide[4]);
        this.criaTriangulo(verticesPiramide[0], verticesPiramide[4], verticesPiramide[1]);

        // base da pirâmide
        this.criaTriangulo(verticesPiramide[3], verticesPiramide[2], verticesPiramide[1]);
        this.criaTriangulo(verticesPiramide[4], verticesPiramide[3], verticesPiramide[1]);
        
        console.log("Pirâmide:\nVERTICES = ", this.nVertices,
            "\nSHADER = ", gShader.vertices.length);
    }
}

class Cilindro extends Poliedro {
    constructor(nLados) {
        super();

        // cria vértices da base e topo do cilindro
        let base = [];
        let topo = [];
        const ang = 2 * Math.PI / nLados;
        for (let i = 0; i < nLados; i++) {
            let x = Math.cos(ang * i);
            let y = Math.sin(ang * i);
            base.push(vec3(x, y, -0.5));
            topo.push(vec3(x, y, 0.5));
        }
        
        // cria face base do cilindro
        let centroBase = vec3(0, 0, -0.5);
        for (let i = 0; i < nLados; i++) {
            let vBase = base.at(i);
            let uBase = base.at((i + 1) % nLados);
            this.criaTriangulo(vBase, centroBase, uBase);
        }

        // cria face topo do cilindro
        let centroTopo = vec3(0, 0, 0.5);
        for (let i = 0; i < nLados; i++) {
            let vTopo= topo.at(i);
            let uTopo = topo.at((i + 1) % nLados);
            this.criaTriangulo(uTopo, centroTopo, vTopo);
        }

        // cria faces laterais do cilindro
        for (let i = 0; i < nLados; i++) {
            // vértices que compõem as faces
            let vBase = base.at(i);
            let vTopo = topo.at(i);
            let uBase = base.at((i + 1) % nLados);
            let uTopo = topo.at((i + 1) % nLados);

            this.criaTriangulo(uBase, vTopo, vBase); // 1° triângulo do corpo
            this.criaTriangulo(uTopo, vTopo, uBase); // 2° triângulo do corpo
        }

        console.log("Cilindro:\nVERTICES = ", this.nVertices,
            "\nSHADER = ", gShader.vertices.length);
    }
}

class Cubo extends Poliedro {
    constructor() {
        super();
        let verticesCubo = [
            vec3(-0.5, -0.5, 0.5),
            vec3(-0.5, 0.5, 0.5),
            vec3(0.5, 0.5, 0.5),
            vec3(0.5, -0.5, 0.5),
            vec3(-0.5, -0.5, -0.5),
            vec3(-0.5, 0.5, -0.5),
            vec3(0.5, 0.5, -0.5),
            vec3(0.5, -0.5, -0.5)
        ];

        this.criaTriangulo(verticesCubo[1], verticesCubo[0], verticesCubo[3]);
        this.criaTriangulo(verticesCubo[1], verticesCubo[3], verticesCubo[2]);

        this.criaTriangulo(verticesCubo[2], verticesCubo[3], verticesCubo[7]);
        this.criaTriangulo(verticesCubo[2], verticesCubo[7], verticesCubo[6]);

        this.criaTriangulo(verticesCubo[3], verticesCubo[0], verticesCubo[4]);
        this.criaTriangulo(verticesCubo[3], verticesCubo[4], verticesCubo[7]);

        this.criaTriangulo(verticesCubo[6], verticesCubo[5], verticesCubo[1]);
        this.criaTriangulo(verticesCubo[6], verticesCubo[1], verticesCubo[2]);

        this.criaTriangulo(verticesCubo[4], verticesCubo[5], verticesCubo[6]);
        this.criaTriangulo(verticesCubo[4], verticesCubo[6], verticesCubo[7]);

        this.criaTriangulo(verticesCubo[5], verticesCubo[4], verticesCubo[0]);
        this.criaTriangulo(verticesCubo[5], verticesCubo[0], verticesCubo[1]);

        console.log("Cubo:\nVERTICES = ", this.nVertices,
            "\nSHADER = ", gShader.vertices.length);
    }
}