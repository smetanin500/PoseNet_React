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
import { buffer } from '@tensorflow/tfjs-core';
export function scatterImpl(indices, updates, shape, outputSize, sliceSize, numUpdates, sliceRank, strides, defaultValue, sumDupeIndices) {
    const flattenShape = [outputSize / sliceSize, sliceSize];
    const indicesData = indices.values;
    const updatesData = updates.values;
    if (outputSize === 0) {
        return buffer(shape, updates.dtype);
    }
    const outBuf = buffer(flattenShape, updates.dtype);
    outBuf.values.fill(defaultValue);
    for (let i = 0; i < numUpdates; i++) {
        const index = [];
        let flattenIndex = 0;
        for (let j = 0; j < sliceRank; j++) {
            const dim = indicesData[i * sliceRank + j];
            index.push(dim);
            flattenIndex += dim * strides[j];
        }
        if (flattenIndex < 0 || flattenIndex >= outputSize / sliceSize) {
            throw new Error(`Invalid indices: ${index} does not index into ${shape}`);
        }
        for (let k = 0; k < sliceSize; k++) {
            if (sumDupeIndices) {
                outBuf.values[flattenIndex * sliceSize + k] +=
                    updatesData[i * sliceSize + k];
            }
            else {
                outBuf.values[flattenIndex * sliceSize + k] = updates.rank === 0 ?
                    updatesData[0] :
                    updatesData[i * sliceSize + k];
            }
        }
    }
    return outBuf;
}
//# sourceMappingURL=Scatter_impl.js.map