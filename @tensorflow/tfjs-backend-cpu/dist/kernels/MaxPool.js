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
import { backend_util, MaxPool, util } from '@tensorflow/tfjs-core';
import { assertNotComplex } from '../cpu_util';
import { pool } from '../utils/pool_utils';
import { identity } from './Identity';
export function maxPool(args) {
    const { inputs, backend, attrs } = args;
    const { x } = inputs;
    assertNotComplex(x, 'maxPool');
    const { filterSize, strides, pad, dimRoundingMode } = attrs;
    const dilations = 1;
    util.assert(backend_util.eitherStridesOrDilationsAreOne(strides, dilations), () => 'Error in maxPool: Either strides or dilations must be 1. ' +
        `Got strides ${strides} and dilations '${dilations}'`);
    const convInfo = backend_util.computePool2DInfo(x.shape, filterSize, strides, dilations, pad, dimRoundingMode);
    let res;
    if (convInfo.filterWidth === 1 && convInfo.filterHeight === 1 &&
        util.arraysEqual(convInfo.inShape, convInfo.outShape)) {
        res = identity({ inputs: { x }, backend });
    }
    else {
        const xValues = backend.data.get(x.dataId).values;
        const strides = util.computeStrides(x.shape);
        const buffer = pool(xValues, x.shape, x.dtype, strides, convInfo, 'max');
        res = backend.makeTensorInfo(convInfo.outShape, x.dtype, buffer.values);
    }
    return res;
}
export const maxPoolConfig = {
    kernelName: MaxPool,
    backendName: 'cpu',
    kernelFunc: maxPool
};
//# sourceMappingURL=MaxPool.js.map