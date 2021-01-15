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
import { DepthwiseConv2dNativeBackpropInputAttrs, DepthwiseConv2dNativeBackpropInputInputs, KernelConfig, TensorInfo } from '@tensorflow/tfjs-core';
import { MathBackendCPU } from '../backend_cpu';
export declare function depthwiseConv2dNativeBackpropInput(args: {
    inputs: DepthwiseConv2dNativeBackpropInputInputs;
    backend: MathBackendCPU;
    attrs: DepthwiseConv2dNativeBackpropInputAttrs;
}): TensorInfo;
export declare const depthwiseConv2dNativeBackpropInputConfig: KernelConfig;