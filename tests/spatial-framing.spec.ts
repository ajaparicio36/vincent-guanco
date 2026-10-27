import { expect, test } from "@playwright/test";
import * as THREE from "three";
import { PORTFOLIO_WORK } from "../src/data/portfolio";
import { galleryCameraDistances } from "../src/lib/spatial-gallery";

const stages = [
  { width: 390, height: 562 }, { width: 820, height: 940 },
  { width: 768, height: 784 }, { width: 320, height: 458 },
  { width: 1440, height: 660 },
] as const;

for (const stage of stages) {
  test(`${stage.width}px enlarged deck fits every active aspect ratio through idle extrema and focus`, () => {
    const aspect = stage.width / stage.height;
    const camera = new THREE.PerspectiveCamera(28, aspect, 0.1, 100);
    for (const work of PORTFOLIO_WORK) {
      const mediaAspect = work.width / work.height;
      const height = Math.min(4.7, 4.8 / mediaAspect);
      const width = height * mediaAspect;
      const distances = galleryCameraDistances(aspect, width, height, camera.fov);
      camera.position.set(0, 0, distances.expanded);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      for (const yaw of [-0.12, 0, 0.44]) for (const driftX of [-0.13, 0.13]) for (const driftY of [-0.16, 0.16]) for (const driftZ of [-0.38, 0.38]) {
        for (const x of [-width / 2, width / 2]) for (const y of [-height / 2, height / 2]) {
          const projected = new THREE.Vector3(x, y, 0)
            .applyEuler(new THREE.Euler(-0.025, yaw, 0))
            .add(new THREE.Vector3(driftX, driftY, 2.2 + driftZ))
            .project(camera);
          expect(Math.abs(projected.x), `${work.id} expanded horizontal fit`).toBeLessThanOrEqual(0.9);
          expect(Math.abs(projected.y), `${work.id} expanded vertical fit`).toBeLessThanOrEqual(0.9);
        }
      }
      camera.position.z = distances.focused;
      camera.updateMatrixWorld();
      for (const x of [-width / 2, width / 2]) for (const y of [-height / 2, height / 2]) {
        const projected = new THREE.Vector3(x, y, 2.2).project(camera);
        expect(Math.abs(projected.x), `${work.id} focused horizontal fit`).toBeLessThanOrEqual(0.9);
        expect(Math.abs(projected.y), `${work.id} focused vertical fit`).toBeLessThanOrEqual(0.9);
      }
    }
  });
}
