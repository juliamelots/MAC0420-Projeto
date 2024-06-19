class Shader {
    constructor() {
        this.nVertices = 0;
        this.vertices = [];
        this.normais = [];
        this.texCoords = [];

        this.vertexShader = `#version 300 es
            in vec3 aVertex;
            in vec3 aNormal;
            in vec2 aTexCoord;

            uniform mat4 uPerspective;
            uniform mat4 uView;
            uniform vec3 uLightTrans;

            uniform bool uIsShadow;
            uniform mat4 uShadow;

            uniform mat4 uModel;
            uniform mat4 uInvTrans;

            uniform bool uHasTexture;

            out vec3 vView;
            out vec3 vLight;
            out vec3 vNormal;
            out vec2 vTexCoord;

            void main() {
                vec4 position = uModel * vec4(aVertex, 1);
                if (uIsShadow) {
                    float normalizer = (uLightTrans.z - position.z);
                    position = (uShadow * position) / normalizer;
                    gl_Position = uPerspective * uView * position;

                    vNormal = vec3(0, 0, 0);
                    vLight = vec3(0, 0, 0);
                    vView = vec3(0, 0, 0);
                    vTexCoord = aTexCoord;
                }
                else {
                    position = uView * position;
                    gl_Position = uPerspective * position;

                    vNormal = mat3(uInvTrans) * aNormal;
                    vLight = (uView * vec4(uLightTrans, 1) - position).xyz;
                    vView = -(position.xyz);
                    vTexCoord = aTexCoord;
                }
            }`;

        this.fragmentShader = `#version 300 es
            precision highp float;

            in vec3 vView;
            in vec3 vLight;
            in vec3 vNormal;
            in vec2 vTexCoord;

            uniform bool uIsShadow;

            uniform vec4 uAmbient;
            uniform vec4 uDiffusion;
            uniform vec4 uSpecular;
            uniform float uAlpha;

            uniform bool uHasTexture;
            uniform sampler2D uTextureMap;

            out vec4 outColor;
            
            void main() {
                if (uIsShadow) {
                    outColor = vec4(0, 0, 0, 1);
                }
                else {
                    vec3 nNormal = normalize(vNormal);
                    vec3 nLight = normalize(vLight);
                    vec3 nView = normalize(vView);
                    vec3 nHalf = normalize(nLight + nView);

                    float kD = max(0.0, dot(nNormal, nLight));
                    vec4 diffusion = kD * uDiffusion;

                    float kS = pow(max(0.0, dot(nNormal, nHalf)), uAlpha);
                    vec4 specular = vec4(0, 0, 0, 1);
                    if (kD > 0.0) { specular = kS * uSpecular; }

                    vec4 baseColor = uAmbient + diffusion + specular;
                    baseColor.a = 1.0;
                    
                    if (uHasTexture) {
                        vec4 textureColor = texture(uTextureMap, vTexCoord);
                        outColor = baseColor * textureColor;
                    } else {
                        outColor = baseColor;
                    }
                }
            }`;
    }

    /**
     * Cria e configura shaders de WebGL 2.0.
     */
    criaShaders(GL, altura, largura, url) {
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
        console.log("Vertices: ", this.vertices.length);
        
        // configuração de leitura do buffer de vértices
        let aVertex = GL.getAttribLocation(this.programa, "aVertex");
        GL.vertexAttribPointer(aVertex, 3, GL.FLOAT, false, 0, 0);
        GL.enableVertexAttribArray(aVertex);

        // buffer de normais
        this.bufNormais = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.bufNormais);
        GL.bufferData(GL.ARRAY_BUFFER, flatten(this.normais), GL.STATIC_DRAW);
        console.log("Normais: ", this.normais.length);

        // configuração de leitura do buffer de normais
        let aNormal = GL.getAttribLocation(this.programa, "aNormal");
        GL.vertexAttribPointer(aNormal, 3, GL.FLOAT, false, 0, 0);
        GL.enableVertexAttribArray(aNormal);

        // buffer de texturas
        this.bufTextura = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.bufTextura);
        GL.bufferData(GL.ARRAY_BUFFER, flatten(this.texCoords), GL.STATIC_DRAW);

        // configuração de leitura do buffer de texturas
        let aTexCoord = GL.getAttribLocation(this.programa, "aTexCoord");
        GL.vertexAttribPointer(aTexCoord, 2, GL.FLOAT, false, 0, 0);
        GL.enableVertexAttribArray(aTexCoord);

        GL.uniform1i(GL.getUniformLocation(this.programa, "uTextureMap"), 0);

        // atributos uniformes
        this.uPerspective = GL.getUniformLocation(this.programa, "uPerspective");
        this.uView = GL.getUniformLocation(this.programa, "uView");

        this.uShadow = GL.getUniformLocation(this.programa, "uShadow");
        this.uIsShadow = GL.getUniformLocation(this.programa, "uIsShadow");
        this.uLightTrans = GL.getUniformLocation(this.programa, "uLightTrans");

        this.uModel = GL.getUniformLocation(this.programa, "uModel");
        this.uInvTrans = GL.getUniformLocation(this.programa, "uInvTrans");

        this.uAmbient = GL.getUniformLocation(this.programa, "uAmbient");
        this.uDiffusion = GL.getUniformLocation(this.programa, "uDiffusion");
        this.uSpecular = GL.getUniformLocation(this.programa, "uSpecular");
        this.uAlpha = GL.getUniformLocation(this.programa, "uAlpha");

        this.uHasTexture = GL.getUniformLocation(this.programa, "uHasTexture");

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
        this.GL.uniformMatrix4fv(this.uShadow, false, flatten(dados.shadow));
    }

    /**
     * Carrega uniformes para elemento da cena, ou seja,
     * que variam em um mesmo frame com dados compactados.
     */
    carregaUniformesEspecificos(dadosModelo, dadosLuz, dadosMaterial) {
        this.GL.uniformMatrix4fv(this.uModel, false, flatten(dadosModelo.model));
        this.GL.uniformMatrix4fv(this.uInvTrans, false, flatten(dadosModelo.invTrans));
        
        this.GL.uniform4fv(this.uAmbient, dadosLuz.ambient);
        this.GL.uniform4fv(this.uDiffusion, dadosLuz.diffusion);
        this.GL.uniform4fv(this.uSpecular, dadosLuz.specular);
        this.GL.uniform1f(this.uAlpha, dadosLuz.alpha);

        this.GL.activeTexture(this.GL.TEXTURE0);
        this.GL.bindTexture(this.GL.TEXTURE_2D, dadosMaterial.textura);

        if (!dadosMaterial.img.complete || !dadosMaterial.temTextura) {
            this.GL.texImage2D(this.GL.TEXTURE_2D, 0, this.GL.RGBA, 1, 1, 0, this.GL.RGBA, this.GL.UNSIGNED_BYTE,
                new Uint8Array([255, 0, 0, 255]));
        }
        else {
            this.GL.texImage2D(this.GL.TEXTURE_2D, 0, this.GL.RGBA, dadosMaterial.img.width, dadosMaterial.img.height, 0, this.GL.RGBA, this.GL.UNSIGNED_BYTE, dadosMaterial.img);
            this.GL.generateMipmap(this.GL.TEXTURE_2D);
        }
    }

    /**
     * Renderiza poliedro utilizando uniformes previamente carregados.
     */
    renderiza(elemento) {
        this.GL.uniform1i(this.uIsShadow, 0);
        this.GL.uniform1i(this.uHasTexture, elemento.temTextura ? 1 : 0);
        this.GL.drawArrays(gGL.TRIANGLES, elemento.poliedro.inicio, elemento.poliedro.nVertices);
        this.GL.uniform1i(this.uIsShadow, 1);
        this.GL.uniform1i(this.uHasTexture, 0);
        this.GL.drawArrays(gGL.TRIANGLES, elemento.poliedro.inicio, elemento.poliedro.nVertices);
    }
}