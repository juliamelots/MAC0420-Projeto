
window.onload = main;

// variáveis globais relacionadas à parte gráfica
var gGL;
var gShader = new Shader();
var gInterface = {};

// constantes placeholders da câmera
const EYE = vec3(5, 5, 5);
const AT = vec3(0, 0, 0);
const UP = vec3(0, 1, 0);

// constantes dos eixos
const X = 0;
const Y = 1;
const Z = 2


// main
function main() {
    constroiInterface();
    let esfera = new Esfera(4);
    crieShaders();
    renderizaEsfera(esfera);
};

// constrói a interface básica (acessa o canvas)
function constroiInterface() {
    gInterface.canvas = document.getElementById("glCanvas");

    gGL = gInterface.canvas.getContext("webgl2");
    if (!gGL)
        alert("Não foi possível usar WebGL 2.0.");
}


// cria os shaders em WebGL
function crieShaders() {
    gShader.criaShaders(gGL, gInterface.canvas.height, gInterface.canvas.width);
}


// renderiza a esfera
function renderizaEsfera(esfera) {
    let elemento = new Elemento(esfera);

    gGL.clear( gGL.COLOR_BUFFER_BIT | gGL.DEPTH_BUFFER_BIT);
    
    let dadosGeral = {
        view: lookAt(EYE, AT, UP),
        light: vec4(1.0, 1.0, 1.0, 0.0)
    };

    gShader.carregaUniformesGerais(dadosGeral);

    let dadosElemento = elemento.renderiza(dadosGeral.view);

    gShader.carregaUniformesEspecificos(dadosElemento);

    gShader.renderiza(elemento.poliedro); // desenha o poliedro em si 
}

function rotateXYZ(x, y, z) {
    let rX = rotateX(x);
    let rY = rotateY(y);
    let rZ = rotateZ(z);
    return mult(rZ, mult(rY, rX));
}
