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
const PASSO_VTRANS = 5.0;
const PASSO_THETA = 1.0;
const JARDIM = 0;
const ABELHA = 1;
const CARACOL = 2;
const PEIXE = 3;

var gGL;
var gShader = new Shader();
var gInterface = { theta: vec3(0.0, 0.0, 0.0) };
var gSimulador = { time: 0.0, dt: 0.0 };
var gPOVs = [
    true,   // jardim
    false,  // abelha
    false,  // caracol
    false,  // peixe
];

/* ==================================================================
  Funções principais
*/
function main() {
    criaInterface();
    criaSimulador();
    gShader.criaShaders(gGL, gInterface.canvas.height, gInterface.canvas.width);
    renderizaFrame();
};

/**
 * Registra os elementos HTML responsáveis pela interação no objeto
 * interface e os associa às rotinas de callback.
 */
function criaInterface() {
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
    gInterface.run.onclick = callbackExecuta;
    gInterface.step.onclick = callbackPasso;
    gInterface.slider.onchange = callbackMudaDia;

    gInterface.abelha.onclick = callbackAbelha;
    gInterface.caracol.onclick = callbackCaracol;
    gInterface.peixe.onclick = callbackPeixe;
    gInterface.jardim.onclick = callbackJardim;

    onkeydown = callbackTeclado;
    onkeyup = callbackParaMovimento;
}

/**
 * Registra os elementos do simulador de voo em seu objeto.
 */
function criaSimulador() {
    // câmera
    gSimulador.camera = new Camera(vec3(15, -15, 10), vec3(60, 0, 45));
    gInterface.theta = vec3(60, 0, 45);
    gInterface.vTrans = 0.0;

    // sol
    let sol = new Elemento(null, gGL, null);
    sol.trans = vec3(75, 0, 30);
    sol.cor.ambiente = vec4(0.2, 0.2, 0.2, 1);
    sol.cor.difusa = vec4(1, 1, 1, 1);
    sol.cor.especular = vec4(1, 1, 1, 1);
    gSimulador.sol = sol;
    
    gSimulador.bases = [];
    gSimulador.obstaculos = [];
    gSimulador.animais = [];
    
    // chão
    let pathTexturaChao = "./assets/grass.jpg";
    let chao = new Chao(gGL, pathTexturaChao, vec3(0, 0, -2.52));
    gSimulador.bases.push(chao.elemento);
    
    // lago
    let lago = new Lago(gGL, null, vec3(-6, -7.5, -2.51));
    gSimulador.bases.push(lago.elemento);
    
    // horta
    let pathTexturaTerra = "./assets/dirt.jpg";
    let horta = new Horta(gGL, pathTexturaTerra, null, vec3(8, -5.5, -2.51));
    gSimulador.bases.push(horta.elementos.at(0));
    gSimulador.obstaculos.push(...horta.elementos.slice(1));

    // árvores
    let arvore1 = new Arvore(gGL, null, null, vec3(-7.5, 0, 1.5));
    gSimulador.obstaculos.push(...arvore1.elementos);
    let arvore2 = new Arvore(gGL, null, null, vec3(1.5, 9.0, 1.5));
    gSimulador.obstaculos.push(...arvore2.elementos);

    // pedras
    let pathTexturaPedra = "./assets/rock.jpg";
    let pedra1 = new Pedra(gGL, pathTexturaPedra, vec3(0, -10.5, 0), vec3(0.7, 0.7, 0.7));
    gSimulador.obstaculos.push(pedra1.elemento);
    let pedra2 = new Pedra(gGL, pathTexturaPedra, vec3(0, -11.5, 0), vec3(0.5, 0.4, 0.7));
    gSimulador.obstaculos.push(pedra2.elemento);
    let pedra3 = new Pedra(gGL, pathTexturaPedra, vec3(0.5, -11.0, 0), vec3(0.6, 0.4, 0.7));
    gSimulador.obstaculos.push(pedra3.elemento);
    let pedra4 = new Pedra(gGL, pathTexturaPedra, vec3(0, -3.5, 0), vec3(0.7, 0.7, 0.7));
    gSimulador.obstaculos.push(pedra4.elemento);
    let pedra5 = new Pedra(gGL, pathTexturaPedra, vec3(0, -4.5, 0), vec3(0.5, 0.4, 0.7));
    gSimulador.obstaculos.push(pedra5.elemento);
    let pedra6 = new Pedra(gGL, pathTexturaPedra, vec3(0.5, -4.0, 0), vec3(0.6, 0.4, 0.7));
    gSimulador.obstaculos.push(pedra6.elemento);

    // animais
    let pathTexturaAbelhaCorpo = "./assets/bee_body.jpg";
    let pathTexturaAbelhaAsas = "./assets/bug_wing2.jpg";
    let abelha = new Abelha(vec3(7.5, 7.5, 5), gGL, pathTexturaAbelhaCorpo, pathTexturaAbelhaAsas);
    gSimulador.abelha = abelha;
    gSimulador.animais.push(abelha);
    
    let pathTexturaCaracolCorpo = "./assets/snail_body.jpg";
    let pathTexturaCaracolConcha = "./assets/snail_shell.jpg";
    let caracol = new Caracol(vec3(-7.5, 7.5, 0.35), gGL, pathTexturaCaracolCorpo, pathTexturaCaracolConcha);
    gSimulador.caracol = caracol;
    gSimulador.animais.push(caracol);

    let pathTexturaPeixeCorpo = "./assets/fish_texture.jpg";
    let pathTexturaPeixeCauda = "./assets/fish_texture.jpg";
    let peixe = new Peixe(vec3(-6, -7.5, 0), gGL, pathTexturaPeixeCorpo, pathTexturaPeixeCauda);
    gSimulador.peixe = peixe;
    gSimulador.animais.push(peixe);
}

