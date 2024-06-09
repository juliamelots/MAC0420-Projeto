/**
 * Programa usando WegGL para demonstrar a animação 3D de um cubo
 * em perspectiva com rotação em cada eixo.
 *  
 * Bibliotecas utilizadas
 * macWebglUtils.js
 * MVnew.js do livro -- Interactive Computer Graphics
 * 
 * Esse programa foi baseado no exemplo cuboV do capítulo 4 do livro 
 * Interactive Computer Graphics - Angel & Shreiner.
 *
 */

"use strict";

// ==================================================================
// constantes globais

const FUNDO = [0.0, 0.0, 0.0, 1.0];
const EIXO_X = 0;
const EIXO_Y = 1;
const EIXO_Z = 2;

const VERTICES = [
  // Front face
  vec3(0.0,  1.0,  0.0),
  vec3(-1.0, -1.0,  1.0),
  vec3(1.0, -1.0,  1.0),
  // Right face
  vec3(0.0,  1.0,  0.0),
  vec3(1.0, -1.0,  1.0),
  vec3(1.0, -1.0, -1.0),
  // Back face
  vec3(0.0,  1.0,  0.0),
  vec3(1.0, -1.0, -1.0),
  vec3(-1.0, -1.0, -1.0),
  // Left face
  vec3(0.0,  1.0,  0.0),
  vec3(-1.0, -1.0, -1.0),
  vec3(-1.0, -1.0,  1.0)
];

const CORES = [
  // Front face
  [1.0, 0.0, 0.0, 1.0],
  [0.0, 1.0, 0.0, 1.0],
  [0.0, 0.0, 1.0, 1.0],
  // Right face
  [1.0, 0.0, 0.0, 1.0],
  [0.0, 0.0, 1.0, 1.0],
  [0.0, 1.0, 0.0, 1.0],
  // Back face
  [1.0, 0.0, 0.0, 1.0],
  [0.0, 1.0, 0.0, 1.0],
  [0.0, 0.0, 1.0, 1.0],
  // Left face
  [1.0, 0.0, 0.0, 1.0],
  [0.0, 0.0, 1.0, 1.0],
  [0.0, 1.0, 0.0, 1.0]
];

// ==================================================================
// variáveis globais
var gl;
var gCanvas;
var gShader = {};  // encapsula globais do shader

// Os códigos fonte dos shaders serão descritos em 
// strings para serem compilados e passados a GPU
var gVertexShaderSrc;
var gFragmentShaderSrc;

// guarda dados da interface e contexto do desenho
var gCtx = {
  axis: 0,   // eixo rodando
  theta: [0, 0, 0],  // angulos por eixo
  pause: false,        // 
  numV: 36,          // número de vertices
  vista: mat4(),     // view matrix, inicialmente identidade
  perspectiva: mat4(), // projection matrix
}

var gaPosicoes = [];
var gaCores = [];
var gaPiramides = [];

//camera
var EYE = vec3(5, 5, 5);
var AT = vec3(0, 0, 0);
var UP = vec3(0, 1, 0);

var FOVY = 60;
var ASPECT = 1;
var NEAR = 0.1;
var FAR = 100;

class Piramide {
  numVertices = 12;
  pos;
  escala;
  theta;
  vtheta;
  vtrans;

  constructor(pos, escala, theta, vtheta, vtrans) {
    for (let i = 0; i < this.numVertices; i++) {
      gaPosicoes.push(VERTICES[i])
    }

    for (let i = 0; i < this.numVertices; i++) {
      gaCores.push(CORES[i])
    }

    this.pos = pos;
    this.escala = escala;
    this.theta = theta;
    this.vtheta = vtheta;
    this.vtrans = vtrans;
  }
}


// ==================================================================
// chama a main quando terminar de carregar a janela
window.onload = main;

/**
 * programa principal.
 */
