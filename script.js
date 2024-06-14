/*
    script.js de MAC0420/MAC5744 - Simulador de Voo

    Nome: Júlia Melo Teixeira dos Santos
    NUSP: 12542306
 */

window.onload = main;

/* ==================================================================
  Constantes e variáveis globais
*/
const STEP_VTRANS = 10.0;
const STEP_THETA = 1.0;
const G = 0.0;

const COLOR = [vec4(0.0, 0.0, 0.0, 1.0),    // black    0
    vec4(1.0, 1.0, 1.0, 1.0),               // white    1
    vec4(1.0, 0.0, 0.0, 1.0),               // red      2
    vec4(0.0, 1.0, 1.0, 1.0),               // cyan     3
    vec4(0.0, 1.0, 0.0, 1.0),               // green    4
    vec4(1.0, 0.0, 1.0, 1.0),               // magenta  5
    vec4(0.0, 0.0, 1.0, 1.0),               // blue     6
    vec4(1.0, 1.0, 0.0, 1.0)];              // yellow   7

var gGL;
var gShader = new Shader();
var gInterface = { theta: vec3(0.0, 0.0, 0.0) };
var gSimulator = { time: 0.0, dt: 0.0 };

/* ==================================================================
  Classes
*/
/**
 * Representação do obstáculo, com escala, posição, angulação e velocidades (linear e angular).
 * Capaz de atualizar posição, angulação e velocidade linear.
 */
class Obstacle {
    constructor(polyhedron = null) {
        this.polyhedron = polyhedron;
        this.scale = vec3(1.0, 1.0, 1.0);
        this.trans = vec3(0.0, 0.0, 0.0);
        this.vtrans = vec3(0.0, 0.0, 0.0);
        this.theta = vec3(0.0, 0.0, 0.0);
        this.vtheta = vec3(0.0, 0.0, 0.0);
    }
    updateTrans() {
        this.trans = add(this.trans, mult(gSimulator.dt, this.vtrans));
    }
    updateVTrans() {
        this.vtrans[2] -= G * gSimulator.dt;
    }
    updateTheta() {
        this.theta = add(this.theta, mult(gSimulator.dt, this.vtheta));
    }
}

/* ==================================================================
  Funções principais
*/
function main() {
    buildInterface();
    buildSimulator();
    createShaders();
    nextFrame();
};

/**
 * Registra os elementos HTML responsáveis pela interação no objeto
 * interface e os associa às rotinas de callback.
 */
function buildInterface() {
    // botões
    gInterface.run = document.getElementById("bRun");
    gInterface.step = document.getElementById("bStep");
    gInterface.activeStep = false;
    gInterface.canvas = document.getElementById("glCanvas");

    // canvas
    gGL = gInterface.canvas.getContext("webgl2");
    if (!gGL)
        alert("Não foi possível usar WebGL 2.0.");

    // registro das funções de callback
    gInterface.run.onclick = callbackRun;
    gInterface.step.onclick = callbackStep;
    onkeypress = callbackKBoard;
}

/**
 * Registra os elementos do simulador de voo em seu objeto.
 */
function buildSimulator() {
    gSimulator.ship = new Camera(vec3(-100, -100, 300), vec3());
    
    gSimulator.obstacles = [];

    let e_poly = new Cilindro(8);
    let e = new Elemento(e_poly);
    e.escala = vec3(30, 30, 30);
    e.trans = vec3(0, 0, 90);
    e.vTheta = vec3(10, 10, 10);
    e.cor = COLOR[4];
    gSimulator.obstacles.push(e);
}

/**
 * Cria e configura shaders de WebGL 2.0.
 */
function createShaders() {
    gShader.criaShaders(gGL, gInterface.canvas.height, gInterface.canvas.width);
}

/**
 * Atualiza os elementos do simulador de voo caso estado seja executando ou passo ativado.
 */
function updateSimulator() {
    if (gInterface.activeStep)
        gSimulator.dt = 1.0;
    else if (gInterface.run.value == "Pausar") {
        let time_now = Date.now()
        gSimulator.dt = (time_now - gSimulator.time) / 1000;
        gSimulator.time = time_now;
    }

    gSimulator.ship.atualizaTrans(gSimulator.dt);
    gSimulator.ship.atualizaTheta(gInterface.theta);
    
    for (let i = 0; i < gSimulator.obstacles.length; i++) {
        let o = gSimulator.obstacles.at(i);
        o.atualizaTrans(gSimulator.dt);
        o.atualizaTheta(gSimulator.dt);
    }
    
    if (gInterface.activeStep) {
        gSimulator.dt = 0.0;
        gInterface.activeStep = false;
    }
}

/**
 * Gera e renderiza próximo frame para ilustração do estado do simulador (animação).
 */
function nextFrame(e) {
    gGL.clear( gGL.COLOR_BUFFER_BIT | gGL.DEPTH_BUFFER_BIT);

    updateSimulator();
    
    let dadosGeral = {
        view: gSimulator.ship.olha(),
        light: vec4(1.0, 1.0, 1.0, 0.0)
    };
    gShader.carregaUniformesGerais(dadosGeral);

    for (let i = 0; i < gSimulator.obstacles.length; i++) {
        let e = gSimulator.obstacles.at(i);
        let dadosElemento = e.renderiza(dadosGeral.view);
        gShader.carregaUniformesEspecificos(dadosElemento);
        gShader.renderiza(e.poliedro);
    }

    window.requestAnimationFrame(nextFrame);
}

