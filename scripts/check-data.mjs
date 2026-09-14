import assert from "node:assert/strict";
import {
  findNeighborhood,
  findShortestPath,
  graphValidationErrors,
  medicalLinks,
  medicalNodes,
} from "../data/medical-data.ts";

assert.deepEqual(graphValidationErrors, [], "图谱数据应通过完整性校验");
assert.equal(medicalNodes.length, 37, "演示数据实体数发生意外变化");
assert.equal(medicalLinks.length, 36, "演示数据关系数发生意外变化");

const samplePath = findShortestPath("d1", "m3");
assert.ok(samplePath, "2型糖尿病与氨氯地平之间应存在演示路径");
assert.equal(samplePath.nodeIds[0], "d1");
assert.equal(samplePath.nodeIds.at(-1), "m3");

const oneHop = findNeighborhood("d2", 1);
const twoHops = findNeighborhood("d2", 2);
assert.deepEqual([...oneHop].sort(), ["d2", "s3", "s4", "t2", "t3"], "高血压一跳邻域应保持稳定");
assert.ok(twoHops.size > oneHop.size && twoHops.has("m3"), "二跳邻域应包含降压治疗关联药物");

console.log(`Graph check passed: ${medicalNodes.length} nodes, ${medicalLinks.length} links, sample path ${samplePath.nodeIds.length - 1} hops.`);

