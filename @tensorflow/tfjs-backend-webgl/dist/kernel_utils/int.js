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
import { UnaryOpProgram } from '../unaryop_gpu';
const TO_INT = `return float(int(x));`;
export function int(input, backend) {
    const program = new UnaryOpProgram(input.shape, TO_INT);
    const output = backend.runWebGLProgram(program, [input], 'int32');
    return { dataId: output.dataId, shape: output.shape, dtype: output.dtype };
}
//# sourceMappingURL=int.js.map