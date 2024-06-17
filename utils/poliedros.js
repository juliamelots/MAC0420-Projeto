class Poliedro {
    constructor(temTextura) {
        this.inicio = gShader.vertices.length;
        this.nVertices = 0;
        this.temTextura = temTextura;
    }

    calculaNormal(a, b, c) {
        return vec3(cross(subtract(b, a), subtract(c, b)));
    }

    criaTriangulo(a, b, c, texA, texB, texC) {
        gShader.vertices.push(a);
        gShader.vertices.push(b);
        gShader.vertices.push(c);
    
        let normal = this.calculaNormal(a, b, c);
        gShader.normais.push(normal);
        gShader.normais.push(normal);
        gShader.normais.push(normal);

        gShader.texCoords.push(texA);
        gShader.texCoords.push(texB);
        gShader.texCoords.push(texC);

        this.nVertices += 3;
    }
}

class Esfera extends Poliedro {
    constructor(subdivisoes, temTextura = 0) {
        super(temTextura);
        this.subdivisoes = subdivisoes;
        this.crieEsfera();

        console.log("Esfera:\nVERTICES = ", this.nVertices,
        "\nSHADER = ", gShader.vertices.length);
    }

    subdivideTriangulo(a, b, c, texA, texB, texC, nivel) {
        if (nivel == 0) {
            this.criaTriangulo(a, b, c, texA, texB, texC);
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

            let texAB = vec2((texA[0] + texB[0]) / 2, (texA[1] + texB[1]) / 2);
            let texBC = vec2((texB[0] + texC[0]) / 2, (texB[1] + texC[1]) / 2);
            let texCA = vec2((texC[0] + texA[0]) / 2, (texC[1] + texA[1]) / 2);

            this.subdivideTriangulo(a, ab, ca, texA, texAB, texCA, nivel - 1);
            this.subdivideTriangulo(ab, b, bc, texAB, texB, texBC, nivel - 1);
            this.subdivideTriangulo(bc, c, ca, texBC, texC, texCA, nivel - 1);
            this.subdivideTriangulo(ab, bc, ca, texAB, texBC, texCA, nivel - 1);
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
            let texA = this.pegaTexCoords(a);
            let texB = this.pegaTexCoords(b);
            let texC = this.pegaTexCoords(c);
            this.subdivideTriangulo(a, b, c, texA, texB, texC, this.subdivisoes);
        }
    }

    pegaTexCoords(v) {
        let coord_u = 0.5 + (Math.atan2(v[2], v[0]) / (2 * Math.PI));
        let coord_v = 0.5 - (Math.asin(v[1]) / Math.PI);
        return vec2(coord_u, coord_v);
    }
}

class Piramide extends Poliedro {
    constructor(temTextura = 0) {
        super(temTextura);

        let verticesPiramide = [
            vec3(0.0,  1.0,  0.0),    // 0
            vec3(-1.0, -1.0,  1.0),   // 1
            vec3(1.0, -1.0,  1.0),    // 2
            vec3(1.0, -1.0, -1.0),    // 3
            vec3(-1.0, -1.0, -1.0),   // 4
        ];

        let texCoordsPiramide = [
            vec2(0.5, 1.0),   // topo
            vec2(0.0, 0.0),   // canto esquerdo
            vec2(1.0, 0.0),   // canto direito
        ];

        // faces superiores da pirâmide
        this.criaTriangulo(verticesPiramide[0], verticesPiramide[1], verticesPiramide[2], texCoordsPiramide[0], texCoordsPiramide[1], texCoordsPiramide[2]);
        this.criaTriangulo(verticesPiramide[0], verticesPiramide[2], verticesPiramide[3], texCoordsPiramide[0], texCoordsPiramide[1], texCoordsPiramide[2]);
        this.criaTriangulo(verticesPiramide[0], verticesPiramide[3], verticesPiramide[4], texCoordsPiramide[0], texCoordsPiramide[1], texCoordsPiramide[2]);
        this.criaTriangulo(verticesPiramide[0], verticesPiramide[4], verticesPiramide[1], texCoordsPiramide[0], texCoordsPiramide[1], texCoordsPiramide[2]);

        // base da pirâmide
        this.criaTriangulo(verticesPiramide[3], verticesPiramide[2], verticesPiramide[1], texCoordsPiramide[0], texCoordsPiramide[1], texCoordsPiramide[2]);
        this.criaTriangulo(verticesPiramide[4], verticesPiramide[3], verticesPiramide[1], texCoordsPiramide[0], texCoordsPiramide[1], texCoordsPiramide[2]);
        
        console.log("Pirâmide:\nVERTICES = ", this.nVertices,
            "\nSHADER = ", gShader.vertices.length);
    }
}

