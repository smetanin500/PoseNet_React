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
import { backend_util, env, FusedConv2D, util } from '@tensorflow/tfjs-core';
import { Conv2DProgram } from '../conv_gpu';
import { mapActivationToShaderProgram } from '../kernel_utils/kernel_funcs_utils';
import { conv2dByMatMul, conv2dWithIm2Row } from './Conv2D_impl';
import { reshape } from './Reshape';
export function fusedConv2d(args) {
    const { inputs, backend, attrs } = args;
    const { x, filter, bias, preluActivationWeights } = inputs;
    const { strides, pad, dataFormat, dilations, dimRoundingMode, activation, leakyreluAlpha } = attrs;
    const $dataFormat = backend_util.convertConv2DDataFormat(dataFormat);
    const convInfo = backend_util.computeConv2DInfo(x.shape, filter.shape, strides, dilations, pad, dimRoundingMode, false /* depthwise */, $dataFormat);
    let out;
    const intermediates = [];
    if (convInfo.filterHeight === 1 && convInfo.filterWidth === 1 &&
        convInfo.dilationHeight === 1 && convInfo.dilationWidth === 1 &&
        convInfo.strideHeight === 1 && convInfo.strideWidth === 1 &&
        (convInfo.padInfo.type === 'SAME' || convInfo.padInfo.type === 'VALID')) {
        out = conv2dByMatMul({
            x,
            filter,
            convInfo,
            backend,
            bias,
            activation,
            preluActivationWeights,
            leakyreluAlpha
        });
    }
    else if (env().getBool('WEBGL_CONV_IM2COL') && x.shape[0] === 1) {
        out = conv2dWithIm2Row({
            x,
            filter,
            convInfo,
            backend,
            bias,
            activation,
            preluActivationWeights,
            leakyreluAlpha
        });
    }
    else {
        const hasBias = bias != null;
        const hasPreluActivationWeights = preluActivationWeights != null;
        const hasLeakyreluAlpha = activation === 'leakyrelu';
        const fusedActivation = activation ? mapActivationToShaderProgram(activation, false) : null;
        const program = new Conv2DProgram(convInfo, hasBias, fusedActivation, hasPreluActivationWeights, hasLeakyreluAlpha);
        const inputs = [x, filter];
        if (bias) {
            inputs.push(bias);
        }
        if (preluActivationWeights) {
            inputs.push(preluActivationWeights);
        }
        if (hasLeakyreluAlpha) {
            const $leakyreluAlpha = backend.makeTensorInfo([], 'float32', util.createScalarValue(leakyreluAlpha, 'float32'));
            inputs.push($leakyreluAlpha);
            intermediates.push($leakyreluAlpha);
        }
        out = backend.runWebGLProgram(program, inputs, 'float32');
    }
    const outReshaped = reshape({ inputs: { x: out }, backend, attrs: { shape: convInfo.outShape } });
    intermediates.push(out);
    intermediates.forEach(t => backend.disposeIntermediateTensorInfo(t));
    return outReshaped;
}
export const fusedConv2DConfig = {
    kernelName: FusedConv2D,
    backendName: 'webgl',
    kernelFunc: fusedConv2d,
};
//# sourceMappingURL=FusedConv2D.js.map