"use client";

import * as React from "react";
import { useEffect, useRef, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

const vertexShaderSource = `#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  if (u_fit == 1.) {
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) {
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, box.x);
}

void main() {
  gl_Position = a_position;
  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec2 v_objectUV;
in vec2 v_objectBoxSize;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_color;
uniform vec3 u_accentColor;

out vec4 outColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main() {
    vec2 uv = v_objectUV;
    vec2 size = v_objectBoxSize / u_pixelRatio;
    
    // Perforated ticket shape
    float d = sdRoundedRect(uv * size, size * 0.45, 10.0);
    
    // Perforation
    float perf = sin(uv.y * 30.0) * 0.5 + 0.5;
    if (abs(uv.x - 0.25) < 0.01) d = max(d, -perf + 0.5);

    vec3 col = u_color;
    if (d > 0.0) discard;
    
    // Animated glare
    float glare = max(0.0, 1.0 - length(uv - u_mouse * 0.5) * 2.0);
    col += u_accentColor * glare * 0.3;
    
    // Dither effect
    float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col *= 0.95 + 0.05 * dither;

    outColor = vec4(col, 1.0);
}
`;

interface AdmitOneTicketProps {
  title: string;
  date: string;
  location: string;
  price: string;
  ticketCode?: string;
  status?: string;
  className?: string;
}

export const AdmitOneTicket = forwardRef<HTMLDivElement, AdmitOneTicketProps>(
  ({ title, date, location, price, ticketCode, status, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const gl = canvas.getContext("webgl2");
      if (!gl) return;

      const createShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
      };

      const program = gl.createProgram();
      const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
      if (!program || !vs || !fs) return;
      
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.useProgram(program);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      
      const pos = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

      let animationFrameId: number;

      const render = (time: number) => {
        if (!containerRef.current || !canvasRef.current) return;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        canvasRef.current.width = width * window.devicePixelRatio;
        canvasRef.current.height = height * window.devicePixelRatio;
        gl.viewport(0, 0, canvasRef.current.width, canvasRef.current.height);

        gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvasRef.current.width, canvasRef.current.height);
        gl.uniform1f(gl.getUniformLocation(program, "u_pixelRatio"), window.devicePixelRatio);
        gl.uniform1f(gl.getUniformLocation(program, "u_time"), time * 0.001);
        gl.uniform2f(gl.getUniformLocation(program, "u_mouse"), mouse.x, mouse.y);
        gl.uniform3f(gl.getUniformLocation(program, "u_color"), 0.02, 0.03, 0.06); 
        gl.uniform3f(gl.getUniformLocation(program, "u_accentColor"), 0.98, 0.44, 0.38); 
        
        gl.uniform1f(gl.getUniformLocation(program, "u_originX"), 0.5);
        gl.uniform1f(gl.getUniformLocation(program, "u_originY"), 0.5);
        gl.uniform1f(gl.getUniformLocation(program, "u_worldWidth"), width);
        gl.uniform1f(gl.getUniformLocation(program, "u_worldHeight"), height);
        gl.uniform1f(gl.getUniformLocation(program, "u_fit"), 0);
        gl.uniform1f(gl.getUniformLocation(program, "u_scale"), 1);
        gl.uniform1f(gl.getUniformLocation(program, "u_rotation"), 0);
        gl.uniform1f(gl.getUniformLocation(program, "u_offsetX"), 0);
        gl.uniform1f(gl.getUniformLocation(program, "u_offsetY"), 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        animationFrameId = requestAnimationFrame(render);
      };

      animationFrameId = requestAnimationFrame(render);
      return () => cancelAnimationFrame(animationFrameId);
    }, [mouse]);

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMouse({
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
      });
    };

    return (
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMouse({ x: 0, y: 0 })}
        className={cn("relative w-full aspect-[2/1] group perspective-1000", className)}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between text-white pointer-events-none z-10">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-coral drop-shadow-sm">ZEVVA PREMIUM TICKET</p>
              <h3 className="text-xl md:text-3xl font-manrope font-black uppercase tracking-tighter leading-none drop-shadow-md">{title}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Price</p>
              <p className="text-lg font-manrope font-black">{price}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-end border-t border-white/10 pt-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Date & Location</p>
              <p className="text-xs font-bold uppercase tracking-wider">{date} — {location}</p>
              {ticketCode && (
                <p className="text-[9px] font-mono opacity-60 mt-1 uppercase">#{ticketCode}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              {status && (
                <span className="text-[10px] font-black text-good uppercase tracking-widest bg-good/10 px-2 py-0.5 rounded border border-good/20">
                  {status}
                </span>
              )}
              <div className="h-14 w-14 bg-white p-1 rounded-lg flex items-center justify-center shadow-lg">
                <div className="w-full h-full border-2 border-navy/20 rounded-sm bg-surface flex items-center justify-center">
                   <div className="w-8 h-8 bg-navy/10 rounded-xs" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AdmitOneTicket.displayName = "Admit One Ticket";
