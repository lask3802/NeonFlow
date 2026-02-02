import * as THREE from "../../three.module.js";

export const createPointerControls = () => {
  const targetInput = new THREE.Vector2();
  const smoothedInput = new THREE.Vector2();

  const handlePointer = (clientX, clientY) => {
    const x = (clientX / window.innerWidth) * 2 - 1;
    const y = -(clientY / window.innerHeight) * 2 + 1;
    targetInput.set(x, y);
  };

  const handleMouse = (event) => {
    handlePointer(event.clientX, event.clientY);
  };

  const handleTouch = (event) => {
    if (event.touches.length > 0) {
      handlePointer(event.touches[0].clientX, event.touches[0].clientY);
    }
  };

  window.addEventListener("mousemove", handleMouse);
  window.addEventListener("touchmove", handleTouch, { passive: true });

  const dispose = () => {
    window.removeEventListener("mousemove", handleMouse);
    window.removeEventListener("touchmove", handleTouch);
  };

  return {
    targetInput,
    smoothedInput,
    dispose,
  };
};
