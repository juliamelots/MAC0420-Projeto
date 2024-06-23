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
const STEP_VTRANS = 5.0;
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

const JARDIM = 0;
const ABELHA = 1;
const CARACOL = 2;
const PEIXE = 3;

var POVs = [
    true,   // jardim
    false,  // abelha
    false,  // caracol
    false,  // peixe
]


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
    gInterface.slider = document.getElementById("sun");
    gInterface.slider.value = 10.0;

    gInterface.abelha = document.getElementById("btAbelha");
    gInterface.caracol = document.getElementById("btCaracol");
    gInterface.peixe = document.getElementById("btPeixe");
    gInterface.jardim = document.getElementById("btJardim");

    // canvas
    gGL = gInterface.canvas.getContext("webgl2");
    if (!gGL)
        alert("Não foi possível usar WebGL 2.0.");

    // registro das funções de callback
    gInterface.run.onclick = callbackRun;
    gInterface.step.onclick = callbackStep;
    gInterface.slider.onchange = callbackChangeDay;

    gInterface.abelha.onclick = callbackAbelha;
    gInterface.caracol.onclick = callbackCaracol;
    gInterface.peixe.onclick = callbackPeixe;
    gInterface.jardim.onclick = callbackJardim;

    onkeypress = callbackKBoard;
}

/**
 * Registra os elementos do simulador de voo em seu objeto.
 */
