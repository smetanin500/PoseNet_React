/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import { ResizeNearestNeighbor } from '@tensorflow/tfjs-core';
import { ResizeNearestNeighborProgram } from '../resize_nearest_neighbor_gpu';
export function resizeNearestNeighbor(args) {
    const { inputs, backend, attrs } = args;
    const { images } = inputs;
    const { alignCorners, halfPixelCenters, size } = attrs;
    const [newHeight, newWidth] = size;
    const program = new ResizeNearestNeighborProgram(images.shape, newHeight, newWidth, alignCorners, halfPixelCenters);
    return backend.runWebGLProgram(program, [images], images.dtype);
}
export const resizeNearestNeighborConfig = {
    kernelName: ResizeNearestNeighbor,
    backendName: 'webgl',
    kernelFunc: resizeNearestNeighbor
};
//# sourceMappingURL=ResizeNearestNeighbor.js.map