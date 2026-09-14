export type EntityType = "disease" | "symptom" | "treatment" | "drug";
export type RelationType = "表现为" | "治疗方案" | "常用药" | "联合用药";

export type MedicalNode = {
  id: string;
  name: string;
  type: EntityType;
  x: number;
  y: number;
  description: string;
  department: string;
  aliases?: string[];
  caseCount?: number;
  confidence: number;
  facts: string[];
};

export type MedicalLink = {
  id: string;
  source: string;
  target: string;
  relation: RelationType;
  confidence: number;
};

export const typeMeta: Record<EntityType, { label: string; color: string; soft: string }> = {
  disease: { label: "疾病", color: "#dc6849", soft: "#fff0eb" },
  symptom: { label: "症状", color: "#d99a24", soft: "#fff7e3" },
  treatment: { label: "治疗", color: "#0f9f6e", soft: "#e8f5ef" },
  drug: { label: "药物", color: "#5f7fdc", soft: "#eef2ff" },
};

export const medicalNodes: MedicalNode[] = [
  { id: "d1", name: "2型糖尿病", type: "disease", x: 255, y: 175, description: "以胰岛素抵抗和相对胰岛素分泌不足为主要特征的慢性代谢性疾病。", department: "内分泌科", aliases: ["T2DM", "成人发病型糖尿病"], caseCount: 1280, confidence: 96, facts: ["需持续监测血糖与糖化血红蛋白", "治疗通常结合生活方式干预", "用药方案需考虑心肾功能"] },
  { id: "d2", name: "高血压", type: "disease", x: 490, y: 145, description: "以体循环动脉血压持续升高为主要表现的心血管综合征。", department: "心血管内科", aliases: ["原发性高血压"], caseCount: 1960, confidence: 98, facts: ["早期可无明显症状", "长期管理强调家庭血压监测", "常与代谢性疾病共存"] },
  { id: "d3", name: "冠心病", type: "disease", x: 725, y: 215, description: "冠状动脉粥样硬化导致血管狭窄或阻塞，引起心肌缺血缺氧。", department: "心血管内科", aliases: ["冠状动脉粥样硬化性心脏病", "CHD"], caseCount: 760, confidence: 95, facts: ["胸痛性质与活动相关性是重要线索", "危险分层影响治疗策略", "急性胸痛应及时就医"] },
  { id: "d4", name: "慢阻肺", type: "disease", x: 230, y: 385, description: "以持续气流受限和呼吸道症状为特征的常见慢性呼吸系统疾病。", department: "呼吸内科", aliases: ["慢性阻塞性肺疾病", "COPD"], caseCount: 540, confidence: 94, facts: ["肺功能检查用于确认持续气流受限", "戒烟是重要干预措施", "稳定期管理重视吸入治疗"] },
  { id: "d5", name: "偏头痛", type: "disease", x: 505, y: 405, description: "一种反复发作的神经血管性头痛，部分患者伴有先兆。", department: "神经内科", aliases: ["血管性头痛"], caseCount: 690, confidence: 93, facts: ["常伴恶心或畏光", "需识别个体化诱发因素", "治疗分急性期与预防性管理"] },
  { id: "d6", name: "慢性胃炎", type: "disease", x: 755, y: 395, description: "由多种病因引起的胃黏膜慢性炎症，可表现为上腹不适等症状。", department: "消化内科", aliases: ["慢性胃黏膜炎"], caseCount: 820, confidence: 92, facts: ["症状与病理严重程度不总是一致", "可根据情况评估幽门螺杆菌", "避免长期自行使用刺激胃黏膜的药物"] },

  { id: "s1", name: "口渴多饮", type: "symptom", x: 85, y: 92, description: "饮水需求明显增加，可见于血糖升高等情况。", department: "内分泌科", confidence: 91, facts: ["需结合尿量、血糖与病程判断"] },
  { id: "s2", name: "乏力", type: "symptom", x: 120, y: 210, description: "主观精力不足或活动耐力下降，病因较多。", department: "全科", confidence: 84, facts: ["属于非特异性症状，需结合其他线索"] },
  { id: "s3", name: "头晕", type: "symptom", x: 390, y: 48, description: "空间定向或平衡感异常的主观感受。", department: "神经内科", confidence: 82, facts: ["可能与血压、前庭或神经系统因素有关"] },
  { id: "s4", name: "头痛", type: "symptom", x: 555, y: 46, description: "头颅局部或弥漫性疼痛，是多种疾病的共同表现。", department: "神经内科", confidence: 87, facts: ["突然发生的剧烈头痛需及时评估"] },
  { id: "s5", name: "胸闷", type: "symptom", x: 695, y: 70, description: "胸部憋闷或呼吸不畅的主观感受。", department: "心血管内科", confidence: 88, facts: ["需结合心电图、诱因与伴随症状判断"] },
  { id: "s6", name: "胸痛", type: "symptom", x: 865, y: 120, description: "胸部疼痛，可由心血管、呼吸、消化等系统疾病引起。", department: "急诊 / 心内科", confidence: 93, facts: ["持续或压榨性胸痛应及时就医"] },
  { id: "s7", name: "呼吸困难", type: "symptom", x: 905, y: 248, description: "呼吸费力、空气不足或气短的主观感受。", department: "呼吸内科", confidence: 92, facts: ["静息状态明显气促需尽快评估"] },
  { id: "s8", name: "慢性咳嗽", type: "symptom", x: 70, y: 345, description: "持续时间较长的咳嗽，常见于慢性气道疾病。", department: "呼吸内科", confidence: 89, facts: ["需结合吸烟史、胸部影像与肺功能"] },
  { id: "s9", name: "咳痰", type: "symptom", x: 85, y: 475, description: "气道分泌物经咳嗽排出。", department: "呼吸内科", confidence: 86, facts: ["痰液颜色改变可提示感染可能"] },
  { id: "s10", name: "恶心", type: "symptom", x: 385, y: 505, description: "上腹不适并伴有欲吐感，可见于消化或神经系统疾病。", department: "消化内科", confidence: 81, facts: ["需结合疼痛部位与伴随症状"] },
  { id: "s11", name: "畏光", type: "symptom", x: 555, y: 525, description: "对正常光线感到不适，常伴随某些类型头痛。", department: "神经内科", confidence: 88, facts: ["偏头痛发作时较常见"] },
  { id: "s12", name: "上腹不适", type: "symptom", x: 790, y: 515, description: "上腹部隐痛、胀满或不适感。", department: "消化内科", confidence: 86, facts: ["症状持续时可考虑消化专科评估"] },
  { id: "s13", name: "反酸", type: "symptom", x: 920, y: 455, description: "胃内容物反流至食管或口腔产生酸感。", department: "消化内科", confidence: 83, facts: ["与饮食、体位和胃食管功能相关"] },

  { id: "t1", name: "血糖综合管理", type: "treatment", x: 175, y: 102, description: "包括饮食、运动、监测与个体化降糖方案的综合管理。", department: "内分泌科", confidence: 95, facts: ["管理目标需根据个体情况制定"] },
  { id: "t2", name: "生活方式干预", type: "treatment", x: 365, y: 155, description: "通过饮食、运动、体重与行为管理改善健康风险。", department: "多学科", confidence: 97, facts: ["适用于多类慢性疾病的基础管理"] },
  { id: "t3", name: "降压治疗", type: "treatment", x: 585, y: 125, description: "结合风险分层进行生活方式与药物降压管理。", department: "心血管内科", confidence: 96, facts: ["需要规律监测并评估靶器官风险"] },
  { id: "t4", name: "冠脉综合治疗", type: "treatment", x: 785, y: 305, description: "包含危险因素控制、药物治疗及必要时血运重建。", department: "心血管内科", confidence: 94, facts: ["具体方案取决于缺血风险与病变情况"] },
  { id: "t5", name: "肺康复", type: "treatment", x: 320, y: 345, description: "以运动训练、呼吸训练和健康教育为核心的综合干预。", department: "呼吸内科", confidence: 91, facts: ["可改善运动耐力与生活质量"] },
  { id: "t6", name: "偏头痛管理", type: "treatment", x: 620, y: 360, description: "包括诱因管理、急性期治疗和必要时预防治疗。", department: "神经内科", confidence: 92, facts: ["避免过度使用急性止痛药"] },
  { id: "t7", name: "抑酸与黏膜保护", type: "treatment", x: 845, y: 370, description: "根据病因和症状选择抑酸或胃黏膜保护治疗。", department: "消化内科", confidence: 90, facts: ["应先明确病因并遵医嘱用药"] },

  { id: "m1", name: "二甲双胍", type: "drug", x: 160, y: 35, description: "常用口服降糖药，主要改善肝糖输出和胰岛素敏感性。", department: "内分泌科", confidence: 96, facts: ["具体使用需评估肾功能等因素"] },
  { id: "m2", name: "恩格列净", type: "drug", x: 290, y: 72, description: "SGLT2 抑制剂类降糖药。", department: "内分泌科", confidence: 91, facts: ["使用前需由医生评估适应证与风险"] },
  { id: "m3", name: "氨氯地平", type: "drug", x: 510, y: 80, description: "钙通道阻滞剂类降压药。", department: "心血管内科", confidence: 94, facts: ["可能出现外周水肿等不良反应"] },
  { id: "m4", name: "缬沙坦", type: "drug", x: 625, y: 52, description: "血管紧张素受体阻滞剂类药物。", department: "心血管内科", confidence: 93, facts: ["需结合血压、肾功能与血钾评估"] },
  { id: "m5", name: "阿司匹林", type: "drug", x: 820, y: 190, description: "抗血小板药，在特定心血管适应证中使用。", department: "心血管内科", confidence: 95, facts: ["存在出血风险，不应自行长期服用"] },
  { id: "m6", name: "阿托伐他汀", type: "drug", x: 880, y: 330, description: "他汀类调脂药，用于特定人群的心血管风险管理。", department: "心血管内科", confidence: 94, facts: ["用药期间需按医嘱随访"] },
  { id: "m7", name: "沙丁胺醇", type: "drug", x: 145, y: 410, description: "短效支气管扩张剂，可用于缓解支气管痉挛。", department: "呼吸内科", confidence: 90, facts: ["频繁依赖缓解药提示需重新评估方案"] },
  { id: "m8", name: "噻托溴铵", type: "drug", x: 225, y: 520, description: "长效抗胆碱能支气管扩张剂。", department: "呼吸内科", confidence: 91, facts: ["常用于慢性气道疾病稳定期管理"] },
  { id: "m9", name: "舒马曲普坦", type: "drug", x: 465, y: 470, description: "曲普坦类药物，用于部分偏头痛患者的急性期治疗。", department: "神经内科", confidence: 88, facts: ["存在心血管禁忌证，需遵医嘱"] },
  { id: "m10", name: "奥美拉唑", type: "drug", x: 690, y: 500, description: "质子泵抑制剂类抑酸药。", department: "消化内科", confidence: 93, facts: ["长期使用应评估必要性"] },
  { id: "m11", name: "瑞巴派特", type: "drug", x: 900, y: 530, description: "胃黏膜保护药物。", department: "消化内科", confidence: 87, facts: ["具体用药以医生诊断为依据"] },
];