/* ==================================================================
  Funções de callback
*/
/**
 * callbackRun
 */
function callbackRun(e) {
    let v = gInterface.run.value;

    if (v == "Pausar") {
        console.log("Simulador pausado.");
        gSimulator.dt = 0.0;
        gInterface.run.value = "Executar";
        gInterface.step.value = "Passo";
        gInterface.step.disabled = false;
    }
    else {
        console.log("Simulador iniciado.");
        gSimulator.time = Date.now();
        gInterface.run.value = "Pausar";
        gInterface.step.value = "";
        gInterface.step.disabled = true;
    }
}

/**
 * callbackStep
 */
function callbackStep(e) {
    console.log("Passo Simulado.");
    gInterface.activeStep = true;
}

/**
 * callbackKBoard
 */
function callbackKBoard(e) {
    let key = e.key.toLowerCase();
    if (key == `k`) {
        gSimulator.ship.vTrans = 0.0;
        console.log("Tecla K: VEL zerada", gSimulator.ship.vTrans);
    }
    else if (key == `j`) {
        gSimulator.ship.vTrans += STEP_VTRANS;
        console.log("Tecla J: VEL+", gSimulator.ship.vTrans);
    }
    else if (key == `l`) {
        gSimulator.ship.vTrans -= STEP_VTRANS;
        console.log("Tecla L: VEL-", gSimulator.ship.vTrans);
    }
    else if (key == `w`) {
        gInterface.theta[X] += STEP_THETA;
        console.log("Tecla W: ROT(X)+ sobe", gInterface.theta);
    }
    else if (key == `x`) {
        gInterface.theta[X] -= STEP_THETA;
        console.log("Tecla X: ROT(X)- desce", gInterface.theta);
    }
    else if (key == `a`) {
        gInterface.theta[Y] += STEP_THETA;
        console.log("Tecla A: ROT(Y)+ esquerda", gInterface.theta);
    }
    else if (key == `d`) {
        gInterface.theta[Y] -= STEP_THETA;
        console.log("Tecla D: ROT(Y)- direita", gInterface.theta);
    }
    else if (key == `z`) {
        gInterface.theta[Z] += STEP_THETA;
        console.log("Tecla Z: ROT(Z)+ anti-horário", gInterface.theta);
    }
    else if (key == `c`) {
        gInterface.theta[Z] -= STEP_THETA;
        console.log("Tecla C: ROT(Z)- horário", gInterface.theta);
    }
    else
        console.log("Tecla de controle inválida.");
}

/* ==================================================================
  Funções auxiliares
*/
/**
 * Converte ângulo em graus para radianos.
 */
function toRad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Gera aleatoriamente um valor em intervalo de tamanho size
 * com limite inferior offset.
 */
function randomIn(size, offset = 0) {
    return Math.random() * size + offset;
}

/**
 * Gera matriz de rotação conjunta de ângulos arbitrários em cada eixo.
 */
function rotateXYZ(x, y, z) {
    let rX = rotateX(x);
    let rY = rotateY(y);
    let rZ = rotateZ(z);
    return mult(rZ, mult(rY, rX));
}

/**
 * Gera cubos em extremidades de eixos com cores diferentes.
 * Auxilia em debug.
 */
function showCoordinateSystem() {
    gSimulator.ship.trans = vec3(0, 0, 0);

    let a_poly = new Cube([2, 1]);
    let a = new Obstacle(a_poly);
    a.trans = vec3(1, 0, 0);
    gSimulator.obstacles.push(a);

    a_poly = new Cube([3, 1]);
    a = new Obstacle(a_poly);
    a.trans = vec3(-1, 0, 0);
    gSimulator.obstacles.push(a);

    a_poly = new Cube([4, 1]);
    a = new Obstacle(a_poly);
    a.trans = vec3(0, 1, 0);
    gSimulator.obstacles.push(a);

    a_poly = new Cube([5, 1]);
    a = new Obstacle(a_poly);
    a.trans = vec3(0, -1, 0);
    gSimulator.obstacles.push(a);

    a_poly = new Cube([6, 1]);
    a = new Obstacle(a_poly);
    a.trans = vec3(0, 0, 1);
    gSimulator.obstacles.push(a);

    a_poly = new Cube([7, 1]);
    a = new Obstacle(a_poly);
    a.trans = vec3(0, 0, -1);
    gSimulator.obstacles.push(a);
}

/* ==================================================================
  Códigos de shaders
*/
var glVertexShaderSrc = `#version 300 es
in vec3 aVertex;
uniform mat4 uView;
uniform mat4 uPerspective;
uniform mat4 uTranslate;
uniform mat4 uScale;
uniform mat4 uRotate;

uniform vec4 aColor;
out vec4 vColor;

void main() {
    mat4 model = uTranslate * uRotate * uScale;
    gl_Position = uPerspective * uView * model * vec4(aVertex, 1);
    vColor = aColor;
}
`;

var glFragmentShaderSrc = `#version 300 es
precision highp float;

in vec4 vColor;
out vec4 outColor;

void main() {
  outColor = vColor;
}
`;