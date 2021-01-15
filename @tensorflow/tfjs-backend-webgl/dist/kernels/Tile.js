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
import { buffer, Tile, util } from '@tensorflow/tfjs-core';
import { tileImplCPU } from '../kernel_utils/shared';
import { TileProgram } from '../tile_gpu';
export function tile(params) {
    const { inputs, backend, attrs } = params;
    const { x } = inputs;
    const { reps } = attrs;
    if (x.dtype === 'string') {
        // Even thought string tensor is always on CPU, just to be consistent on how
        // to access tensor data.
        const data = backend.readSync(x.dataId);
        const decodedData = data.map(d => util.decodeString(d));
        const buf = buffer(x.shape, x.dtype, decodedData);
        const outBuf = tileImplCPU(buf, reps);
        return backend.makeTensorInfo(outBuf.shape, outBuf.dtype, outBuf.values);
    }
    const program = new TileProgram(x.shape, reps);
    const output = backend.runWebGLProgram(program, [x], x.dtype);
    return output;
}
export const tileConfig = {
    kernelName: Tile,
    backendName: 'webgl',
    kernelFunc: tile,
};
//# sourceMappingURL=Tile.js.map