const links: Array<[string, string, MedicalLink["relation"], number]> = [
  ["d1", "s1", "表现为", 94], ["d1", "s2", "表现为", 84], ["d1", "t1", "治疗方案", 97], ["d1", "t2", "治疗方案", 95], ["t1", "m1", "常用药", 96], ["t1", "m2", "常用药", 90],
  ["d2", "s3", "表现为", 73], ["d2", "s4", "表现为", 70], ["d2", "t2", "治疗方案", 95], ["d2", "t3", "治疗方案", 98], ["t3", "m3", "常用药", 94], ["t3", "m4", "常用药", 93],
  ["d3", "s5", "表现为", 88], ["d3", "s6", "表现为", 95], ["d3", "s7", "表现为", 82], ["d3", "t4", "治疗方案", 96], ["t4", "m5", "常用药", 95], ["t4", "m6", "联合用药", 93],
  ["d4", "s7", "表现为", 89], ["d4", "s8", "表现为", 95], ["d4", "s9", "表现为", 90], ["d4", "t2", "治疗方案", 88], ["d4", "t5", "治疗方案", 94], ["t5", "m7", "常用药", 89], ["t5", "m8", "常用药", 93],
  ["d5", "s4", "表现为", 97], ["d5", "s10", "表现为", 86], ["d5", "s11", "表现为", 91], ["d5", "t6", "治疗方案", 95], ["t6", "m9", "常用药", 90],
  ["d6", "s10", "表现为", 78], ["d6", "s12", "表现为", 91], ["d6", "s13", "表现为", 74], ["d6", "t7", "治疗方案", 92], ["t7", "m10", "常用药", 94], ["t7", "m11", "常用药", 86],
];

