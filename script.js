/*
    script.js de MAC0420/MAC5744 - Jardim

    Clara Yuki Sano - 11809920
    Júlia Melo Teixeira dos Santos - 12542306
    Luísa Menezes da Costa - 12676491
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

const urlTextura = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Flower_poster_2.jpg/1200px-Flower_poster_2.jpg";
const urlTextura2 = "https://www.google.com/url?sa=i&url=https%3A%2F%2Fdepositphotos.com%2Fbr%2Fphotos%2Fgrama-com-flores.html&psig=AOvVaw1SJC2ELzL0kaj-cJ4L7c7k&ust=1719152541219000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCMiK7LW074YDFQAAAAAdAAAAABA9";

var vTextura = [
    vec2(0.0, 0.0),
    vec2(0.0, 1.0),
    vec2(1.0, 1.0),
    vec2(1.0, 0.0)
];

var gGL;
var gShader = new Shader();
var gInterface = { theta: vec3(0.0, 0.0, 0.0) };
var gSimulator = { time: 0.0, dt: 0.0 };

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
    gSimulator.ship = new Camera(vec3(15, -15, 10), vec3(60, 0, 45));
    gInterface.theta = vec3(60, 0, 45);

    let sol = new Elemento(null, gGL, null);
    sol.trans = vec3(0, 0, 65);
    sol.cor.ambiente = vec4(0.2, 0.2, 0.2, 1);
    sol.cor.difusa = vec4(1, 1, 1, 1);
    sol.cor.especular = vec4(1, 1, 1, 1);
    gSimulator.sol = sol;
    
    gSimulator.obstacles = [];

    // chão
    let pathTexturaChao = "./assets/grass.jpg";
    let chao = new Elemento(new Cubo(), gGL, pathTexturaChao);
    chao.escala = vec3(25, 25, 5);
    chao.trans = vec3(0, 0, -2.5);
    chao.cor.ambiente = vec4(1, 1, 1, 1);
    chao.cor.difusa = vec4(1, 1, 1, 1);
    chao.cor.especular = 150.0;
    gSimulator.obstacles.push(chao);

    // lago
    let lago = new Elemento(new Cubo(), gGL, null);
    lago.escala = vec3(10, 10, 5);
    lago.trans = vec3(-6, -7.5, -2.45);
    lago.cor.ambiente = vec4(0, 0, 1, 1);
    lago.cor.difusa = vec4(0, 0, 1, 1);
    lago.cor.especular = 50.0;
    gSimulator.obstacles.push(lago);

    // árvore
    let tronco = new Elemento(new Cilindro(8), gGL, null);
    tronco.escala = vec3(0.5, 0.5, 3);
    tronco.trans = vec3(-7.5, 0, 1.5);
    tronco.cor.ambiente = vec4(0.42, 0.28, 0.16, 1);
    tronco.cor.difusa = vec4(0.42, 0.28, 0.16, 1);
    tronco.cor.especular = 50.0;
    gSimulator.obstacles.push(tronco);
    let pathTexturaFolhas = "./assets/tree_leaves.jpg";
    let folhas = new Elemento(new Esfera(2), gGL, pathTexturaFolhas);
    folhas.escala = vec3(1.5, 1.5, 1);
    folhas.trans = vec3(-7.5, 0, 3.5);
    folhas.cor.ambiente = vec4(0.3, 0.43, 0, 1);
    folhas.cor.difusa = vec4(0.3, 0.43, 0, 1);
    folhas.cor.especular = 50.0;
    gSimulator.obstacles.push(folhas);

    // animais
    let pathTexturaCorpoAbelha = "./assets/bee_body.jpg";
    let pathTexturaAsas = "./assets/bug_wing2.jpg";
    let abelha = new Abelha(gGL, pathTexturaCorpoAbelha, pathTexturaAsas, vec3(7.5, 7.5, 5));
    gSimulator.abelha = abelha;
    gSimulator.obstacles.push(...abelha.elementos);

    let pathTexturaPeixeCorpo = "./assets/fish_texture.jpg";
    let pathTexturaPeixeCauda = "./assets/fish_texture.jpg";
    let peixe = new Peixe(gGL, pathTexturaPeixeCorpo, pathTexturaPeixeCauda, vec3(-6, -7.5, 0));
    gSimulator.peixe = peixe;
    gSimulator.obstacles.push(...peixe.elementos);

    let caracol = new Caracol(gGL, null, null, vec3(-7.5, 7.5, 0.35));
    gSimulator.caracol = caracol;
    gSimulator.obstacles.push(...caracol.elementos);
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

    if (gSimulator.abelha) 
        gSimulator.abelha.atualizaMovimentoCircular(gSimulator.dt);

    if (gSimulator.peixe) 
        gSimulator.peixe.atualizaMovimentoInfinito(gSimulator.dt);

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
        lightTrans: gSimulator.sol.trans,
        shadow: gSimulator.sol.calculaSombra()
    };
    gShader.carregaUniformesGerais(dadosGeral);

    for (let i = 0; i < gSimulator.obstacles.length; i++) {
        let e = gSimulator.obstacles.at(i);
        let dadosModelo = e.calculaUniformesModelo(dadosGeral.view);
        let dadosLuz = gSimulator.sol.calculaUniformesLuz(e);
        let dadosMaterial = e.calculaUniformesMaterial();
        gShader.carregaUniformesEspecificos(dadosModelo, dadosLuz, dadosMaterial);
        gShader.renderiza(e);
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