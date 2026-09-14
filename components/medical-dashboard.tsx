"use client";

import {
  ArrowRight,
  Brain,
  Clock,
  Database,
  FirstAid,
  Graph,
  MagnifyingGlass,
  Pill,
  Pulse,
  ShieldCheck,
  TrendUp,
  WarningCircle,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { KnowledgeGraph } from "@/components/knowledge-graph";
import {
  EntityType,
  RelationType,
  findNeighborhood,
  findShortestPath,
  graphUpdatedAt,
  medicalLinks,
  medicalNodes,
  typeMeta,
} from "@/data/medical-data";

const allTypes = Object.keys(typeMeta) as EntityType[];
const allRelations: RelationType[] = ["表现为", "治疗方案", "常用药", "联合用药"];
const relationEvidence: Record<RelationType, string> = {
  表现为: "该关联表示来源疾病可能呈现目标症状，需结合病史与临床检查综合判断。",
  治疗方案: "该关联表示目标方案可用于来源疾病的管理，实际治疗需要个体化评估。",
  常用药: "该关联表示目标药物属于此治疗方案的常见用药之一，须由专业医生评估后使用。",
  联合用药: "该关联表示特定治疗场景下可能联合使用，需评估禁忌证与药物相互作用。",
};

export function MedicalDashboard() {
  const [selectedId, setSelectedId] = useState("d2");
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<EntityType>>(new Set(allTypes));
  const [activeRelations, setActiveRelations] = useState<Set<RelationType>>(new Set(allRelations));
  const [focusDepth, setFocusDepth] = useState<"all" | 1 | 2>("all");
  const [query, setQuery] = useState("");
  const [clock, setClock] = useState("--:--:--");
  const [dateLabel, setDateLabel] = useState("---- / -- / -- · 上海");
  const [pathStart, setPathStart] = useState("d1");
  const [pathEnd, setPathEnd] = useState("m3");
  const [pathActive, setPathActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock(new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
      }).format(now));
      setDateLabel(`${now.getFullYear()} / ${String(now.getMonth() + 1).padStart(2, "0")} / ${String(now.getDate()).padStart(2, "0")} · 上海`);
    };
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    update();
    const timer = window.setInterval(update, 1000);
    window.addEventListener("keydown", focusSearch);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("keydown", focusSearch);
    };
  }, []);

  const selectedNode = medicalNodes.find((node) => node.id === selectedId) ?? medicalNodes[0];
  const selectedLink = medicalLinks.find((link) => link.id === selectedLinkId) ?? null;
  const selectedLinkSource = selectedLink ? medicalNodes.find((node) => node.id === selectedLink.source)! : null;
  const selectedLinkTarget = selectedLink ? medicalNodes.find((node) => node.id === selectedLink.target)! : null;
  const selectedRelations = medicalLinks
    .filter((link) =>
      activeRelations.has(link.relation) && (link.source === selectedId || link.target === selectedId),
    )
    .map((link) => ({
      ...link,
      other: medicalNodes.find((node) => node.id === (link.source === selectedId ? link.target : link.source))!,
    }));
  const searchResults = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return [];
    return medicalNodes.filter((node) =>
      [node.name, node.department, ...(node.aliases ?? [])].some((text) => text.toLowerCase().includes(keyword)),
    ).slice(0, 6);
  }, [query]);

  const typeCounts = useMemo(() => allTypes.map((type) => ({
    type,
    count: medicalNodes.filter((node) => node.type === type).length,
  })), []);
  const diseaseRanking = medicalNodes
    .filter((node) => node.type === "disease")
    .sort((a, b) => (b.caseCount ?? 0) - (a.caseCount ?? 0));
  const maxCases = diseaseRanking[0]?.caseCount ?? 1;
  const averageConfidence = Math.round(medicalLinks.reduce((sum, link) => sum + link.confidence, 0) / medicalLinks.length);
  const departmentCount = new Set(diseaseRanking.map((node) => node.department)).size;
  const totalCases = diseaseRanking.reduce((sum, node) => sum + (node.caseCount ?? 0), 0);
  const cardiovascularCases = diseaseRanking
    .filter((node) => node.department === "心血管内科")
    .reduce((sum, node) => sum + (node.caseCount ?? 0), 0);
  const cardiovascularShare = (cardiovascularCases / totalCases * 100).toFixed(1);
  const pathResult = useMemo(
    () => pathActive ? findShortestPath(pathStart, pathEnd) : null,
    [pathActive, pathStart, pathEnd],
  );
  const highlightedNodeIds = new Set(pathResult?.nodeIds ?? []);
  const highlightedLinkIds = new Set(pathResult?.linkIds ?? []);
  const pathLabel = pathResult
    ? `${Math.max(0, pathResult.nodeIds.length - 1)} 跳 · ${pathResult.nodeIds.map((id) => medicalNodes.find((node) => node.id === id)?.name).join(" → ")}`
    : "当前两实体之间不存在可达路径";
  const relationScopedLinks = useMemo(
    () => medicalLinks.filter((link) => activeRelations.has(link.relation)),
    [activeRelations],
  );
  const focusNodeIds = useMemo(
    () => focusDepth === "all" ? null : findNeighborhood(selectedId, focusDepth, relationScopedLinks),
    [focusDepth, selectedId, relationScopedLinks],
  );
  const filteredNodes = medicalNodes.filter((node) =>
    activeTypes.has(node.type) && (!focusNodeIds || focusNodeIds.has(node.id)),
  );
  const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));
  const filteredLinks = relationScopedLinks.filter((link) =>
    filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target),
  );

  const exportGraph = () => {
    const nodes = filteredNodes;
    const links = filteredLinks;
    const blob = new Blob([JSON.stringify({
      meta: { source: "interview-mock", exportedAt: new Date().toISOString() },
      nodes,
      links,
    }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "medigraph-export.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const toggleType = (type: EntityType) => {
    setActiveTypes((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  };

  const toggleRelation = (relation: RelationType) => {
    if (selectedLink?.relation === relation && activeRelations.has(relation)) setSelectedLinkId(null);
    setActiveRelations((current) => {
      const next = new Set(current);
      if (next.has(relation)) next.delete(relation); else next.add(relation);
      return next;
    });
    setPathActive(false);
  };

  const selectNode = (id: string) => {
    setSelectedId(id);
    setSelectedLinkId(null);
  };

  const selectFromSearch = (id: string) => {
    selectNode(id);
    setQuery("");
    const node = medicalNodes.find((item) => item.id === id);
    if (node && !activeTypes.has(node.type)) setActiveTypes((current) => new Set([...current, node.type]));
  };

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark"><Pulse size={26} weight="bold" /></div>
          <div>
            <div className="brand-name">MEDIGRAPH</div>
            <p>医疗知识关联分析平台</p>
          </div>
        </div>
        <div className="topbar-center" aria-label="演示数据状态">
          <span><i className="status-dot" /> 知识库运行正常</span>
          <span className="topbar-divider" />
          <span>INTERVIEW DEMO · MOCK DATA</span>
        </div>
        <div className="time-block">
          <strong>{clock}</strong>
          <span>{dateLabel}</span>
        </div>
      </header>

      <section className="hero-row">
        <div>
          <p className="section-kicker"><Graph size={16} /> KNOWLEDGE COMMAND CENTER</p>
          <h1>医疗知识图谱<span>态势总览</span></h1>
          <p className="hero-copy">从病名出发，穿透症状、治疗方案与常用药物，快速发现实体之间的医学关联。</p>
        </div>
        <div className="search-wrap">
          <MagnifyingGlass size={19} />
          <input
            ref={searchInputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索疾病、症状、治疗或药物"
            aria-label="搜索医疗实体"
          />
          <kbd>Ctrl K</kbd>
          {query && (
            <div className="search-results">
              {searchResults.length ? searchResults.map((node) => (
                <button key={node.id} onClick={() => selectFromSearch(node.id)}>
                  <span style={{ background: typeMeta[node.type].color }} />
                  <div><strong>{node.name}</strong><small>{typeMeta[node.type].label} · {node.department}</small></div>
                  <ArrowRight size={15} />
                </button>
              )) : <p>未找到相关实体</p>}
            </div>
          )}
        </div>
      </section>

      <section className="metric-strip" aria-label="核心数据指标">
        <Metric icon={<Database />} label="知识实体" value={medicalNodes.length} suffix="个" note="4 类结构化实体" />
        <Metric icon={<Graph />} label="关系三元组" value={medicalLinks.length} suffix="条" note="Mock 数据集 v1.0" />
        <Metric icon={<FirstAid />} label="覆盖病种" value={diseaseRanking.length} suffix="种" note={`${departmentCount} 个临床科室`} />
        <Metric icon={<ShieldCheck />} label="平均置信度" value={averageConfidence} suffix="%" note="规则校验已通过" positive />
      </section>

      <section className="workspace-grid">
        <aside className="panel ranking-panel">
          <PanelHead icon={<TrendUp />} title="病种热度排行" sub="模拟病例关联量" />
          <div className="ranking-list">
            {diseaseRanking.map((node, index) => (
              <button key={node.id} className={node.id === selectedId ? "is-current" : ""} onClick={() => selectNode(node.id)}>
                <span className="rank-index">{String(index + 1).padStart(2, "0")}</span>
                <div className="rank-main">
                  <div><strong>{node.name}</strong><em>{node.caseCount?.toLocaleString()}</em></div>
                  <span><i style={{ width: `${((node.caseCount ?? 0) / maxCases) * 100}%` }} /></span>
                </div>
              </button>
            ))}
          </div>
          <div className="mini-insight">
            <Pulse size={20} />
            <p><strong>心血管关联占比最高</strong><span>高血压与冠心病共占模拟病例关联量的 {cardiovascularShare}%</span></p>
          </div>
        </aside>

        <section className="panel graph-panel">
          <div className="graph-toolbar">
            <div className="graph-toolbar-title">
              <h2>实体关系网络</h2>
              <span>{filteredNodes.length} 个实体 · {filteredLinks.length} 条关系</span>
            </div>
            <div className="graph-filter-stack">
              <div className="type-filters">
                <span className="filter-label">实体</span>
                {allTypes.map((type) => (
                  <button
                    key={type}
                    className={activeTypes.has(type) ? "is-active" : ""}
                    aria-pressed={activeTypes.has(type)}
                    onClick={() => toggleType(type)}
                    style={{ "--type-color": typeMeta[type].color } as React.CSSProperties}
                  >
                    <i />{typeMeta[type].label}<small>{typeCounts.find((item) => item.type === type)?.count}</small>
                  </button>
                ))}
                <button className="export-data" onClick={exportGraph} aria-label="导出当前子图 JSON">
                  <Database size={13} />导出
                </button>
              </div>
              <div className="relation-filter-row">
                <span className="filter-label">关系</span>
                <button
                  className={activeRelations.size === allRelations.length ? "is-active" : ""}
                  onClick={() => { setActiveRelations(new Set(allRelations)); setPathActive(false); }}
                >全部</button>
                {allRelations.map((relation) => (
                  <button
                    key={relation}
                    className={activeRelations.has(relation) ? "is-active" : ""}
                    aria-pressed={activeRelations.has(relation)}
                    onClick={() => toggleRelation(relation)}
                  >{relation}<small>{medicalLinks.filter((link) => link.relation === relation).length}</small></button>
                ))}
                <div className="focus-controls" aria-label="邻域聚焦范围">
                  <span>聚焦</span>
                  {(["all", 1, 2] as const).map((depth) => (
                    <button
                      key={depth}
                      className={focusDepth === depth ? "is-active" : ""}
                      aria-pressed={focusDepth === depth}
                      onClick={() => { setFocusDepth(depth); setPathActive(false); }}
                    >{depth === "all" ? "全图" : `${depth} 跳`}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <KnowledgeGraph
            nodes={medicalNodes}
            links={medicalLinks}
            activeTypes={activeTypes}
            activeRelations={activeRelations}
            focusNodeIds={focusNodeIds}
            selectedId={selectedId}
            selectedLinkId={selectedLinkId}
            highlightedNodeIds={highlightedNodeIds}
            highlightedLinkIds={highlightedLinkIds}
            onSelect={selectNode}
            onSelectLink={setSelectedLinkId}
          />
          <div className={`path-console ${pathActive ? "is-active" : ""}`}>
            <div className="path-title">
              <Graph size={17} />
              <span><strong>最短路径分析</strong><small>{pathActive ? pathLabel : "选择两端实体，发现多跳关联"}</small></span>
            </div>
            <div className="path-controls">
              <select value={pathStart} onChange={(event) => { setPathStart(event.target.value); setPathActive(true); }} aria-label="路径起点">
                {medicalNodes.map((node) => <option key={node.id} value={node.id}>{node.name}</option>)}
              </select>
              <ArrowRight size={13} />
              <select value={pathEnd} onChange={(event) => { setPathEnd(event.target.value); setPathActive(true); }} aria-label="路径终点">
                {medicalNodes.map((node) => <option key={node.id} value={node.id}>{node.name}</option>)}
              </select>
              <button onClick={() => {
                setPathActive((current) => !current);
                setActiveTypes(new Set(allTypes));
                setActiveRelations(new Set(allRelations));
                setFocusDepth("all");
                setSelectedLinkId(null);
              }}>{pathActive ? "结束" : "分析"}</button>
            </div>
          </div>
        </section>

        <aside className="panel detail-panel">
          <PanelHead
            icon={<Brain />}
            title={selectedLink ? "关系证据" : "实体洞察"}
            sub={selectedLink ? "可解释关系三元组" : "点击图谱节点查看"}
          />
          {selectedLink && selectedLinkSource && selectedLinkTarget ? (
            <>
              <div className="entity-heading relation-heading">
                <span className="entity-type relation-type">关系三元组</span>
                <h2>{selectedLink.relation}</h2>
                <p>{selectedLink.id.toUpperCase()} · 有向语义关系</p>
              </div>
              <div className="confidence-row">
                <span>关系置信度</span><strong>{selectedLink.confidence}%</strong>
                <i><b style={{ width: `${selectedLink.confidence}%` }} /></i>
              </div>
              <p className="entity-description">{relationEvidence[selectedLink.relation]}</p>
              <div className="entity-meta"><span>证据来源</span><strong>Mock 临床规则库 v1.0</strong></div>
              <div className="fact-block relation-triple">
                <h3>语义三元组</h3>
                <button onClick={() => selectNode(selectedLinkSource.id)}>
                  <small>主体 · {typeMeta[selectedLinkSource.type].label}</small>
                  <strong>{selectedLinkSource.name}</strong>
                </button>
                <div><ArrowRight size={13} /><span>{selectedLink.relation}</span><ArrowRight size={13} /></div>
                <button onClick={() => selectNode(selectedLinkTarget.id)}>
                  <small>客体 · {typeMeta[selectedLinkTarget.type].label}</small>
                  <strong>{selectedLinkTarget.name}</strong>
                </button>
              </div>
              <div className="relation-block relation-evidence">
                <div><h3>溯源信息</h3><span>已校验</span></div>
                <p><ShieldCheck size={15} />结构完整性与置信度范围校验通过</p>
                <p><Clock size={15} />最后更新 {graphUpdatedAt}</p>
                <small>演示数据仅用于界面与图谱能力展示，不构成医疗建议。</small>
              </div>
            </>
          ) : (
            <>
              <div className="entity-heading">
                <span className="entity-type" style={{ color: typeMeta[selectedNode.type].color, background: typeMeta[selectedNode.type].soft }}>
                  {typeMeta[selectedNode.type].label}
                </span>
                <h2>{selectedNode.name}</h2>
                <p>{selectedNode.aliases?.join(" / ") || selectedNode.department}</p>
              </div>
              <div className="confidence-row">
                <span>知识置信度</span><strong>{selectedNode.confidence}%</strong>
                <i><b style={{ width: `${selectedNode.confidence}%` }} /></i>
              </div>
              <p className="entity-description">{selectedNode.description}</p>
              <div className="entity-meta"><span>归属科室</span><strong>{selectedNode.department}</strong></div>
              <div className="fact-block">
                <h3>关键知识</h3>
                {selectedNode.facts.map((fact) => <p key={fact}><ShieldCheck size={15} />{fact}</p>)}
              </div>
              <div className="relation-block">
                <div><h3>直接关系</h3><span>{selectedRelations.length} 条</span></div>
                {selectedRelations.slice(0, 5).map((relation) => (
                  <button key={relation.id} onClick={() => selectNode(relation.other.id)}>
                    <i style={{ background: typeMeta[relation.other.type].color }} />
                    <span><strong>{relation.other.name}</strong><small>{relation.relation} · {relation.confidence}%</small></span>
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>
      </section>

      <section className="bottom-grid">
        <article className="panel distribution-panel">
          <PanelHead icon={<Database />} title="知识库构成" sub={`最后更新 ${graphUpdatedAt}`} />
          <div className="distribution-content">
            <div className="donut" style={{ background: "conic-gradient(#e66b4d 0 16%, #f2b84b 16% 51%, #29b8a6 51% 70%, #7f9cf5 70% 100%)" }}>
              <div><strong>{medicalNodes.length}</strong><span>实体总量</span></div>
            </div>
            <div className="distribution-legend">
              {typeCounts.map(({ type, count }) => (
                <div key={type}><i style={{ background: typeMeta[type].color }} /><span>{typeMeta[type].label}</span><strong>{count}</strong><em>{Math.round(count / medicalNodes.length * 100)}%</em></div>
              ))}
            </div>
          </div>
        </article>

        <article className="panel quality-panel">
          <PanelHead icon={<ShieldCheck />} title="数据质量监测" sub="自动校验规则" />
          <div className="quality-stats">
            <div><span>实体完整率</span><strong>98.2%</strong><i><b style={{ width: "98.2%" }} /></i></div>
            <div><span>关系一致率</span><strong>96.7%</strong><i><b style={{ width: "96.7%" }} /></i></div>
            <div><span>字段规范率</span><strong>100%</strong><i><b style={{ width: "100%" }} /></i></div>
          </div>
        </article>

        <article className="panel notice-panel">
          <PanelHead icon={<WarningCircle />} title="使用说明" sub="安全边界" />
          <div className="notice-body">
            <div className="notice-icon"><Pill size={22} /></div>
            <p><strong>本页面为面试演示作品</strong><span>所有病例量、置信度与关系权重均为 Mock 数据，不构成诊断或用药建议。</span></p>
          </div>
        </article>
      </section>

      <footer>
        <span><i className="status-dot" /> MOCK KNOWLEDGE ENGINE ONLINE</span>
        <p>Next.js App Router · TypeScript · Native SVG</p>
        <span><Clock size={14} /> 数据批次 KG-20260914-A</span>
      </footer>
    </main>
  );
}

function Metric({ icon, label, value, suffix, note, positive = false }: { icon: React.ReactNode; label: string; value: number; suffix: string; note: string; positive?: boolean }) {
  return (
    <article className="metric-item">
      <div className="metric-icon">{icon}</div>
      <div><span>{label}</span><p><strong>{value}</strong><em>{suffix}</em></p><small className={positive ? "positive" : ""}>{positive && "↑ "}{note}</small></div>
    </article>
  );
}

function PanelHead({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return <div className="panel-head"><span>{icon}</span><div><h2>{title}</h2><p>{sub}</p></div></div>;
}





