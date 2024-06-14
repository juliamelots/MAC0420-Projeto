class Shader {
    constructor() {
        this.nVertices = 0;
        this.vertices = [];
        this.normais = [];

        this.vertexShader = `#version 300 es
            in vec3 aVertex;
            in vec3 aNormal;

            uniform mat4 uPerspective;
            uniform mat4 uView;
            uniform mat4 uModel;
            uniform mat4 uInvTrans;

            uniform vec4 uColor;
            uniform vec4 uLight;

            out vec4 vColor;
            out vec3 vNormal;
            out vec3 vLight;

            void main() {
                gl_Position = uPerspective * uView * uModel * vec4(aVertex, 1);

                vColor = uColor;
                vNormal = mat3(uInvTrans) * aNormal;
                vLight = mat3(uView) * uLight.xyz;
            }`;

        this.fragmentShader = `#version 300 es
            precision highp float;

            in vec4 vColor;
            in vec3 vNormal;
            in vec3 vLight;

            uniform vec4 uDiffusion;

            out vec4 outColor;

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 normalLight = normalize(vLight);
                float k = dot(normal, normalLight);

                outColor = vColor;
                if (k > 0.0) { outColor = k * uDiffusion; }
                outColor.a = 1.0;
            }`;
    }

    /**
     * Cria e configura shaders de WebGL 2.0.
     */
    criaShaders(GL, altura, largura) {
        // inicializa
        this.GL = GL;
        GL.viewport(0, 0, largura, altura);
        GL.clearColor(0.0, 0.0, 0.55, 1.0);
        GL.enable(GL.DEPTH_TEST);
        console.log("Canvas: ", largura, altura);

        // cria programa (shaders)
        this.programa = makeProgram(GL, this.vertexShader, this.fragmentShader);
        GL.useProgram(this.programa);
        
        // buffer de vértices
        this.bufVertices = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.bufVertices);
        GL.bufferData(GL.ARRAY_BUFFER, flatten(this.vertices), GL.STATIC_DRAW);
        
        // configuração de leitura do buffer de vértices
        let aVertex = GL.getAttribLocation(this.programa, "aVertex");
        GL.vertexAttribPointer(aVertex, 3, GL.FLOAT, false, 0, 0);
        GL.enableVertexAttribArray(aVertex);

        // buffer de normais
        this.bufNormais = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.bufNormais);
        GL.bufferData(GL.ARRAY_BUFFER, flatten(this.normais), GL.STATIC_DRAW);

        // configuração de leitura do buffer de normais
        let aNormal = GL.getAttribLocation(this.programa, "aNormal");
        GL.vertexAttribPointer(aNormal, 3, GL.FLOAT, false, 0, 0);
        GL.enableVertexAttribArray(aNormal);
        
        // atributos uniformes
        this.uPerspective = GL.getUniformLocation(this.programa, "uPerspective");
        this.uView = GL.getUniformLocation(this.programa, "uView");
        this.uModel = GL.getUniformLocation(this.programa, "uModel");
        this.uInvTrans = GL.getUniformLocation(this.programa, "uInvTrans");

        this.uColor = GL.getUniformLocation(this.programa, "uColor");
        this.uLight = GL.getUniformLocation(this.programa, "uLight");
        this.uDiffusion = GL.getUniformLocation(this.programa, "uDiffusion");

        // atributos uniformes carregados apenas uma vez
        let perspectiva = perspective(60, 1, 0.1, 3000);
        GL.uniformMatrix4fv(this.uPerspective, false, flatten(perspectiva));
    }

    carregaUniformesGerais(dados) {
        this.GL.uniformMatrix4fv(this.uView, false, flatten(dados.view));
        this.GL.uniform4fv(this.uLight, dados.light);
    }

    carregaUniformesEspecificos(dados) {
        this.GL.uniformMatrix4fv(this.uModel, false, flatten(dados.model));
        this.GL.uniformMatrix4fv(this.uInvTrans, false, flatten(dados.invTrans));
        this.GL.uniform4fv(this.uColor, dados.color);
        // TO-DO texture
        this.GL.uniform4fv(this.uDiffusion, dados.diffusion);
    }

    renderiza(poliedro) {
        this.GL.drawArrays(gGL.TRIANGLES, poliedro.inicio, poliedro.nVertices);
    }
}