/**
 * Atualiza os elementos do simulador de voo caso estado seja executando ou passo ativado.
 */
function atualizaSimulador() {
    if (gInterface.activeStep)
        gSimulador.dt = 1.0;
    else if (gInterface.run.value == "Pausar") {
        let agora = Date.now()
        gSimulador.dt = (agora - gSimulador.time) / 1000;
        gSimulador.time = agora;
    }

    if (gPOVs[JARDIM]) {
        gSimulador.camera.vTrans = gInterface.vTrans;
        gSimulador.camera.atualizaTrans(gSimulador.dt);
        gSimulador.camera.atualizaTheta(gInterface.theta);
    }

    for (let i = 0; i < gSimulador.obstaculos.length; i++) {
        let o = gSimulador.obstaculos.at(i);
        o.atualizaTrans(gSimulador.dt);
        o.atualizaTheta(gSimulador.dt);
    }

    for (let i = 0; i < gSimulador.animais.length; i++) {
        let a = gSimulador.animais.at(i);
        if (gPOVs[i+1]) {
            gInterface.theta = a.theta;
            a.atualizaPOV(gSimulador.camera);
            a.atualizaTrans(gSimulador.dt, gSimulador.camera);
        }
        else {
            a.atualizaMovimentoInativo(gSimulador.dt);
        }
    }

    if (gInterface.activeStep) {
        gSimulador.dt = 0.0;
        gInterface.activeStep = false;
    }
}

/**
 * Gera e renderiza próximo frame para ilustração do estado do simulador (animação).
 */
