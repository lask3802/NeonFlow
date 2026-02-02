import * as THREE from "../../three.module.js";

export const createJudgementParticles = () => {
  const group = new THREE.Group();
  const bursts = [];

  const createBurst = (color) => {
    const count = 28;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 1.2;
      positions[i3 + 1] = (Math.random() - 0.5) * 1.2;
      positions[i3 + 2] = (Math.random() - 0.5) * 1.2;
      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.8
        )
      );
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color,
      size: 0.18,
      transparent: true,
      opacity: 0.9,
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;

    const burst = {
      points,
      geometry,
      material,
      velocities,
      life: 0.4,
      maxLife: 0.4,
    };

    group.add(points);
    bursts.push(burst);
  };

  const update = (delta) => {
    for (let i = bursts.length - 1; i >= 0; i -= 1) {
      const burst = bursts[i];
      burst.life -= delta;
      const positions = burst.geometry.attributes.position.array;
      for (let j = 0; j < burst.velocities.length; j += 1) {
        const i3 = j * 3;
        const velocity = burst.velocities[j];
        positions[i3] += velocity.x * delta * 2;
        positions[i3 + 1] += velocity.y * delta * 2;
        positions[i3 + 2] += velocity.z * delta * 2;
      }
      burst.material.opacity = Math.max(0, (burst.life / burst.maxLife) * 0.9);
      burst.geometry.attributes.position.needsUpdate = true;

      if (burst.life <= 0) {
        group.remove(burst.points);
        burst.geometry.dispose();
        burst.material.dispose();
        bursts.splice(i, 1);
      }
    }
  };

  return {
    group,
    update,
    createPerfect: () => createBurst(0xffffff),
    createGood: () => createBurst(0x66ffcc),
    createBad: () => createBurst(0xff6677),
  };
};
