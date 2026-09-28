/**
 * Single place for Babylon.js imports. We use deep ES-module imports (not the
 * package root) so the bundler only ships the parts of the engine we use, and
 * we register the side-effect modules those parts need exactly once.
 */
import '@babylonjs/core/Culling/ray'; // scene.pick
import '@babylonjs/core/Meshes/instancedMesh'; // mesh.createInstance
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';
import '@babylonjs/core/Layers/effectLayerSceneComponent';

export { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
export type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine';
export { Engine } from '@babylonjs/core/Engines/engine';
export { NullEngine } from '@babylonjs/core/Engines/nullEngine';
export { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents';
export { GlowLayer } from '@babylonjs/core/Layers/glowLayer';
export { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
export { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
export { PointLight } from '@babylonjs/core/Lights/pointLight';
export { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';
export { ImageProcessingConfiguration } from '@babylonjs/core/Materials/imageProcessingConfiguration';
export { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
export { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
export { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
export { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
export { CreateCapsule } from '@babylonjs/core/Meshes/Builders/capsuleBuilder';
export { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder';
export { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
export { CreateTorus } from '@babylonjs/core/Meshes/Builders/torusBuilder';
export { Mesh } from '@babylonjs/core/Meshes/mesh';
export { TransformNode } from '@babylonjs/core/Meshes/transformNode';
export { Scene } from '@babylonjs/core/scene';