export const medicalLinks: MedicalLink[] = links.map(([source, target, relation, confidence], index) => ({
  id: `r${index + 1}`,
  source,
  target,
  relation,
  confidence,
}));

export const graphUpdatedAt = "2026-09-14 10:30";

export const getNodeById = (id: string) => medicalNodes.find((node) => node.id === id);

export type GraphPath = { nodeIds: string[]; linkIds: string[] };

export function findShortestPath(startId: string, endId: string): GraphPath | null {
  if (startId === endId) return { nodeIds: [startId], linkIds: [] };

  const queue = [startId];
  const visited = new Set(queue);
  const previous = new Map<string, { nodeId: string; linkId: string }>();

  while (queue.length) {
    const current = queue.shift()!;
    for (const link of medicalLinks) {
      const next = link.source === current ? link.target : link.target === current ? link.source : null;
      if (!next || visited.has(next)) continue;
      visited.add(next);
      previous.set(next, { nodeId: current, linkId: link.id });
      if (next === endId) {
        const nodeIds = [endId];
        const linkIds: string[] = [];
        let cursor = endId;
        while (cursor !== startId) {
          const step = previous.get(cursor)!;
          linkIds.unshift(step.linkId);
          nodeIds.unshift(step.nodeId);
          cursor = step.nodeId;
        }
        return { nodeIds, linkIds };
      }
      queue.push(next);
    }
  }

  return null;
}

