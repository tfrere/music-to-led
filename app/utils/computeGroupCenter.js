import * as THREE from 'three';

/**
 * Compute the center of a THREE.Group by creating a bounding box
 * containing every children's bounding box.
 * @param {THREE.Group} group - the input group
 * @param {THREE.Vector3=} optionalTarget - an optional output point
 * @return {THREE.Vector3} the center of the group
 */
export let computeGroupCenter = (function() {
  return function(group, optionalTarget) {
    let childBox = new THREE.Box3();
    let groupBox = new THREE.Box3();
    let invMatrixWorld = new THREE.Matrix4();

    if (!optionalTarget) optionalTarget = new THREE.Vector3();

    group.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        // if (!child.geometry.boundingBox) {
        child.geometry.computeBoundingBox();
        childBox.copy(child.geometry.boundingBox);
        child.updateMatrixWorld(true);
        childBox.applyMatrix4(child.matrixWorld);
        groupBox.min.min(childBox.min);
        groupBox.max.max(childBox.max);
        // }
      }
    });

    // All computations are in world space
    // But the group might not be in world space
    group.matrixWorld.getInverse(invMatrixWorld);
    groupBox.applyMatrix4(invMatrixWorld);

    groupBox.getCenter(optionalTarget);
    return optionalTarget;
  };
})();
