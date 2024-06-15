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
            uniform vec3 uLightTrans;

            uniform mat4 uModel;
            uniform mat4 uInvTrans;

            out vec3 vView;
            out vec3 vLight;
            out vec3 vNormal;

            void main() {
                vec4 position = uView * uModel * vec4(aVertex, 1);
                gl_Position = uPerspective * position;

                vNormal = mat3(uInvTrans) * aNormal;
                vLight = (uView * vec4(uLightTrans, 1) - position).xyz;
                vView = -(position.xyz);
            }`;

        this.fragmentShader = `#version 300 es
            precision highp float;

            in vec3 vView;
            in vec3 vLight;
            in vec3 vNormal;

            uniform vec4 uAmbient;
            uniform vec4 uDiffusion;
            uniform vec4 uSpecular;
            uniform float uAlpha;

            out vec4 outColor;

            void main() {
                vec3 nNormal = normalize(vNormal);
                vec3 nLight = normalize(vLight);
                vec3 nView = normalize(vView);
                vec3 nHalf = normalize(nLight + nView);

                float kD = max(0.0, dot(nNormal, nLight));
                vec4 diffusion = kD * uDiffusion;

                float kS = pow(max(0.0, dot(nNormal, nHalf)), uAlpha);
                vec4 specular = vec4(1, 0, 0, 1);
                if (kD > 0.0) { specular = kS * uSpecular; }

                outColor = diffusion + specular + uAmbient;
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
        this.uLightTrans = GL.getUniformLocation(this.programa, "uLightTrans");

        this.uModel = GL.getUniformLocation(this.programa, "uModel");
        this.uInvTrans = GL.getUniformLocation(this.programa, "uInvTrans");

        this.uAmbient = GL.getUniformLocation(this.programa, "uAmbient");
        this.uDiffusion = GL.getUniformLocation(this.programa, "uDiffusion");
        this.uSpecular = GL.getUniformLocation(this.programa, "uSpecular");
        this.uAlpha = GL.getUniformLocation(this.programa, "uAlpha");

        // atributos uniformes carregados apenas uma vez
        let perspectiva = perspective(60, 1, 0.1, 3000);
        GL.uniformMatrix4fv(this.uPerspective, false, flatten(perspectiva));
    }

    /**
     * Carrega uniformes válidos para toda cena, ou seja,
     * que são únicos por frame com dados compactados.
     */
    carregaUniformesGerais(dados) {
        this.GL.uniformMatrix4fv(this.uView, false, flatten(dados.view));
        this.GL.uniform3fv(this.uLightTrans, dados.lightTrans);
    }

    /**
     * Carrega uniformes para elemento da cena, ou seja,
     * que variam em um mesmo frame com dados compactados.
     */
    carregaUniformesEspecificos(dadosModelo, dadosLuz) {
        this.GL.uniformMatrix4fv(this.uModel, false, flatten(dadosModelo.model));
        this.GL.uniformMatrix4fv(this.uInvTrans, false, flatten(dadosModelo.invTrans));
        
        this.GL.uniform4fv(this.uAmbient, dadosLuz.ambient);
        this.GL.uniform4fv(this.uDiffusion, dadosLuz.diffusion);
        this.GL.uniform4fv(this.uSpecular, dadosLuz.specular);
        this.GL.uniform1f(this.uAlpha, dadosLuz.alpha);
    }

    /**
     * Renderiza poliedro utilizando uniformes previamente carregados.
     */
    renderiza(poliedro) {
        this.GL.drawArrays(gGL.TRIANGLES, poliedro.inicio, poliedro.nVertices);
    }
}