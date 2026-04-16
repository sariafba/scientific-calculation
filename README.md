# Scientific Calculation — Boat Surface Simulation

University project — Simulating the movement of a boat on the water surface and applying the necessary physical laws using three.js

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Physics model](#physics-model)
- [Rendering & waves](#rendering--waves)
- [Controls](#controls)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [How to extend](#how-to-extend)
- [Limitations](#limitations)
- [References](#references)
- [License & authors](#license--authors)

---

## Overview

This repository contains an interactive 3D simulation built with three.js that models a small boat moving above a water surface. The goal of the project is to combine graphical rendering and simplified physical models (buoyancy, gravity, drag, and wave forces) to study the dynamic behaviour of a vessel on waves in an educational/university context.

The simulation is intended for demonstration, analysis, and further extension for coursework in computational physics, numerical methods, or computer graphics.

## Features

- 3D visualization of a boat and a dynamic water surface (three.js)
- Simplified physical forces applied to the boat:
  - Gravity
  - Buoyant force (approximate; based on displaced volume or sampling)
  - Linear drag and damping
  - Wave-induced forces (basic wave model)
- Adjustable simulation parameters (mass, buoyancy coefficient, drag, wave amplitude/frequency)
- Camera controls and basic interaction for observing the simulation

## Physics model

The project uses simplified models suitable for an educational simulation. Typical concepts implemented:

- Gravity: constant downward acceleration (g).
- Buoyancy: approximated as an upward force proportional to submerged volume or to the difference in water height under control points on the hull.
- Drag: viscous/linear damping proportional to velocity (and optionally angular velocity) to model energy loss.
- Wave forcing: simple parametric wave (e.g., Gerstner or sinusoidal waves) that modulates the water height and generates dynamic forcing on the hull.
- Numerical integration: explicit integration (Euler or semi-implicit Euler). Some experiments use smaller time-steps to improve stability.

Note: The code aims to be physically plausible for teaching/demonstration. For engineering-accurate hydrodynamics more advanced models (added mass, viscous flow coupling, CFD) are required.

## Rendering & waves

- three.js is used for rendering the boat, water plane, lighting, and camera.
- The water surface is implemented using a dynamic mesh or a shader-based approach to show waves and normals for lighting.
- Boat orientation is updated from forces and torques computed from sample points on the hull.

## Controls

Common controls (may vary depending on the included UI):

- Mouse:
  - Rotate/orbit the camera (left-drag)
  - Zoom (scroll)
  - Pan (right-drag / middle-drag)
- Keyboard:
  - W/S or Up/Down — increase / decrease throttle (forward/back)
  - A/D or Left/Right — yaw / turn
  - Space — pause / resume simulation
  - R — reset simulation

Refer to the UI or code for exact key mappings if different.

## Getting started

Prerequisites:
- Node.js (recommended) for running a local dev server, or any simple static server to serve files.
- A modern browser with WebGL support.

Quick start (if project includes npm scripts):

1. Clone the repo
   ```
   git clone https://github.com/sariafba/scientific-calculation.git
   cd scientific-calculation
   ```

2. Install dependencies (if package.json exists)
   ```
   npm install
   ```

3. Start a dev server
   ```
   npm run start
   ```
   or
   ```
   npm run dev
   ```
   If the project is purely static (HTML + JS), you can also open `index.html` directly or use a static server:
   ```
   npx http-server . -c-1
   ```
   Then open the shown URL (usually http://localhost:8080).

If there is no npm configuration, open `index.html` in a local server (not the file:// protocol) to ensure modules and assets load correctly.

## Project structure

A typical layout (actual file names may differ):

- index.html — main HTML bootstrap
- src/
  - main.js — entry point: initializes three.js scene, camera, renderer, and simulation loop
  - boat.js — boat model and physics integration
  - water.js — water surface (mesh or shader) and wave calculations
  - controls.js — user input handling
  - params.js — simulation / tuning parameters
- assets/ — models, textures, icons
- README.md — this file

Open the source files to locate and tune the main parameters for the simulation.

## How to extend

Some ideas for extension or coursework:
- Replace simplified buoyancy with sampled-integral immersed volume calculation
- Implement RK4 or other more stable integrators
- Add more degrees of freedom (rudder, propeller forces)
- Improve wave model (directional spectra, superposition of multiple frequencies)
- Add instrumentation (plots for heave, pitch, roll over time)
- Add save/load for experiments and parameter sweeps

## Limitations

- This is an educational implementation and not suitable for design/engineering use.
- Floating model approximations are simplified for real-time performance.
- Stability depends on timestep and integration scheme; reduce timestep for better stability.

## References

- three.js — https://threejs.org/
- Basic buoyancy and boat simulation tutorials and lecture notes (search academic materials for "boat buoyancy simulation", "Gerstner waves", or "immersed boundary methods" for deeper study).
