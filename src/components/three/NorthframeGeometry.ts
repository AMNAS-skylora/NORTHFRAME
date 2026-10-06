import * as THREE from "three";

/**
 * Creates the exact NORTHFRAME "A" symbol 2D Shape.
 * Symmetrical silhouette with sharp triangular apex, wide bottom legs,
 * and an inverted V-shaped cutout in the bottom center. No crossbar.
 */
export function createNorthframeShape(): THREE.Shape {
  const shape = new THREE.Shape();
  const H = 2.4;
  const W = 2.36;
  const halfW = W / 2; // 1.18
  const halfH = H / 2; // 1.20
  const legInnerX = 0.48; // Width of the legs
  const notchY = -halfH + H * 0.325; // -0.42 (height of the inner V notch)

  // 1. Sharp triangular top apex
  shape.moveTo(0, halfH);

  // 2. Right outer diagonal side to bottom-right outer foot
  shape.lineTo(halfW, -halfH);

  // 3. Bottom-right leg horizontal base to bottom-right inner corner
  shape.lineTo(legInnerX, -halfH);

  // 4. Inverted V cutout inner right slope to notch apex
  shape.lineTo(0, notchY);

  // 5. Inverted V cutout inner left slope to bottom-left inner corner
  shape.lineTo(-legInnerX, -halfH);

  // 6. Bottom-left leg horizontal base to bottom-left outer foot
  shape.lineTo(-halfW, -halfH);

  // 7. Left outer diagonal side back to apex
  shape.closePath();

  return shape;
}

/**
 * Creates the extruded 3D geometry for the NORTHFRAME "A" symbol.
 * Uses exact bevel and depth parameters, keeping bevel sharp and centered.
 */
export function createNorthframeGeometry(): THREE.ExtrudeGeometry {
  const shape = createNorthframeShape();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.32,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.018,
    bevelOffset: 0,
    bevelSegments: 3,
    curveSegments: 12,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.center();

  return geometry;
}
