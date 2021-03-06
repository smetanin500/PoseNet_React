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
import { Fill, util } from '@tensorflow/tfjs-core';
import { FillProgram } from '../fill_gpu';
export function fill(args) {
    const { backend, attrs } = args;
    const { shape, value } = attrs;
    let { dtype } = attrs;
    dtype = dtype || util.inferDtype(value);
    if (dtype === 'string') {
        // String type should be handled in CPU memory.
        const values = util.getArrayFromDType(dtype, util.sizeFromShape(shape));
        values.fill(value);
        return backend.makeTensorInfo(shape, dtype, values);
    }
    else {
        const program = new FillProgram(shape, value);
        const customSetup = program.getCustomSetupFunc(value);
        return backend.runWebGLProgram(program, [], dtype, customSetup);
    }
}
export const fillConfig = {
    kernelName: Fill,
    backendName: 'webgl',
    kernelFunc: fill
};
//# sourceMappingURL=Fill.js.map