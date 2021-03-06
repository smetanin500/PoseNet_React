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
import './flags_webgl';
import { BackendValues, DataId, DataStorage, DataType, KernelBackend, MemoryInfo, Rank, RecursiveArray, Tensor, Tensor2D, TensorBuffer, TensorInfo, TimingInfo } from '@tensorflow/tfjs-core';
import { GPGPUContext } from './gpgpu_context';
import * as gpgpu_math from './gpgpu_math';
import { GPGPUProgram } from './gpgpu_math';
import { TextureData } from './tex_util';
import { TextureManager } from './texture_manager';
export declare const EPSILON_FLOAT32 = 1e-7;
export declare const EPSILON_FLOAT16 = 0.0001;
declare type KernelInfo = {
    name: string;
    query: Promise<number>;
};
export declare type TimerNode = RecursiveArray<KernelInfo> | KernelInfo;
export interface CPUTimerQuery {
    startMs: number;
    endMs?: number;
}
export interface WebGLMemoryInfo extends MemoryInfo {
    numBytesInGPU: number;
    numBytesInGPUAllocated: number;
    numBytesInGPUFree: number;
    unreliable: boolean;
}
export interface WebGLTimingInfo extends TimingInfo {
    uploadWaitMs: number;
    downloadWaitMs: number;
}
export declare function getBinaryCache(webGLVersion: number): {
    [key: string]: gpgpu_math.GPGPUBinary;
};
export declare class MathBackendWebGL extends KernelBackend {
    texData: DataStorage<TextureData>;
    gpgpu: GPGPUContext;
    private pendingRead;
    private pendingDisposal;
    dataRefCount: WeakMap<object, number>;
    private numBytesInGPU;
    private canvas;
    private programTimersStack;
    private activeTimers;
    private uploadWaitMs;
    private downloadWaitMs;
    private cpuBackend;
    private floatPrecisionValue;
    private textureManager;
    private binaryCache;
    private gpgpuCreatedLocally;
    private numMBBeforeWarning;
    private warnedAboutMemory;
    private warnedAboutCPUBackend;
    constructor(gpgpu?: GPGPUContext);
    numDataIds(): number;
    write(values: BackendValues, shape: number[], dtype: DataType): DataId;
    /** Increase refCount of a `TextureData`. */
    incRef(dataId: DataId): void;
    /** Decrease refCount of a `TextureData`. */
    decRef(dataId: DataId): void;
    move(dataId: DataId, values: BackendValues, shape: number[], dtype: DataType): void;
    disposeIntermediateTensorInfo(tensorInfo: TensorInfo): void;
    readSync(dataId: DataId): BackendValues;
    read(dataId: DataId): Promise<BackendValues>;
    bufferSync<R extends Rank>(t: TensorInfo): TensorBuffer<R>;
    private checkNumericalProblems;
    private getValuesFromTexture;
    time(f: () => void): Promise<WebGLTimingInfo>;
    memory(): WebGLMemoryInfo;
    private startTimer;
    private endTimer;
    private getQueryTime;
    private pendingDeletes;
    disposeData(dataId: DataId): void;
    private releaseGPUData;
    getTexture(dataId: DataId): WebGLTexture;
    /**
     * Returns internal information for the specific data bucket. Used in unit
     * tests.
     */
    getDataInfo(dataId: DataId): TextureData;
    private getCPUBackend;
    shouldExecuteOnCPU(inputs: TensorInfo[], sizeThreshold?: number): boolean;
    getGPGPUContext(): GPGPUContext;
    where(condition: Tensor): Tensor2D;
    private packedUnaryOp;
    abs<T extends Tensor>(x: T): T;
    makeTensorInfo(shape: number[], dtype: DataType, values?: BackendValues | string[]): TensorInfo;
    private makeOutput;
    private unpackTensor;
    private packTensor;
    private packedReshape;
    private decode;
    runWebGLProgram(program: GPGPUProgram, inputs: TensorInfo[], outputDtype: DataType, customSetup?: (gpgpu: GPGPUContext, webGLProgram: WebGLProgram) => void, preventEagerUnpackingOfOutput?: boolean): TensorInfo;
    compileAndRun<K extends TensorInfo>(program: GPGPUProgram, inputs: TensorInfo[], outputDtype?: DataType, customSetup?: (gpgpu: GPGPUContext, webGLProgram: WebGLProgram) => void, preventEagerUnpackingOfOutput?: boolean): K;
    private getAndSaveBinary;
    getTextureManager(): TextureManager;
    private disposed;
    dispose(): void;
    floatPrecision(): 16 | 32;
    /** Returns the smallest representable number.  */
    epsilon(): number;
    uploadToGPU(dataId: DataId): void;
    private convertAndCacheOnCPU;
    private acquireTexture;
    private computeBytes;
}
export {};
