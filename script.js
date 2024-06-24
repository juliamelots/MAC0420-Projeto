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
    gInterface.slider.value = 0.0;

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
    gInterface.slider.onchange = callbackMudaDia;

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
    gInterface.vTrans = 0.0;

    // sol
    let sol = new Elemento(null, gGL, null);
    sol.trans = vec3(75, 0, 30);
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
    let pathTexturaAbelhaCorpo = "./assets/bee_body.jpg";
    let pathTexturaAbelhaAsas = "./assets/bug_wing2.jpg";
    let abelha = new Abelha(vec3(7.5, 7.5, 5), gGL, pathTexturaAbelhaCorpo, pathTexturaAbelhaAsas);
    gSimulator.abelha = abelha;
    gSimulator.animais.push(abelha);
    
    let pathTexturaCaracolCorpo = "./assets/snail_body.jpg";
    let pathTexturaCaracolConcha = "./assets/snail_shell.jpg";
    let caracol = new Caracol(vec3(-7.5, 7.5, 0.35), gGL, pathTexturaCaracolCorpo, pathTexturaCaracolConcha);
    gSimulator.caracol = caracol;
    gSimulator.animais.push(caracol);

    let pathTexturaPeixeCorpo = "./assets/fish_texture.jpg";
    let pathTexturaPeixeCauda = "./assets/fish_texture.jpg";
    let peixe = new Peixe(vec3(-6, -7.5, 0), gGL, pathTexturaPeixeCorpo, pathTexturaPeixeCauda);
    gSimulator.peixe = peixe;
    gSimulator.animais.push(peixe);
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

    if (POVs[JARDIM]) {
        gSimulator.ship.vTrans = gInterface.vTrans;
        gSimulator.ship.atualizaTrans(gSimulator.dt);
        gSimulator.ship.atualizaTheta(gInterface.theta);
    }

    for (let i = 0; i < gSimulator.obstaculos.length; i++) {
        let o = gSimulator.obstaculos.at(i);
        o.atualizaTrans(gSimulator.dt);
        o.atualizaTheta(gSimulator.dt);
    }

    for (let i = 0; i < gSimulator.animais.length; i++) {
        let a = gSimulator.animais.at(i);
        if (POVs[i+1]) {
            gSimulator.ship.vTrans = gInterface.vTrans;
            gInterface.theta = a.theta;
            a.atualizaPOV(gSimulator.ship);
            a.atualizaTrans(gSimulator.dt, gSimulator.ship);
        }
        else {
            a.atualizaMovimentoInativo(gSimulator.dt);
        }
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
        let dadosModeloAnimal = a.calculaUniformesModelo(dadosGeral.view);
        for (let j = 0; j < a.elementos.length; j++) {
            let e = a.elementos.at(j);
            let dadosModelo = e.calculaUniformesModelo(dadosGeral.view);
            dadosModelo = a.aplicaModeloSobreElemento(dadosGeral.view, dadosModeloAnimal, dadosModelo);
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
    if (POVs[JARDIM] || POVs[ABELHA]) {
        controlaJardimAbelha(e);
    }
    else if (POVs[PEIXE] || POVs[CARACOL]) {
        controlaPeixeCaracol(e);
    }
}

function controlaJardimAbelha(e) {
    let key = e.key.toLowerCase();
    if (key == `k`) {
        gInterface.vTrans = 0.0;
        console.log("Tecla K: VEL zerada", gInterface.vTrans);
    }
    else if (key == `j`) {
        gInterface.vTrans -= STEP_VTRANS;
        console.log("Tecla J: VEL-", gInterface.vTrans);
    }
    else if (key == `l`) {
        gInterface.vTrans += STEP_VTRANS;
        console.log("Tecla L: VEL+", gInterface.vTrans);
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

function controlaPeixeCaracol(e) {
    let key = e.key.toLowerCase();
    if (key == `k`) {
        gInterface.vTrans = 0.0;
        console.log("Tecla K: VEL zerada", gInterface.vTrans);
    }
    else if (key == `j`) {
        gInterface.vTrans -= STEP_VTRANS;
        console.log("Tecla J: VEL-", gInterface.vTrans);
    }
    else if (key == `l`) {
        gInterface.vTrans += STEP_VTRANS;
        console.log("Tecla L: VEL+", gInterface.vTrans);
    }
/*     else if (key == `w`) {
        gInterface.theta[X] += STEP_THETA;
        console.log("Tecla W: ROT(X)+ sobe", gInterface.theta);
    } */
/*     else if (key == `x`) {
        gInterface.theta[X] -= STEP_THETA;
        console.log("Tecla X: ROT(X)- desce", gInterface.theta);
    } */
    else if (key == `a`) {
        gInterface.theta[Z] += STEP_THETA;
        console.log("Tecla Z: ROT(Z)+ anti-horário", gInterface.theta);
    }
    else if (key == `d`) {
        gInterface.theta[Z] -= STEP_THETA;
        console.log("Tecla C: ROT(Z)- horário", gInterface.theta);
    }
    else
        console.log("Tecla de controle inválida.");
} 

function callbackMudaDia(e) {
    let porcentagem = gInterface.slider.value; // valor do slider de 0.0 a 100.0
    let alfa = porcentagem / 100.0; // converte a porcentagem para um valor de 0.0 a 1.0

    // cores em diferentes momentos do dia para o Sol
    const corManha = [0.8, 0.8, 0.8];
    const corMaxIluminacao = [1.0, 1.0, 1.0]; 
    const corNoite = [0.5, 0.0, 0.5]; 

    // interpolação entre as cores do Sol ao longo do dia
    let corSol;
    if (alfa < 0.5) {
        corSol = interpolaCor(corManha, corMaxIluminacao, alfa * 2);
    } else {
        corSol = interpolaCor(corMaxIluminacao, corNoite, (alfa - 0.5) * 2);
    }

    let nova_difusao = vec4(corSol[0], corSol[1], corSol[2], 1);
    gSimulator.sol.cor.difusa = nova_difusao;

    // cores em diferentes momentos do dia para o Background
    const corBackgroundManha = [0.6, 0.8, 1.0];
    const corBackgroundDia = [0.52, 0.80, 0.98]; 
    const corBackgroundNoite = [0.3, 0.0, 0.3]; 

    // interpolação entre as cores do Background ao longo do dia
    let corBackground;
    if (alfa < 0.5) {
        corBackground = interpolaCor(corBackgroundManha, corBackgroundDia, alfa * 2);
    } else {
        corBackground = interpolaCor(corBackgroundDia, corBackgroundNoite, (alfa - 0.5) * 2);
    }

    gGL.clearColor(corBackground[0], corBackground[1], corBackground[2], 1.0);
    gGL.clear(gGL.COLOR_BUFFER_BIT | gGL.DEPTH_BUFFER_BIT);

    // altera a posição do Sol para uma trajetória semicircular
    const raio = 75.0; // define o raio da trajetória semicircular
    const angulo = alfa * Math.PI; // alfa varia de 0 a 1, angulo varia de 0 a π

    const posicaoSolX = raio * Math.cos(angulo);
    const posicaoSolY = 0; // o Sol se move apenas no eixo X e Z
    const posicaoSolZ = 30 + (45 * Math.sin(angulo)); // 30 é a altura mínima e 75 a altura máxima do sol

    gSimulator.sol.trans = vec3(posicaoSolX, posicaoSolY, posicaoSolZ);
    console.log(gSimulator.sol.trans);
}

function callbackAbelha(e) {
    console.log("POV da câmera: Abelha");
    ativaPOV(ABELHA);
    gSimulator.abelha.atualizaPOV(gSimulator.ship);
}

function callbackCaracol(e) {
    console.log("POV da câmera: Caracol");
    ativaPOV(CARACOL);
    gSimulator.caracol.atualizaPOV(gSimulator.ship);
}

function callbackPeixe(e) {
    console.log("POV da câmera: Peixe");
    ativaPOV(PEIXE);
    gSimulator.peixe.atualizaPOV(gSimulator.ship);
}

function callbackJardim(e) {
    console.log("POV  da câmera: Jardim");
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
 * Faz interpolação entre duas cores a partir de um fator de interpolação (usando interpolação linear)
 */
function interpolaCor(cor1, cor2, fator) {
    let corResultado = cor1.slice(); // cria uma cópia de color1
    for (let i = 0; i < 3; i++) {
        corResultado[i] = cor1[i] + fator * (cor2[i] - cor1[i]);
    }
    return corResultado;
}

function ativaPOV(pov) {
    for(let i = 0; i < 4; i++) {
        if(i == pov)
            POVs[i] = true;
        else
            POVs[i] = false;
    }
}