function buildSimulator() {
    // câmera
    gSimulator.ship = new Camera(vec3(15, -15, 10), vec3(60, 0, 45));
    //gSimulator.ship = new Camera(vec3(-3, -10, 2), vec3(60, 0, 45)); // olhando peixe
    //gSimulator.ship = new Camera(vec3(7.5, 7.5, 5), vec3(60, 0, 180));
    //gSimulator.ship = new Camera(vec3(9.5, 16.8, 2.2), vec3(83, 0, 163));
    //gSimulator.ship = new Camera(vec3(8.5, 10, 7), vec3(60, 0, 45));

    // muda o AT da camera
    //gInterface.theta = vec3(70, 0, -180);
    gInterface.theta = vec3(60, 0, 45);

    // sol
    let sol = new Elemento(null, gGL, null);
    sol.trans = vec3(0, 0, 65);
    sol.cor.ambiente = vec4(0.2, 0.2, 0.2, 1);
    sol.cor.difusa = vec4(1, 1, 1, 1);
    sol.cor.especular = vec4(1, 1, 1, 1);
    gSimulator.sol = sol;
    
    gSimulator.bases = [];
    gSimulator.obstaculos = [];
    gSimulator.animais = [];
    
    // chão
    let pathTexturaChao = "./assets/grass.jpg";
    let chao = new Chao(gGL, pathTexturaChao, vec3(0, 0, -2.52));
    gSimulator.bases.push(chao.elemento);
    
    // lago
    let lago = new Lago(gGL, null, vec3(-6, -7.5, -2.51));
    gSimulator.bases.push(lago.elemento);
    
    // horta
    let pathTexturaTerra = "./assets/dirt.jpg";
    let horta = new Horta(gGL, pathTexturaTerra, null, vec3(8, -5.5, -2.51));
    gSimulator.bases.push(horta.elementos.at(0));
    gSimulator.obstaculos.push(...horta.elementos.slice(1));

    // árvores
    let arvore1 = new Arvore(gGL, null, null, vec3(-7.5, 0, 1.5));
    gSimulator.obstaculos.push(...arvore1.elementos);
    let arvore2 = new Arvore(gGL, null, null, vec3(1.5, 9.0, 1.5));
    gSimulator.obstaculos.push(...arvore2.elementos);

    // pedras
    let pathTexturaPedra = "./assets/rock.jpg";
    let pedra1 = new Pedra(gGL, pathTexturaPedra, vec3(0, -10.5, 0), vec3(0.7, 0.7, 0.7));
    gSimulator.obstaculos.push(pedra1.elemento);
    let pedra2 = new Pedra(gGL, pathTexturaPedra, vec3(0, -11.5, 0), vec3(0.5, 0.4, 0.7));
    gSimulator.obstaculos.push(pedra2.elemento);
    let pedra3 = new Pedra(gGL, pathTexturaPedra, vec3(0.5, -11.0, 0), vec3(0.6, 0.4, 0.7));
    gSimulator.obstaculos.push(pedra3.elemento);
    let pedra4 = new Pedra(gGL, pathTexturaPedra, vec3(0, -3.5, 0), vec3(0.7, 0.7, 0.7));
    gSimulator.obstaculos.push(pedra4.elemento);
    let pedra5 = new Pedra(gGL, pathTexturaPedra, vec3(0, -4.5, 0), vec3(0.5, 0.4, 0.7));
    gSimulator.obstaculos.push(pedra5.elemento);
    let pedra6 = new Pedra(gGL, pathTexturaPedra, vec3(0.5, -4.0, 0), vec3(0.6, 0.4, 0.7));
    gSimulator.obstaculos.push(pedra6.elemento);

    // animais
    let pathTexturaCorpoAbelha = "./assets/bee_body.jpg";
    let pathTexturaAsas = "./assets/bug_wing2.jpg";
    let abelha = new Abelha(gGL, pathTexturaCorpoAbelha, pathTexturaAsas, vec3(7.5, 7.5, 5));
    gSimulator.abelha = abelha;
    gSimulator.animais.push(abelha);

    let pathTexturaPeixeCorpo = "./assets/fish_texture.jpg";
    let pathTexturaPeixeCauda = "./assets/fish_texture.jpg";
    let peixe = new Peixe(gGL, pathTexturaPeixeCorpo, pathTexturaPeixeCauda, vec3(-6, -7.5, 0));
    gSimulator.peixe = peixe;
    gSimulator.animais.push(peixe);

    let pathTexturaCaracolCorpo = "./assets/snail_body.jpg";
    let pathTexturaCaracolConcha = "./assets/snail_shell.jpg";
    let caracol = new Caracol(gGL, pathTexturaCaracolCorpo, pathTexturaCaracolConcha, vec3(-7.5, 7.5, 0.35));
    gSimulator.caracol = caracol;
    gSimulator.animais.push(caracol);
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

    for (let i = 0; i < gSimulator.obstaculos.length; i++) {
        let o = gSimulator.obstaculos.at(i);
        o.atualizaTrans(gSimulator.dt);
        o.atualizaTheta(gSimulator.dt);
    }

    for (let i = 0; i < gSimulator.animais.length; i++) {
        let a = gSimulator.animais.at(i);
        a.atualizaMovimentoInativo(gSimulator.dt);
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
        lightTrans: gSimulator.sol.trans,
        shadow: gSimulator.sol.calculaSombra()
    };
    gShader.carregaUniformesGerais(dadosGeral);

    for (let i = 0; i < gSimulator.bases.length; i++) {
        let b = gSimulator.bases.at(i);
        let dadosModelo = b.calculaUniformesModelo(dadosGeral.view);
        let dadosLuz = gSimulator.sol.calculaUniformesLuz(b);
        let dadosMaterial = b.calculaUniformesMaterial();
        gShader.carregaUniformesEspecificos(dadosModelo, dadosLuz, dadosMaterial);
        gShader.renderizaElemento(b);
    }

    for (let i = 0; i < gSimulator.obstaculos.length; i++) {
        let o = gSimulator.obstaculos.at(i);
        let dadosModelo = o.calculaUniformesModelo(dadosGeral.view);
        let dadosLuz = gSimulator.sol.calculaUniformesLuz(o);
        let dadosMaterial = o.calculaUniformesMaterial();
        gShader.carregaUniformesEspecificos(dadosModelo, dadosLuz, dadosMaterial);
        gShader.renderizaElemento(o);
        gShader.renderizaSombra(o);
    }

    for (let i = 0; i < gSimulator.animais.length; i++) {
        let a = gSimulator.animais.at(i);
        for (let j = 0; j < a.elementos.length; j++) {
            let e = a.elementos.at(j);
            let dadosModelo = e.calculaUniformesModelo(dadosGeral.view);
            let dadosLuz = gSimulator.sol.calculaUniformesLuz(e);
            let dadosMaterial = e.calculaUniformesMaterial();
            gShader.carregaUniformesEspecificos(dadosModelo, dadosLuz, dadosMaterial);
            gShader.renderizaElemento(e);
            gShader.renderizaSombra(e);
        }
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
    console.log(gSimulator.ship.trans)
}


function callbackChangeDay(e) {
    let delta = gInterface.slider.max - gInterface.slider.min;
    let alfa = (gInterface.slider.value - gInterface.slider.min) / delta;

    // cores em diferentes momentos do dia
    const corMaxIluminacao = [1.0, 1.0, 0.8]; 
    const corMinIluminacao = [0.5, 0.0, 0.5]; 

    // interpolação entre o máximo de iluminação e o mínimo de iluminação
    let corInterpolada = interpolaCor(corMaxIluminacao, corMinIluminacao, alfa);

    let nova_difusao = vec4(corInterpolada[0], corInterpolada[1], corInterpolada[2], 1);
    gSimulator.sol.cor.difusa = nova_difusao;

    // atualiza a cor de fundo do canvas
    const corBackgroundDia = [0.52, 0.80, 0.98]; 
    const corBackgroundNoite = [0.3, 0.0, 0.3]; 
    let corBackground = interpolaCor(corBackgroundDia, corBackgroundNoite, alfa);

    gGL.clearColor(corBackground[0], corBackground[1], corBackground[2], 1.0);
    gGL.clear(gSimulator.GL.COLOR_BUFFER_BIT | gSimulator.GL.DEPTH_BUFFER_BIT);
}

function callbackAbelha(e) {
    console.log("POV Abelha");
    ativaPOV(ABELHA);

    let abelha = gSimulator.abelha
    gSimulator.ship.trans = vec3(8.5, 10, 7);
    gInterface.theta = vec3(70, 0, -180);
}

function callbackCaracol(e) {
    console.log("POV Caracol");
    ativaPOV(CARACOL)

    let caracol = gSimulator.caracol;
    gSimulator.ship.trans = vec3(-10, 7.7, 2);
    gInterface.theta = vec3(80, 0, -94);
}

function callbackPeixe(e) {
    console.log("POV Peixe");
    ativaPOV(PEIXE);

    let peixe = gSimulator.peixe;
    gSimulator.ship.trans = vec3(-5, -10, 1.5);
    gInterface.theta = vec3(78, 0, -1);
}

function callbackJardim(e) {
    console.log("POV Jardim");
    ativaPOV(JARDIM);

    gSimulator.ship.trans = vec3(15, -15, 10);
    gInterface.theta = vec3(60, 0, 45);
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
 * Faz interpolação entre duas cores a partir de um fator de interpolação
 */
function interpolaCor(cor1, cor2, fator) {
    let corResultado = cor1.slice(); // Cria uma cópia de color1
    for (let i = 0; i < 3; i++) {
        corResultado[i] = cor1[i] + fator * (cor2[i] - cor1[i]);
    }
    return corResultado;
}

function ativaPOV(pov) {
    for(let i = 0; i < 4; i++) {
        if(i == pov) {
            POVs[i] = true;
            //console.log("ativou")
        }
        else {
            POVs[i] = false;
            //console.log("desativou")
        }
    }
}