export function findNeighborhood(centerId: string, depth: 1 | 2, links: readonly MedicalLink[] = medicalLinks) {
  const nodeIds = new Set([centerId]);
  let frontier = new Set([centerId]);

  for (let hop = 0; hop < depth; hop += 1) {
    const next = new Set<string>();
    for (const link of links) {
      if (frontier.has(link.source) && !nodeIds.has(link.target)) next.add(link.target);
      if (frontier.has(link.target) && !nodeIds.has(link.source)) next.add(link.source);
    }
    next.forEach((id) => nodeIds.add(id));
    frontier = next;
  }

  return nodeIds;
}

function validateGraph() {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const node of medicalNodes) {
    if (ids.has(node.id)) errors.push(`重复节点 ID: ${node.id}`);
    ids.add(node.id);
    if (node.confidence < 0 || node.confidence > 100) errors.push(`节点置信度越界: ${node.id}`);
  }
  for (const link of medicalLinks) {
    if (!ids.has(link.source) || !ids.has(link.target)) errors.push(`关系引用不存在节点: ${link.id}`);
    if (link.source === link.target) errors.push(`关系不应自连接: ${link.id}`);
    if (link.confidence < 0 || link.confidence > 100) errors.push(`关系置信度越界: ${link.id}`);
  }
  return errors;
}

export const graphValidationErrors = validateGraph();
if (graphValidationErrors.length) throw new Error(`医疗图谱数据校验失败：${graphValidationErrors.join("；")}`);