class Cilindro extends Poliedro {
    constructor(nLados, temTextura = 0) {
        super(temTextura);

        // cria vértices da base e topo do cilindro
        let base = [];
        let topo = [];
        let texCoordsBase = [];
        let texCoordsTopo = [];
        const ang = 2 * Math.PI / nLados;
        for (let i = 0; i < nLados; i++) {
            let x = Math.cos(ang * i);
            let y = Math.sin(ang * i);
            base.push(vec3(x, y, -0.5));
            topo.push(vec3(x, y, 0.5));
            texCoordsBase.push(vec2((x + 1) / 2, (y + 1) / 2));
            texCoordsTopo.push(vec2((x + 1) / 2, (y + 1) / 2));
        }
        
        // cria face base do cilindro
        let centroBase = vec3(0, 0, -0.5);
        let texCentroBase = vec2(0.5, 0.5);
        for (let i = 0; i < nLados; i++) {
            let vBase = base.at(i);
            let uBase = base.at((i + 1) % nLados);
            let texVBase = texCoordsBase[i];
            let texUBase = texCoordsBase[(i + 1) % nLados];
            this.criaTriangulo(vBase, centroBase, uBase, texVBase, texCentroBase, texUBase);
        }

        // cria face topo do cilindro
        let centroTopo = vec3(0, 0, 0.5);
        let texCentroTopo = vec2(0.5, 0.5);
        for (let i = 0; i < nLados; i++) {
            let vTopo= topo.at(i);
            let uTopo = topo.at((i + 1) % nLados);
            let texVTopo = texCoordsTopo[i];
            let texUTopo = texCoordsTopo[(i + 1) % nLados];
            this.criaTriangulo(uTopo, centroTopo, vTopo, texUTopo, texCentroTopo, texVTopo);
        }

        // cria faces laterais do cilindro
        for (let i = 0; i < nLados; i++) {
            // vértices que compõem as faces
            let vBase = base.at(i);
            let vTopo = topo.at(i);
            let uBase = base.at((i + 1) % nLados);
            let uTopo = topo.at((i + 1) % nLados);
            let texVBase = texCoordsBase[i];
            let texVTopo = texCoordsTopo[i];
            let texUBase = texCoordsBase[(i + 1) % nLados];
            let texUTopo = texCoordsTopo[(i + 1) % nLados];

            this.criaTriangulo(uBase, vTopo, vBase, texUBase, texVTopo, texVBase); // 1° triângulo do corpo
            this.criaTriangulo(uTopo, vTopo, uBase, texUTopo, texVTopo, texUBase); // 2° triângulo do corpo
        }

        console.log("Cilindro:\nVERTICES = ", this.nVertices,
            "\nSHADER = ", gShader.vertices.length);
    }
}

class Cubo extends Poliedro {
    constructor(temTextura = 0) {
        super(temTextura);
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

        let texCoordsCubo = [
            vec2(0, 0), vec2(0, 1), vec2(1, 1), vec2(1, 0)
        ];

        // Frente
        this.criaTriangulo(verticesCubo[1], verticesCubo[0], verticesCubo[3], texCoordsCubo[1], texCoordsCubo[0], texCoordsCubo[3]);
        this.criaTriangulo(verticesCubo[1], verticesCubo[3], verticesCubo[2], texCoordsCubo[1], texCoordsCubo[3], texCoordsCubo[2]);

        // Direita
        this.criaTriangulo(verticesCubo[2], verticesCubo[3], verticesCubo[7], texCoordsCubo[1], texCoordsCubo[0], texCoordsCubo[3]);
        this.criaTriangulo(verticesCubo[2], verticesCubo[7], verticesCubo[6], texCoordsCubo[1], texCoordsCubo[3], texCoordsCubo[2]);

        // Trás
        this.criaTriangulo(verticesCubo[3], verticesCubo[0], verticesCubo[4], texCoordsCubo[1], texCoordsCubo[0], texCoordsCubo[3]);
        this.criaTriangulo(verticesCubo[3], verticesCubo[4], verticesCubo[7], texCoordsCubo[1], texCoordsCubo[3], texCoordsCubo[2]);

        // Esquerda
        this.criaTriangulo(verticesCubo[6], verticesCubo[5], verticesCubo[1], texCoordsCubo[1], texCoordsCubo[0], texCoordsCubo[3]);
        this.criaTriangulo(verticesCubo[6], verticesCubo[1], verticesCubo[2], texCoordsCubo[1], texCoordsCubo[3], texCoordsCubo[2]);

        // Base
        this.criaTriangulo(verticesCubo[4], verticesCubo[5], verticesCubo[6], texCoordsCubo[1], texCoordsCubo[0], texCoordsCubo[3]);
        this.criaTriangulo(verticesCubo[4], verticesCubo[6], verticesCubo[7], texCoordsCubo[1], texCoordsCubo[3], texCoordsCubo[2]);

        // Topo
        this.criaTriangulo(verticesCubo[5], verticesCubo[4], verticesCubo[0], texCoordsCubo[1], texCoordsCubo[0], texCoordsCubo[3]);
        this.criaTriangulo(verticesCubo[5], verticesCubo[0], verticesCubo[1], texCoordsCubo[1], texCoordsCubo[3], texCoordsCubo[2]);

        console.log("Cubo:\nVERTICES = ", this.nVertices,
            "\nSHADER = ", gShader.vertices.length);
    }
}