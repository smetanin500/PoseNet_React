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
import { Complex } from '@tensorflow/tfjs-core';
import { identity } from './Identity';
/**
 * In WebGL data is stored in GPU textures which can't be efficiently copied, so
 * complex tensors share data with their real and imaginary components. Complex
 * tensors increment the `complexParentRefCount` properties of the underlying
 * data buckets to prevent them from being disposed, as the engine's disposal
 * logic does not account for data sharing by complex tensors.
 *
 * When a complex tensor is disposed, it will explicitly decrease the
 * `complexParentRefCount` properties of its underlying components.
 */
export function complex(args) {
    const { inputs, backend } = args;
    const { real, imag } = inputs;
    const complexInfo = backend.makeTensorInfo(real.shape, 'complex64');
    const complex = backend.texData.get(complexInfo.dataId);
    const realTensorInfo = identity({ inputs: { x: real }, backend });
    const realData = backend.texData.get(realTensorInfo.dataId);
    realData.complexParentRefCount++;
    const imagTensorInfo = identity({ inputs: { x: imag }, backend });
    const imagData = backend.texData.get(imagTensorInfo.dataId);
    imagData.complexParentRefCount++;
    complex.complexTensorInfos = { real: realTensorInfo, imag: imagTensorInfo };
    return complexInfo;
}
export const complexConfig = {
    kernelName: Complex,
    backendName: 'webgl',
    kernelFunc: complex
};
//# sourceMappingURL=Complex.js.map