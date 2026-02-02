import * as THREE from "../../three.module.js";

export const createPlayer = () => {
  const playerGroup = new THREE.Group();
  const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const playerMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 32, 32),
    playerMaterial
  );
  playerGroup.add(playerMesh);

  const trailMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.5,
  });
  const trailGeometry = new THREE.CylinderGeometry(0.08, 0.25, 3, 10, 1, true);
  trailGeometry.rotateX(Math.PI / 2);
  const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial);
  trailMesh.position.z = -1.6;
  playerGroup.add(trailMesh);

  return {
    playerGroup,
    playerMaterial,
    trailMaterial,
    trailMesh,
  };
};
