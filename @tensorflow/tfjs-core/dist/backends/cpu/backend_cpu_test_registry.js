"use strict";
/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
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
Object.defineProperty(exports, "__esModule", { value: true });
var jasmine_util_1 = require("../../jasmine_util");
exports.CPU_ENVS = {
    predicate: function (testEnv) { return testEnv.backendName === 'cpu'; }
};
jasmine_util_1.registerTestEnv({ name: 'cpu', backendName: 'cpu', isDataSync: true });
//# sourceMappingURL=backend_cpu_test_registry.js.map