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
import { ResizeBilinearGrad } from '@tensorflow/tfjs-core';
import { ResizeBilinearBackpropProgram } from '../resize_bilinear_backprop_gpu';
export function resizeBilinearGrad(args) {
    const { inputs, backend, attrs } = args;
    const { images, dy } = inputs;
    const { alignCorners } = attrs;
    const program = new ResizeBilinearBackpropProgram(dy.shape, images.shape, alignCorners);
    return backend.runWebGLProgram(program, [dy], dy.dtype);
}
export const resizeBilinearGradConfig = {
    kernelName: ResizeBilinearGrad,
    backendName: 'webgl',
    kernelFunc: resizeBilinearGrad
};
//# sourceMappingURL=ResizeBilinearGrad.js.map