function renderizaFrame(e) {
    gGL.clear( gGL.COLOR_BUFFER_BIT | gGL.DEPTH_BUFFER_BIT);

    atualizaSimulador();
    
    let dadosGeral = {
        view: gSimulador.camera.olha(),
        lightTrans: gSimulador.sol.trans,
        shadow: gSimulador.sol.calculaSombra()
    };
    gShader.carregaUniformesGerais(dadosGeral);

    for (let i = 0; i < gSimulador.bases.length; i++) {
        let b = gSimulador.bases.at(i);
        let dadosModelo = b.calculaUniformesModelo(dadosGeral.view);
        let dadosLuz = gSimulador.sol.calculaUniformesLuz(b);
        let dadosMaterial = b.calculaUniformesMaterial();
        gShader.carregaUniformesEspecificos(dadosModelo, dadosLuz, dadosMaterial);
        gShader.renderizaElemento(b);
    }

    for (let i = 0; i < gSimulador.obstaculos.length; i++) {
        let o = gSimulador.obstaculos.at(i);
        let dadosModelo = o.calculaUniformesModelo(dadosGeral.view);
        let dadosLuz = gSimulador.sol.calculaUniformesLuz(o);
        let dadosMaterial = o.calculaUniformesMaterial();
        gShader.carregaUniformesEspecificos(dadosModelo, dadosLuz, dadosMaterial);
        gShader.renderizaElemento(o);
        gShader.renderizaSombra(o);
    }

    for (let i = 0; i < gSimulador.animais.length; i++) {
        let a = gSimulador.animais.at(i);
        let dadosModeloAnimal = a.calculaUniformesModelo(dadosGeral.view);
        for (let j = 0; j < a.elementos.length; j++) {
            let e = a.elementos.at(j);
            let dadosModelo = e.calculaUniformesModelo(dadosGeral.view);
            dadosModelo = a.aplicaModeloSobreElemento(dadosGeral.view, dadosModeloAnimal, dadosModelo);
            let dadosLuz = gSimulador.sol.calculaUniformesLuz(e);
            let dadosMaterial = e.calculaUniformesMaterial();
            gShader.carregaUniformesEspecificos(dadosModelo, dadosLuz, dadosMaterial);
            gShader.renderizaElemento(e);
            gShader.renderizaSombra(e);
        }
    }

    window.requestAnimationFrame(renderizaFrame);
}

/* ==================================================================
  Funções de callback
*/
function callbackExecuta(e) {
    let v = gInterface.run.value;

    if (v == "Pausar") {
        console.log("Simulador pausado.");
        gSimulador.dt = 0.0;
        gInterface.run.value = "Executar";
        gInterface.step.value = "Passo";
        gInterface.step.disabled = false;
    }
    else {
        console.log("Simulador iniciado.");
        gSimulador.time = Date.now();
        gInterface.run.value = "Pausar";
        gInterface.step.value = "";
        gInterface.step.disabled = true;
    }
}

function callbackPasso(e) {
    console.log("Passo Simulado.");
    gInterface.activeStep = true;
}

function callbackTeclado(e) {
    if (gPOVs[JARDIM] || gPOVs[ABELHA])
        controlaJardimAbelha(e);
    else if (gPOVs[PEIXE] || gPOVs[CARACOL])
        controlaPeixeCaracol(e);
}

function controlaJardimAbelha(e) {
    let key = e.key.toLowerCase();
    if (key == `k`) {
        gInterface.vTrans = 0.0;
        gSimulador.camera.vTrans = gInterface.vTrans
        console.log("Tecla K: VEL zerada", gInterface.vTrans);
    }
    else if (key == `j`) {
        gInterface.vTrans -= PASSO_VTRANS;
        gSimulador.camera.vTrans = gInterface.vTrans
        console.log("Tecla J: VEL-", gInterface.vTrans);
    }
    else if (key == `l`) {
        gInterface.vTrans += PASSO_VTRANS;
        gSimulador.camera.vTrans = gInterface.vTrans
        console.log("Tecla L: VEL+", gInterface.vTrans);
    }
    else if (key == `w`) {
        gInterface.theta[X] += PASSO_THETA;
        console.log("Tecla W: ROT(X)+ sobe", gInterface.theta);
    }
    else if (key == `x`) {
        gInterface.theta[X] -= PASSO_THETA;
        console.log("Tecla X: ROT(X)- desce", gInterface.theta);
    }
    else if (key == `a`) {
        gInterface.theta[Y] += PASSO_THETA;
        console.log("Tecla A: ROT(Y)+ esquerda", gInterface.theta);
    }
    else if (key == `d`) {
        gInterface.theta[Y] -= PASSO_THETA;
        console.log("Tecla D: ROT(Y)- direita", gInterface.theta);
    }
    else if (key == `z`) {
        gInterface.theta[Z] += PASSO_THETA;
        console.log("Tecla Z: ROT(Z)+ anti-horário", gInterface.theta);
    }
    else if (key == `c`) {
        gInterface.theta[Z] -= PASSO_THETA;
        console.log("Tecla C: ROT(Z)- horário", gInterface.theta);
    }
    else
        console.log("Tecla de controle inválida.");
}