function main() {
  // ambiente
  gCanvas = document.getElementById("glcanvas");
  gl = gCanvas.getContext('webgl2');
  if (!gl) alert("Vixe! Não achei WebGL 2.0 aqui :-(");

  console.log("Canvas: ", gCanvas.width, gCanvas.height);

  // interface
  //crieInterface();

  // Inicializações feitas apenas 1 vez
  gl.viewport(0, 0, gCanvas.width, gCanvas.height);
  gl.clearColor(FUNDO[0], FUNDO[1], FUNDO[2], FUNDO[3]);
  gl.enable(gl.DEPTH_TEST);

  let pos = vec3(0, 0, 0);
  let escala = vec3(1, 1, 1);
  let theta = vec3(0, 0, 0);
  let vtheta = vec3(0, 0, 0);
  let vtrans = vec3(0, 0, 0);
  let piramide = new Piramide(pos, escala, theta, vtheta, vtrans);
  console.log(piramide)
  gaPiramides.push(piramide);

  // shaders
  crieShaders();

  // finalmente...
  render();
}

// ==================================================================
/**
 * cria e configura os shaders
 */
function crieShaders() {
  //  cria o programa
  gShader.program = makeProgram(gl, gVertexShaderSrc, gFragmentShaderSrc);
  gl.useProgram(gShader.program);

  // buffer dos vértices
  var bufVertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufVertices);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gaPosicoes), gl.STATIC_DRAW);

  var aPosition = gl.getAttribLocation(gShader.program, "aPosition");
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  // buffer de cores
  var bufCores = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufCores);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gaCores), gl.STATIC_DRAW);

  var aColor = gl.getAttribLocation(gShader.program, "aColor");
  gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aColor);

  // resolve os uniforms
  gShader.uModelView = gl.getUniformLocation(gShader.program, "uModelView");
  gShader.uPerspective = gl.getUniformLocation(gShader.program, "uPerspective");

  // calcula a matriz de transformação perpectiva (fovy, aspect, near, far)
  // que é feita apenas 1 vez
  gCtx.perspectiva = perspective(FOVY, ASPECT, NEAR, FAR);
  gl.uniformMatrix4fv(gShader.uPerspective, false, flatten(gCtx.perspectiva));

  // calcula a matriz de transformação da camera, apenas 1 vez
  gCtx.vista = lookAt(EYE, AT, UP);
}

function atualiza() {
  gaPiramides[0].pos = add(gaPiramides[0].pos, gaPiramides[0].vtrans);
  gaPiramides[0].theta = add(gaPiramides[0].theta, gaPiramides[0].vtheta);
}

// ==================================================================
/**
 * Usa o shader para desenhar.
 * Assume que os dados já foram carregados e são estáticos.
 */
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // rotacao
  let rx = rotateX(gaPiramides[0].theta[0]);
  let ry = rotateY(gaPiramides[0].theta[1]);
  let rz = rotateZ(gaPiramides[0].theta[2]);

  // escala
  let s = scale(gaPiramides[0].escala[0], gaPiramides[0].escala[1], gaPiramides[0].escala[2]);
  
  // translacao
  let t = translate(gaPiramides[0].pos[0], gaPiramides[0].pos[1], gaPiramides[0].pos[2]);
    
  //let model = mult(t, s);
  let model = mult(t, mult(s, mult(rz, mult(rx, ry))));

  gl.uniformMatrix4fv(gShader.uModelView, false, flatten(mult(gCtx.vista, model)));
  gl.drawArrays(gl.TRIANGLES, 0, gaPiramides[0].numVertices);

  //window.requestAnimationFrame(render);
}
// ========================================================
// Código fonte dos shaders em GLSL
// a primeira linha deve conter "#version 300 es"
// para WebGL 2.0

gVertexShaderSrc = `#version 300 es

// aPosition é um buffer de entrada
in vec3 aPosition;
uniform mat4 uModelView;
uniform mat4 uPerspective;

in vec4 aColor;  // buffer com a cor de cada vértice
out vec4 vColor; // varying -> passado ao fShader

void main() {
    gl_Position = uPerspective * uModelView * vec4(aPosition, 1);
    vColor = aColor; 
}
`;

gFragmentShaderSrc = `#version 300 es

precision highp float;

in vec4 vColor;
out vec4 outColor;

void main() {
  outColor = vColor;
}
`;





