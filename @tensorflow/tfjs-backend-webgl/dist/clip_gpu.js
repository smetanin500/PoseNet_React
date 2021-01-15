/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
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
export class ClipProgram {
    constructor(aShape) {
        this.variableNames = ['A'];
        this.outputShape = aShape;
        this.userCode = `
      uniform float minVal;
      uniform float maxVal;

      void main() {
        float value = getAAtOutCoords();
        if (isnan(value)) {
          setOutput(value);
          return;
        }

        setOutput(clamp(value, minVal, maxVal));
      }
    `;
    }
    getCustomSetupFunc(min, max) {
        return (gpgpu, webGLProgram) => {
            if (this.minLoc == null) {
                this.minLoc = gpgpu.getUniformLocationNoThrow(webGLProgram, 'minVal');
                this.maxLoc = gpgpu.getUniformLocationNoThrow(webGLProgram, 'maxVal');
            }
            gpgpu.gl.uniform1f(this.minLoc, min);
            gpgpu.gl.uniform1f(this.maxLoc, max);
        };
    }
}
//# sourceMappingURL=clip_gpu.js.map