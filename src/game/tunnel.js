import * as THREE from "../../three.module.js";

export const createTunnel = () => {
  const tunnelPoints = [];
  const segmentLength = 18;
  const pointCount = 220;
  for (let i = 0; i < pointCount; i += 1) {
    tunnelPoints.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 24,
        -i * segmentLength
      )
    );
  }

  const curve = new THREE.CatmullRomCurve3(tunnelPoints);
  const tubularSegments = 2200;
  const curveLength = curve.getLength();
  const frames = curve.computeFrenetFrames(tubularSegments, false);

  const tunnelGeometry = new THREE.TubeGeometry(
    curve,
    tubularSegments,
    5,
    16,
    false
  );
  const tunnelMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.4,
  });
  const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);

  return {
    tunnel,
    tunnelMaterial,
    curve,
    tubularSegments,
    curveLength,
    frames,
  };
};
