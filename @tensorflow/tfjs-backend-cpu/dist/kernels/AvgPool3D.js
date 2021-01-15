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
import { AvgPool3D, backend_util, util } from '@tensorflow/tfjs-core';
import { assertNotComplex } from '../cpu_util';
import { pool3d } from '../utils/pool_utils';
export function avgPool3D(args) {
    const { inputs, backend, attrs } = args;
    const { x } = inputs;
    const { filterSize, strides, pad, dimRoundingMode, dataFormat, dilations } = attrs;
    assertNotComplex(x, 'avgPool3d');
    let $dilations = dilations;
    if ($dilations == null) {
        $dilations = [1, 1, 1];
    }
    const convInfo = backend_util.computePool3DInfo(x.shape, filterSize, strides, $dilations, pad, dimRoundingMode, dataFormat);
    const xValues = backend.data.get(x.dataId).values;
    const outBuf = pool3d(xValues, x.shape, x.dtype, util.computeStrides(x.shape), convInfo, 'avg');
    return backend.makeTensorInfo(outBuf.shape, 'float32', outBuf.values);
}
export const avgPool3DConfig = {
    kernelName: AvgPool3D,
    backendName: 'cpu',
    kernelFunc: avgPool3D
};
//# sourceMappingURL=AvgPool3D.js.map