function controlaPeixeCaracol(e) {
    let key = e.key.toLowerCase();
    if (key == `k`) {
        gInterface.vTrans = 0.0;
        gSimulador.camera.vTrans = gInterface.vTrans;
        console.log("Tecla K: VEL zerada", gInterface.vTrans);
    }
    else if (key == `j`) {
        gInterface.vTrans -= PASSO_VTRANS;
        console.log("Tecla J: VEL-", gInterface.vTrans);
    }
    else if (key == `l`) {
        gInterface.vTrans += PASSO_VTRANS;
        console.log("Tecla L: VEL+", gInterface.vTrans);
    }
    else if (key == `w`) {
        gSimulador.camera.vTrans = gInterface.vTrans;
        console.log("Tecla W: anda para frente", gInterface.vTrans);
    }
    else if (key == `s`) {
        gSimulador.camera.vTrans = -gInterface.vTrans;
        console.log("Tecla S: anda de ré", gInterface.vTrans);
    }
    else if (key == `a`) {
        gInterface.theta[Z] += PASSO_THETA;
        console.log("Tecla Z: ROT(Z)+ anti-horário", gInterface.theta);
    }
    else if (key == `d`) {
        gInterface.theta[Z] -= PASSO_THETA;
        console.log("Tecla C: ROT(Z)- horário", gInterface.theta);
    }
    else
        console.log("Tecla de controle inválida.");
} 

function callbackParaMovimento(e) {
    if (gPOVs[CARACOL] || gPOVs[PEIXE]) {
        let key = e.key.toLowerCase();
        if (key == `w`) {
            gSimulador.camera.vTrans = 0
            console.log("Tecla W solta: para de andar", gInterface.vTrans);
        }
        else if (key == `s`) {
            gSimulador.camera.vTrans = 0;
            console.log("Tecla S solta: para de andar", gInterface.vTrans);
        }
    }
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
    gSimulador.sol.cor.difusa = nova_difusao;

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

    gSimulador.sol.trans = vec3(posicaoSolX, posicaoSolY, posicaoSolZ);
    console.log(gSimulador.sol.trans);
}

function callbackAbelha(e) {
    console.log("POV da câmera: Abelha");
    ativaPOV(ABELHA);
    gSimulador.abelha.atualizaPOV(gSimulador.camera);
}

function callbackCaracol(e) {
    console.log("POV da câmera: Caracol");
    ativaPOV(CARACOL);
    gSimulador.caracol.atualizaPOV(gSimulador.camera);
}

function callbackPeixe(e) {
    console.log("POV da câmera: Peixe");
    ativaPOV(PEIXE);
    gSimulador.peixe.atualizaPOV(gSimulador.camera);
}

function callbackJardim(e) {
    console.log("POV  da câmera: Jardim");
    ativaPOV(JARDIM);

    gSimulador.camera.trans = vec3(15, -15, 10);
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

/**
 * ativa o POV de um animal especifico e desativa os demais gPOVs
 */
function ativaPOV(pov) {
    for(let i = 0; i < 4; i++) {
        if(i == pov)
            gPOVs[i] = true;
        else
            gPOVs[i] = false;
    }
}