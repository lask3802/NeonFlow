import * as THREE from "../../three.module.js";

export const createStars = ({
  count = 500,
  depth = 220,
  radius = 20,
} = {}) => {
  const starPositions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    starPositions[i3] = (Math.random() - 0.5) * radius * 2;
    starPositions[i3 + 1] = (Math.random() - 0.5) * radius * 2;
    starPositions[i3 + 2] = -Math.random() * depth;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(starPositions, 3)
  );
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.3,
    transparent: true,
    opacity: 0.8,
  });
  const stars = new THREE.Points(starGeometry, starMaterial);

  const update = (delta) => {
    if (delta <= 0) {
      return;
    }
    const positions = starGeometry.attributes.position.array;
    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      positions[i3 + 2] += delta * 60;
      if (positions[i3 + 2] > 2) {
        positions[i3 + 2] = -depth;
      }
    }
    starGeometry.attributes.position.needsUpdate = true;
  };

  return {
    stars,
    update,
  };
};
