"use client";

import { Minus, Plus, Scan, X } from "@phosphor-icons/react";
import { useMemo, useRef, useState } from "react";
import { EntityType, MedicalLink, MedicalNode, RelationType, typeMeta } from "@/data/medical-data";

type Props = {
  nodes: MedicalNode[];
  links: MedicalLink[];
  activeTypes: Set<EntityType>;
  activeRelations: Set<RelationType>;
  focusNodeIds: Set<string> | null;
  selectedId: string;
  selectedLinkId: string | null;
  highlightedNodeIds: Set<string>;
  highlightedLinkIds: Set<string>;
  onSelect: (id: string) => void;
  onSelectLink: (id: string) => void;
};

const nodeRadius = (node: MedicalNode) => (node.type === "disease" ? 24 : 17);

export function KnowledgeGraph({
  nodes,
  links,
  activeTypes,
  activeRelations,
  focusNodeIds,
  selectedId,
  selectedLinkId,
  highlightedNodeIds,
  highlightedLinkIds,
  onSelect,
  onSelectLink,
}: Props) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const dragRef = useRef<{ id: string; startX: number; startY: number; originX: number; originY: number; unitX: number; unitY: number } | null>(null);
  const panRef = useRef<{ startX: number; startY: number; originX: number; originY: number; unitX: number; unitY: number } | null>(null);

  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const visibleNodes = useMemo(
    () => nodes.filter((node) => activeTypes.has(node.type) && (!focusNodeIds || focusNodeIds.has(node.id))),
    [nodes, activeTypes, focusNodeIds],
  );
  const visibleIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);
  const visibleLinks = useMemo(
    () => links.filter((link) =>
      activeRelations.has(link.relation) && visibleIds.has(link.source) && visibleIds.has(link.target),
    ),
    [links, activeRelations, visibleIds],
  );
  const connectedIds = useMemo(() => {
    const ids = new Set([selectedId]);
    visibleLinks.forEach((link) => {
      if (link.source === selectedId) ids.add(link.target);
      if (link.target === selectedId) ids.add(link.source);
    });
    return ids;
  }, [visibleLinks, selectedId]);
  const focusIds = highlightedNodeIds.size ? highlightedNodeIds : focusNodeIds ?? connectedIds;

  const point = (node: MedicalNode) => positions[node.id] ?? { x: node.x, y: node.y };
  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setPositions({});
  };

  return (
    <div className="graph-stage" aria-label="可交互医疗知识图谱">
      <div className="graph-actions" aria-label="图谱视图控制">
        <button onClick={() => setScale((value) => Math.min(1.45, value + 0.12))} aria-label="放大图谱"><Plus size={16} /></button>
        <button onClick={() => setScale((value) => Math.max(0.72, value - 0.12))} aria-label="缩小图谱"><Minus size={16} /></button>
        <button onClick={resetView} aria-label="重置图谱"><Scan size={16} /></button>
      </div>

      {visibleNodes.length === 0 ? (
        <div className="graph-empty">
          <X size={26} />
          <strong>没有可显示的实体</strong>
          <span>请在上方重新勾选至少一种实体类型</span>
        </div>
      ) : (
        <svg
          viewBox="0 0 960 570"
          role="img"
          aria-labelledby="graph-title"
          className={isPanning ? "is-panning" : ""}
          onPointerDown={(event) => {
            if (event.button !== 0 || (event.target as Element).closest(".graph-node, .graph-link")) return;
            const rect = event.currentTarget.getBoundingClientRect();
            event.currentTarget.setPointerCapture(event.pointerId);
            panRef.current = {
              startX: event.clientX,
              startY: event.clientY,
              originX: offset.x,
              originY: offset.y,
              unitX: 960 / rect.width,
              unitY: 570 / rect.height,
            };
            setIsPanning(true);
          }}
          onPointerMove={(event) => {
            const pan = panRef.current;
            if (!pan) return;
            setOffset({
              x: pan.originX + (event.clientX - pan.startX) * pan.unitX,
              y: pan.originY + (event.clientY - pan.startY) * pan.unitY,
            });
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            panRef.current = null;
            setIsPanning(false);
          }}
          onPointerCancel={() => {
            panRef.current = null;
            setIsPanning(false);
          }}
        >
          <title id="graph-title">疾病、症状、治疗和药物之间的关系网络</title>
          <defs>
            <filter id="node-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <pattern id="graph-grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#2b806a" strokeOpacity="0.07" strokeWidth="1" />
            </pattern>
            <marker id="arrow-default" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 8 4 L 0 8 z" fill="#72978c" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 8 4 L 0 8 z" fill="#29b8a6" />
            </marker>
          </defs>
          <rect width="960" height="570" fill="url(#graph-grid)" />
          <g transform={`translate(${offset.x} ${offset.y}) scale(${scale})`}>
            {visibleLinks.map((link) => {
              const source = nodeMap.get(link.source)!;
              const target = nodeMap.get(link.target)!;
              const a = point(source);
              const b = point(target);
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const length = Math.hypot(dx, dy) || 1;
              const sourceInset = nodeRadius(source) + 2;
              const targetInset = nodeRadius(target) + 5;
              const x1 = a.x + (dx / length) * sourceInset;
              const y1 = a.y + (dy / length) * sourceInset;
              const x2 = b.x - (dx / length) * targetInset;
              const y2 = b.y - (dy / length) * targetInset;
              const onPath = highlightedLinkIds.has(link.id);
              const selected = link.id === selectedLinkId;
              const highlighted = selected || onPath || link.source === selectedId || link.target === selectedId;
              return (
                <g
                  key={link.id}
                  className={`graph-link ${highlighted ? "is-active" : ""} ${selected ? "is-selected" : ""} ${onPath ? "is-path" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${source.name} ${link.relation} ${target.name}，置信度 ${link.confidence}%`}
                  onClick={(event) => { event.stopPropagation(); onSelectLink(link.id); }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectLink(link.id);
                    }
                  }}
                >
                  <line className="graph-link-hit" x1={x1} y1={y1} x2={x2} y2={y2} />
                  <line className="graph-link-visible" x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={`url(#${highlighted ? "arrow-active" : "arrow-default"})`} />
                  {highlighted && (
                    <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 7} textAnchor="middle">
                      {link.relation}
                    </text>
                  )}
                </g>
              );
            })}
            {visibleNodes.map((node) => {
              const { x, y } = point(node);
              const active = node.id === selectedId;
              const onPath = highlightedNodeIds.has(node.id);
              const muted = !focusIds.has(node.id);
              const radius = nodeRadius(node);
              return (
                <g
                  key={node.id}
                  className={`graph-node ${active ? "is-selected" : ""} ${onPath ? "is-path" : ""} ${muted ? "is-muted" : ""}`}
                  transform={`translate(${x} ${y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${typeMeta[node.type].label}：${node.name}`}
                  onClick={() => onSelect(node.id)}
                  onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect(node.id); }}
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    const rect = event.currentTarget.ownerSVGElement!.getBoundingClientRect();
                    dragRef.current = {
                      id: node.id,
                      startX: event.clientX,
                      startY: event.clientY,
                      originX: x,
                      originY: y,
                      unitX: 960 / rect.width,
                      unitY: 570 / rect.height,
                    };
                  }}
                  onPointerMove={(event) => {
                    const drag = dragRef.current;
                    if (!drag || drag.id !== node.id) return;
                    setPositions((current) => ({
                      ...current,
                      [node.id]: {
                        x: drag.originX + (event.clientX - drag.startX) * drag.unitX / scale,
                        y: drag.originY + (event.clientY - drag.startY) * drag.unitY / scale,
                      },
                    }));
                  }}
                  onPointerUp={() => { dragRef.current = null; }}
                  onPointerCancel={() => { dragRef.current = null; }}
                >
                  {(active || onPath) && <circle r={radius + 11} fill="none" stroke={typeMeta[node.type].color} strokeOpacity=".32" strokeWidth="2" />}
                  <circle
                    r={radius}
                    fill={typeMeta[node.type].soft}
                    stroke={typeMeta[node.type].color}
                    strokeWidth={active || onPath ? 2.5 : 1.4}
                    filter={active || onPath ? "url(#node-glow)" : undefined}
                  />
                  <circle r={node.type === "disease" ? 6 : 4} fill={typeMeta[node.type].color} />
                  <text y={radius + 17} textAnchor="middle">{node.name}</text>
                </g>
              );
            })}
          </g>
        </svg>
      )}
      <div className="graph-hint">点击关系线查看证据 · 拖拽空白平移画布 · 拖拽节点调整位置</div>
    </div>
  );
}
