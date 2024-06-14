class Poliedro {
    constructor() {
        this.inicio = gShader.vertices.length;
        this.nVertices = 0;
    }

    calculaNormal(a, b, c) {
        return vec3(cross(subtract(b, a), subtract(c, a)));
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
    }

    subdivideTriangulo(a, b, c, nivel) {
        if (nivel == 0) {
            this.criaTriangulo(a, b, c);
        } else {
            let ab = normalize(mix(a, b, 0.5));
            let bc = normalize(mix(b, c, 0.5));
            let ca = normalize(mix(c, a, 0.5));

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